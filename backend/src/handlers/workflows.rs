use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

use crate::config::AppState;
use crate::middleware::auth::AuthUser;
use crate::models::workflow::*;

/// GET /api/workflows
/// Returns all workflow definitions (with steps) for the authenticated tenant.
pub async fn list_workflows(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> impl IntoResponse {
    let workflows = sqlx::query_as::<_, WorkflowDefinition>(
        "SELECT id, tenant_id, name, description, created_at FROM workflow_definitions WHERE tenant_id = ?1"
    )
    .bind(&auth.tenant_id)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let mut result = Vec::new();
    for wf in workflows {
        let steps = sqlx::query_as::<_, WorkflowStep>(
            "SELECT id, workflow_id, step_order, role_required FROM workflow_steps WHERE workflow_id = ?1 ORDER BY step_order"
        )
        .bind(&wf.id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

        result.push(WorkflowWithSteps {
            workflow: wf,
            steps,
        });
    }

    (StatusCode::OK, Json(serde_json::json!(result)))
}

/// POST /api/workflows
/// Admin-only: create a new workflow definition with steps.
pub async fn create_workflow(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(body): Json<CreateWorkflowRequest>,
) -> impl IntoResponse {
    if auth.role != "admin" {
        return (
            StatusCode::FORBIDDEN,
            Json(serde_json::json!({"error": "Only admins can create workflows"})),
        );
    }

    let workflow_id = uuid::Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO workflow_definitions (id, tenant_id, name, description) VALUES (?1, ?2, ?3, ?4)"
    )
    .bind(&workflow_id)
    .bind(&auth.tenant_id)
    .bind(&body.name)
    .bind(&body.description)
    .execute(&state.db)
    .await
    .ok();

    for step in &body.steps {
        let step_id = uuid::Uuid::new_v4().to_string();
        sqlx::query(
            "INSERT INTO workflow_steps (id, workflow_id, step_order, role_required) VALUES (?1, ?2, ?3, ?4)"
        )
        .bind(&step_id)
        .bind(&workflow_id)
        .bind(step.step_order)
        .bind(&step.role_required)
        .execute(&state.db)
        .await
        .ok();
    }

    // Audit
    let audit_id = uuid::Uuid::new_v4().to_string();
    let _ = sqlx::query(
        "INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, entity_type, entity_id, details) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
    )
    .bind(&audit_id)
    .bind(&auth.tenant_id)
    .bind(&auth.user_id)
    .bind(&auth.name)
    .bind("WORKFLOW_CREATED")
    .bind("workflow")
    .bind(&workflow_id)
    .bind(format!("Created workflow '{}' with {} steps", &body.name, body.steps.len()))
    .execute(&state.db)
    .await;

    (
        StatusCode::CREATED,
        Json(serde_json::json!({"id": workflow_id, "name": body.name, "message": "Workflow created"})),
    )
}
