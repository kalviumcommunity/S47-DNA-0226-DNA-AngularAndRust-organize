use serde::Serialize;
use sqlx::FromRow;

#[derive(Serialize, FromRow, Clone)]
pub struct Tenant {
    pub id: String,
    pub name: String,
    pub created_at: String,
}
