use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

use crate::config::AppState;
use crate::middleware::auth::AuthUser;
use crate::models::audit::AuditLog;

/// GET /api/audit-logs
/// Returns all audit logs for the authenticated tenant. Admin/Manager only.
pub async fn list_audit_logs(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> impl IntoResponse {
    if auth.role == "employee" {
        return (
            StatusCode::FORBIDDEN,
            Json(serde_json::json!({"error": "Only admins and managers can view audit logs"})),
        );
    }

    let logs = sqlx::query_as::<_, AuditLog>(
        "SELECT id, tenant_id, user_id, user_name, action, entity_type, entity_id, old_status, new_status, details, created_at FROM audit_logs WHERE tenant_id = ?1 ORDER BY created_at DESC LIMIT 200",
    )
    .bind(&auth.tenant_id)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    (StatusCode::OK, Json(serde_json::json!(logs)))
}
