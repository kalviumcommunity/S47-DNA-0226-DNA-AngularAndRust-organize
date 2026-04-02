use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

use crate::config::AppState;
use crate::middleware::auth::AuthUser;
use crate::models::user::User;

/// GET /api/users
/// Returns all users in the authenticated user's tenant.
/// Admin only.
pub async fn list_users(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> impl IntoResponse {
    if auth.role != "admin" {
        return (
            StatusCode::FORBIDDEN,
            Json(serde_json::json!({"error": "Only admins can list users"})),
        );
    }

    let users = sqlx::query_as::<_, User>(
        "SELECT id, tenant_id, name, email, role, created_at FROM users WHERE tenant_id = ?1 ORDER BY created_at DESC"
    )
    .bind(&auth.tenant_id)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    (StatusCode::OK, Json(serde_json::json!(users)))
}

/// PUT /api/users/:id/role
/// Update a user's role. Admin only.
pub async fn update_user_role(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    axum::extract::Path(user_id): axum::extract::Path<String>,
    Json(body): Json<serde_json::Value>,
) -> impl IntoResponse {
    if auth.role != "admin" {
        return (
            StatusCode::FORBIDDEN,
            Json(serde_json::json!({"error": "Only admins can update roles"})),
        );
    }

    let new_role = body
        .get("role")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    if !["admin", "manager", "employee"].contains(&new_role) {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "Invalid role"})),
        );
    }

    // Verify user belongs to same tenant
    let user = sqlx::query_as::<_, User>(
        "SELECT id, tenant_id, name, email, role, created_at FROM users WHERE id = ?1 AND tenant_id = ?2"
    )
    .bind(&user_id)
    .bind(&auth.tenant_id)
    .fetch_optional(&state.db)
    .await;

    let user = match user {
        Ok(Some(u)) => u,
        _ => {
            return (
                StatusCode::NOT_FOUND,
                Json(serde_json::json!({"error": "User not found"})),
            );
        }
    };

    let old_role = user.role.clone();

    sqlx::query("UPDATE users SET role = ?1 WHERE id = ?2")
        .bind(new_role)
        .bind(&user_id)
        .execute(&state.db)
        .await
        .ok();

    // Audit log
    let audit_id = uuid::Uuid::new_v4().to_string();
    let _ = sqlx::query(
        "INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, entity_type, entity_id, old_status, new_status, details) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)"
    )
    .bind(&audit_id)
    .bind(&auth.tenant_id)
    .bind(&auth.user_id)
    .bind(&auth.name)
    .bind("ROLE_UPDATED")
    .bind("user")
    .bind(&user_id)
    .bind(&old_role)
    .bind(new_role)
    .bind(format!("Role changed for '{}': {} → {}", &user.name, &old_role, new_role))
    .execute(&state.db)
    .await;

    (
        StatusCode::OK,
        Json(serde_json::json!({"message": "Role updated", "userId": user_id, "newRole": new_role})),
    )
}
