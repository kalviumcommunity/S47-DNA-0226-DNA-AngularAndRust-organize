use serde::Serialize;

/// Represents the JSON response returned by the GET /health endpoint.
/// Does not depend on any external services — always returns current server status.
#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub message: String,
    pub timestamp: String,
}

/// Represents a WorkflowRequest entity returned by the /api/requests endpoint.
/// Mirrors the TypeScript WorkflowRequest interface on the frontend.
/// Used across departments: HR, Academics, Finance, Admin.
#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WorkflowRequest {
    pub id: u32,
    pub title: String,
    pub department: String,
    pub requested_by: String,
    pub status: String,
    pub priority: String,
    pub created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub approved_by: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub remarks: Option<String>,
}
