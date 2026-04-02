use serde::Serialize;
use sqlx::FromRow;

#[derive(Serialize, FromRow, Clone)]
pub struct AuditLog {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub user_name: String,
    pub action: String,
    pub entity_type: String,
    pub entity_id: String,
    pub old_status: Option<String>,
    pub new_status: Option<String>,
    pub details: Option<String>,
    pub created_at: String,
}
