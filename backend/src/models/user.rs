use serde::Serialize;
use sqlx::FromRow;

#[derive(Serialize, FromRow, Clone)]
pub struct User {
    pub id: String,
    pub tenant_id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub created_at: String,
}

/// Database row that includes the password hash (never serialized to API responses)
#[derive(FromRow)]
pub struct UserRow {
    pub id: String,
    pub tenant_id: String,
    pub name: String,
    pub email: String,
    pub password_hash: String,
    pub role: String,
    pub created_at: String,
}
