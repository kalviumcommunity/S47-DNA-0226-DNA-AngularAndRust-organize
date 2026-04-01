use axum::Json;
use crate::models::health::HealthResponse;

/// Returns a simple string confirming the backend is running.
pub async fn hello() -> &'static str {
    "Rust Axum backend running"
}

/// Returns a JSON health check response with status and message.
pub async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        message: "Rust Axum backend running".to_string(),
    })
}
