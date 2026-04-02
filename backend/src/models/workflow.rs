use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, FromRow, Clone)]
pub struct WorkflowDefinition {
    pub id: String,
    pub tenant_id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Serialize, FromRow, Clone)]
pub struct WorkflowStep {
    pub id: String,
    pub workflow_id: String,
    pub step_order: i32,
    pub role_required: String,
}

#[derive(Deserialize)]
pub struct CreateWorkflowRequest {
    pub name: String,
    pub description: Option<String>,
    pub steps: Vec<WorkflowStepInput>,
}

#[derive(Deserialize)]
pub struct WorkflowStepInput {
    pub step_order: i32,
    pub role_required: String,
}

/// Combined workflow with its steps for API response
#[derive(Serialize)]
pub struct WorkflowWithSteps {
    #[serde(flatten)]
    pub workflow: WorkflowDefinition,
    pub steps: Vec<WorkflowStep>,
}
