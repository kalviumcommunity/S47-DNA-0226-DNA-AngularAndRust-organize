use axum::{http::StatusCode, response::IntoResponse, Json};

use crate::models::profile::{CreateProfileRequest, ProfileResponse};

/// POST /api/profiles
/// Accepts a JSON payload, parsed strictly by Serde against CreateProfileRequest.
/// If an invalid payload is sent (e.g., missing 'email' or malformed JSON),
/// Axum and Serde instantly reject the request with HTTP 400 Bad Request
/// before this logic even triggers.
pub async fn create_profile(
    // Serde does all the heavy lifting right here during Json extraction!
    Json(payload): Json<CreateProfileRequest>,
) -> impl IntoResponse {
    // Generate our strongly-typed Rust struct response
    let response = ProfileResponse {
        id: 99, // Mock ID for demonstration
        name: payload.name,
        email: payload.email,
        status: "Profile created successfully".to_string(),
    };

    // Serialize the Rust struct back to JSON utilizing Serde along with a 201 status code
    (StatusCode::CREATED, Json(response))
}
