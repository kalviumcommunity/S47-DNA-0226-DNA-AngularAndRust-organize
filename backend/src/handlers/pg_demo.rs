use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use anyhow::Context;
use std::sync::Arc;

use crate::{
    config::AppState,
    error::AppError,
    models::pg_demo::{CreateRecordPayload, RecordResponse},
};

/// POST /api/pg-demo
/// Inserts a record into PostgreSQL securely avoiding SQL injection via parameterized queries.
pub async fn create_demo_record(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateRecordPayload>,
) -> Result<impl IntoResponse, AppError> {

    if payload.name.trim().is_empty() {
        return Err(AppError::BadRequest("Name cannot be empty".into()));
    }

    // 1. Safe Error Handling: Check if Postgres pool is available (Option)
    let pg_pool = state.pg_db.as_ref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("PostgreSQL is not configured or running in this environment."))
    })?;

use sqlx::Row;

    // 2. Safe Database Execution: Using SQLx parameterized bindings to prevent Injection
    // We use the runtime non-macro `query` function here so we don't strictly require Postgres
    // to be running during compile time.
    let result = sqlx::query(
        "INSERT INTO demo_records (name) VALUES ($1) RETURNING id"
    )
    .bind(&payload.name)
    .fetch_one(pg_pool)
    .await
    .context("Failed to insert record into PostgreSQL database")?; // 3. anyhow Context for internal logs

    let inserted_id: i32 = result.get("id");

    let response = RecordResponse {
        id: inserted_id,
        name: payload.name,
        message: "Successfully inserted into PostgreSQL".to_string(),
    };

    Ok((StatusCode::CREATED, Json(response)))
}
