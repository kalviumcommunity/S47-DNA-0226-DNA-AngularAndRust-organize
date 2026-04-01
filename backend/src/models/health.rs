use serde::Serialize;

/// Represents the JSON response returned by the /health endpoint.
/// Using a typed struct ensures the response shape is consistent
/// and validated at compile time.
#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub message: String,
}
