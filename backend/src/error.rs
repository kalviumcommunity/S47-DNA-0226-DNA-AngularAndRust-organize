use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

/// Custom Application Error Enum
/// Maps different failure modes to structured HTTP responses safely.
pub enum AppError {
    /// A structured client-centric validation error (400)
    BadRequest(String),

    /// A missed optional value / resource not found (404)
    NotFound(String),

    /// Internal error wrapping ANY backend failure via anyhow crate (500)
    Internal(anyhow::Error),
}

// Tell Axum how to convert our enum into structured JSON API responses
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            // For internal errors, we log safely to console using anyhow context,
            // but return a generic friendly message to frontends to prevent leaking secrets.
            AppError::Internal(err) => {
                eprintln!("CRITICAL INTERNAL ERROR: {:?}", err); // anyhow prints the full trace
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "An unexpected internal server error occurred.".to_string(),
                )
            }
        };

        // Standardized Error JSON pattern
        let body = Json(json!({
            "error": true,
            "status": status.as_u16(),
            "message": error_message,
        }));

        (status, body).into_response()
    }
}

// Allows using the `?` operator on ANY anyhow::Error inside our handlers
// to seamlessly convert generic errors into AppError::Internal.
impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        AppError::Internal(err.into())
    }
}
