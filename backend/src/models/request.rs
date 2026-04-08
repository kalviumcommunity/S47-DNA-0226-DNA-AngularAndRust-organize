use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, FromRow, Clone)]
pub struct Request {
    pub id: String,
    pub tenant_id: String,
    pub workflow_id: String,
    pub created_by: String,
    pub title: String,
    pub description: Option<String>,
    pub current_step: i32,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Deserialize)]
pub struct CreateRequestPayload {
    pub workflow_id: String,
    pub title: String,
    pub description: Option<String>,
}

// Strongly typed Enum for API safety
#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ApprovalDecision {
    Approved,
    Rejected,
}

#[derive(Serialize, FromRow, Clone)]
pub struct Approval {
    pub id: String,
    pub request_id: String,
    pub step_order: i32,
    pub approved_by: String,
    pub decision: String, // Kept as string for DB compatibility, but typed for API rules
    pub comment: Option<String>,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct ApprovalPayload {
    pub decision: ApprovalDecision, // API boundary strictly enforces valid values!
    pub comment: Option<String>,
}

/// Enriched request with creator name for API responses
#[derive(Serialize)]
pub struct RequestWithCreator {
    #[serde(flatten)]
    pub request: Request,
    pub creator_name: String,
    pub workflow_name: String,
}
