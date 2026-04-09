use axum::{http::StatusCode, response::IntoResponse, Json};
use anyhow::Context;

use crate::models::profile::{CreateProfileRequest, ProfileResponse};
use crate::error::AppError;

/// POST /api/profiles
pub async fn create_profile(
    Json(payload): Json<CreateProfileRequest>,
) -> Result<impl IntoResponse, AppError> {

    // 1. Safe Invalid Input Handling (Missing/Empty Strings)
    if payload.name.trim().is_empty() {
        return Err(AppError::BadRequest("The 'name' field cannot be completely empty.".into()));
    }

    // 2. Safe Option Handling (No unchecked unwraps)
    // We try to find an exact "@" symbol. If missing, we cleanly return 400.
    let _at_index = payload.email.find('@').ok_or_else(|| {
        AppError::BadRequest("Email is invalid because it is missing an '@' symbol.".into())
    })?;

    // 3. Safe Internal Error Handling with `anyhow` inside Result context
    // We intentionally parse invalid text to generate a raw error.
    // The `?` operator maps it to `AppError::Internal` using From<anyhow::Error>,
    // and the `.context` from anyhow attaches a detailed debug trace trace for our logs.
    let _simulated_db_id: u32 = "invalid_string"
        .parse()
        .context("Simulated DB ID allocation failed due to string parsing error")?;

    // If we survived the checks (we intentionally won't due to the simulated error above,
    // but in a real API this is where we return), we build our response cleanly.
    let response = ProfileResponse {
        id: 99,
        name: payload.name,
        email: payload.email,
        status: "Profile created".to_string(),
    };

    Ok((StatusCode::CREATED, Json(response)))
}
