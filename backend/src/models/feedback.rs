use serde::{Deserialize, Serialize};

/// Request model for incoming feedback
#[derive(Deserialize, Debug)]
pub struct SubmitFeedbackPayload {
    pub name: String,
    pub message: String,
}

/// Response model returned after submitting feedback
#[derive(Serialize, Debug)]
pub struct FeedbackResponse {
    pub id: String,
    pub name: String,
    pub message: String,
    pub status: String,
}
