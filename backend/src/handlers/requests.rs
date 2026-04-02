use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

use crate::config::AppState;
use crate::middleware::auth::AuthUser;
use crate::models::request::*;
use crate::models::workflow::WorkflowStep;

/// POST /api/requests
/// Employee submits a new workflow request (e.g., leave request).
pub async fn create_request(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(body): Json<CreateRequestPayload>,
) -> impl IntoResponse {
    // Verify workflow belongs to tenant
    let wf_exists = sqlx::query_scalar::<_, String>(
        "SELECT id FROM workflow_definitions WHERE id = ?1 AND tenant_id = ?2",
    )
    .bind(&body.workflow_id)
    .bind(&auth.tenant_id)
    .fetch_optional(&state.db)
    .await;

    if let Ok(None) | Err(_) = wf_exists {
        return (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"error": "Workflow not found in your tenant"})),
        );
    }

    let request_id = uuid::Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO requests (id, tenant_id, workflow_id, created_by, title, description, current_step, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1, 'pending')",
    )
    .bind(&request_id)
    .bind(&auth.tenant_id)
    .bind(&body.workflow_id)
    .bind(&auth.user_id)
    .bind(&body.title)
    .bind(&body.description)
    .execute(&state.db)
    .await
    .ok();

    // Audit
    let audit_id = uuid::Uuid::new_v4().to_string();
    let _ = sqlx::query(
        "INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, entity_type, entity_id, new_status, details) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
    )
    .bind(&audit_id)
    .bind(&auth.tenant_id)
    .bind(&auth.user_id)
    .bind(&auth.name)
    .bind("REQUEST_SUBMITTED")
    .bind("request")
    .bind(&request_id)
    .bind("pending")
    .bind(format!("Submitted request: {}", &body.title))
    .execute(&state.db)
    .await;

    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "id": request_id,
            "title": body.title,
            "status": "pending",
            "message": "Request submitted"
        })),
    )
}

