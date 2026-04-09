use axum::{http::StatusCode, response::IntoResponse, Json};
use uuid::Uuid;

use crate::models::feedback::{FeedbackResponse, SubmitFeedbackPayload};

/// POST /api/feedback
/// Accepts feedback details, performs basic handling, and returns a structured response.
/// No database is used here; this is a pure REST endpoint demonstration using typed models.
pub async fn submit_feedback(
    Json(payload): Json<SubmitFeedbackPayload>,
) -> impl IntoResponse {
    // Basic handler logic: simulate saving the feedback and generate an ID
    let feedback_id = Uuid::new_v4().to_string();

    let response = FeedbackResponse {
        id: feedback_id,
        name: payload.name,
        message: format!("Received: {}", payload.message),
        status: "success".to_string(),
    };

    // Return 201 Created status and structured JSON response
    (StatusCode::CREATED, Json(response))
}