/// GET /api/requests
/// Returns requests based on the user's role:
/// - Employee: only their own requests
/// - Manager/Admin: all requests in their tenant
pub async fn list_requests(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> impl IntoResponse {
    let requests = if auth.role == "employee" {
        sqlx::query_as::<_, Request>(
            "SELECT id, tenant_id, workflow_id, created_by, title, description, current_step, status, created_at, updated_at FROM requests WHERE tenant_id = ?1 AND created_by = ?2 ORDER BY created_at DESC",
        )
        .bind(&auth.tenant_id)
        .bind(&auth.user_id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_default()
    } else {
        sqlx::query_as::<_, Request>(
            "SELECT id, tenant_id, workflow_id, created_by, title, description, current_step, status, created_at, updated_at FROM requests WHERE tenant_id = ?1 ORDER BY created_at DESC",
        )
        .bind(&auth.tenant_id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_default()
    };

    // Enrich with creator names and workflow names
    let mut enriched = Vec::new();
    for req in requests {
        let creator_name = sqlx::query_scalar::<_, String>(
            "SELECT name FROM users WHERE id = ?1",
        )
        .bind(&req.created_by)
        .fetch_one(&state.db)
        .await
        .unwrap_or_else(|_| "Unknown".to_string());

        let workflow_name = sqlx::query_scalar::<_, String>(
            "SELECT name FROM workflow_definitions WHERE id = ?1",
        )
        .bind(&req.workflow_id)
        .fetch_one(&state.db)
        .await
        .unwrap_or_else(|_| "Unknown".to_string());

        enriched.push(serde_json::json!({
            "id": req.id,
            "tenantId": req.tenant_id,
            "workflowId": req.workflow_id,
            "workflowName": workflow_name,
            "createdBy": req.created_by,
            "creatorName": creator_name,
            "title": req.title,
            "description": req.description,
            "currentStep": req.current_step,
            "status": req.status,
            "createdAt": req.created_at,
            "updatedAt": req.updated_at
        }));
    }

    (StatusCode::OK, Json(serde_json::json!(enriched)))
}

/// GET /api/requests/pending
/// Returns requests pending approval for the current user's role.
pub async fn pending_approvals(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> impl IntoResponse {
    if auth.role == "employee" {
        return (
            StatusCode::FORBIDDEN,
            Json(serde_json::json!({"error": "Employees cannot view pending approvals"})),
        );
    }

    // Find pending requests where current step requires this user's role
    let requests = sqlx::query_as::<_, Request>(
        "SELECT r.id, r.tenant_id, r.workflow_id, r.created_by, r.title, r.description, r.current_step, r.status, r.created_at, r.updated_at
         FROM requests r
         JOIN workflow_steps ws ON ws.workflow_id = r.workflow_id AND ws.step_order = r.current_step
         WHERE r.tenant_id = ?1 AND r.status = 'pending' AND ws.role_required = ?2
         ORDER BY r.created_at DESC",
    )
    .bind(&auth.tenant_id)
    .bind(&auth.role)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let mut enriched = Vec::new();
    for req in requests {
        let creator_name = sqlx::query_scalar::<_, String>("SELECT name FROM users WHERE id = ?1")
            .bind(&req.created_by)
            .fetch_one(&state.db)
            .await
            .unwrap_or_else(|_| "Unknown".to_string());

        let workflow_name = sqlx::query_scalar::<_, String>(
            "SELECT name FROM workflow_definitions WHERE id = ?1",
        )
        .bind(&req.workflow_id)
        .fetch_one(&state.db)
        .await
        .unwrap_or_else(|_| "Unknown".to_string());

        enriched.push(serde_json::json!({
            "id": req.id,
            "tenantId": req.tenant_id,
            "workflowId": req.workflow_id,
            "workflowName": workflow_name,
            "createdBy": req.created_by,
            "creatorName": creator_name,
            "title": req.title,
            "description": req.description,
            "currentStep": req.current_step,
            "status": req.status,
            "createdAt": req.created_at,
            "updatedAt": req.updated_at
        }));
    }

    (StatusCode::OK, Json(serde_json::json!(enriched)))
}

/// POST /api/requests/:id/decide
/// Manager/Admin approves or rejects a request.
pub async fn decide_request(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(request_id): Path<String>,
    Json(body): Json<ApprovalPayload>,
) -> impl IntoResponse {
    if auth.role == "employee" {
        return (
            StatusCode::FORBIDDEN,
            Json(serde_json::json!({"error": "Employees cannot approve/reject requests"})),
        );
    }

    if !["approved", "rejected"].contains(&body.decision.as_str()) {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "Decision must be 'approved' or 'rejected'"})),
        );
    }

    // Fetch the request
    let request = sqlx::query_as::<_, Request>(
        "SELECT id, tenant_id, workflow_id, created_by, title, description, current_step, status, created_at, updated_at FROM requests WHERE id = ?1 AND tenant_id = ?2",
    )
    .bind(&request_id)
    .bind(&auth.tenant_id)
    .fetch_optional(&state.db)
    .await;

    let request = match request {
        Ok(Some(r)) => r,
        _ => {
            return (
                StatusCode::NOT_FOUND,
                Json(serde_json::json!({"error": "Request not found"})),
            );
        }
    };

    if request.status != "pending" {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "Request is not pending"})),
        );
    }

    // Verify current step requires this role
    let step = sqlx::query_as::<_, WorkflowStep>(
        "SELECT id, workflow_id, step_order, role_required FROM workflow_steps WHERE workflow_id = ?1 AND step_order = ?2",
    )
    .bind(&request.workflow_id)
    .bind(request.current_step)
    .fetch_optional(&state.db)
    .await;

    let step = match step {
        Ok(Some(s)) => s,
        _ => {
            return (
                StatusCode::BAD_REQUEST,
                Json(serde_json::json!({"error": "Workflow step not found"})),
            );
        }
    };

    if step.role_required != auth.role {
        return (
            StatusCode::FORBIDDEN,
            Json(serde_json::json!({"error": format!("This step requires '{}' role", step.role_required)})),
        );
    }

    // Record the approval
    let approval_id = uuid::Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO approvals (id, request_id, step_order, approved_by, decision, comment) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    )
    .bind(&approval_id)
    .bind(&request_id)
    .bind(request.current_step)
    .bind(&auth.user_id)
    .bind(&body.decision)
    .bind(&body.comment)
    .execute(&state.db)
    .await
    .ok();

    let old_status = request.status.clone();
    let (new_status, new_step);

    if body.decision == "rejected" {
        new_status = "rejected".to_string();
        new_step = request.current_step;
    } else {
        // Check if there's a next step
        let next_step = sqlx::query_as::<_, WorkflowStep>(
            "SELECT id, workflow_id, step_order, role_required FROM workflow_steps WHERE workflow_id = ?1 AND step_order = ?2",
        )
        .bind(&request.workflow_id)
        .bind(request.current_step + 1)
        .fetch_optional(&state.db)
        .await;

        if let Ok(Some(_)) = next_step {
            // More steps — advance
            new_status = "pending".to_string();
            new_step = request.current_step + 1;
        } else {
            // No more steps — fully approved
            new_status = "approved".to_string();
            new_step = request.current_step;
        }
    }

    // Update request
    sqlx::query(
        "UPDATE requests SET status = ?1, current_step = ?2, updated_at = datetime('now') WHERE id = ?3",
    )
    .bind(&new_status)
    .bind(new_step)
    .bind(&request_id)
    .execute(&state.db)
    .await
    .ok();

    // Audit log
    let audit_id = uuid::Uuid::new_v4().to_string();
    let _ = sqlx::query(
        "INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, entity_type, entity_id, old_status, new_status, details) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
    )
    .bind(&audit_id)
    .bind(&auth.tenant_id)
    .bind(&auth.user_id)
    .bind(&auth.name)
    .bind(if body.decision == "approved" { "REQUEST_APPROVED" } else { "REQUEST_REJECTED" })
    .bind("request")
    .bind(&request_id)
    .bind(&old_status)
    .bind(&new_status)
    .bind(format!(
        "{} {} request '{}'. Comment: {}",
        &auth.name,
        &body.decision,
        &request.title,
        body.comment.as_deref().unwrap_or("none")
    ))
    .execute(&state.db)
    .await;

    (
        StatusCode::OK,
        Json(serde_json::json!({
            "message": format!("Request {}", body.decision),
            "requestId": request_id,
            "newStatus": new_status,
            "currentStep": new_step
        })),
    )
}
