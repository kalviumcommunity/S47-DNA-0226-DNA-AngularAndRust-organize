use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use anyhow::Context;
use std::sync::Arc;
use sqlx::Row;

use crate::{
    config::AppState,
    error::AppError,
    models::pg_demo::{CreatePgDemoRequest, PgDemoRecordResponse},
};

/// POST /api/pg-demo
/// Inserts a record into PostgreSQL securely avoiding SQL injection via parameterized queries.
pub async fn create_demo_record(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreatePgDemoRequest>,
) -> Result<impl IntoResponse, AppError> {

    if payload.name.trim().is_empty() {
        return Err(AppError::BadRequest("Name cannot be empty".into()));
    }

    // 1. Safe Error Handling: Check if Postgres pool is available (Option)
    let pg_pool = state.pg_db.as_ref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("PostgreSQL is not configured or running in this environment."))
    })?;

use sqlx::Row;

    let configured_role = payload.role.unwrap_or_else(|| "user".to_string());

    // 2. Safe Database Execution: Executing the query against the newly MIGRATED SCHEMA
    let result = sqlx::query(
        "INSERT INTO demo_records (name, role) VALUES ($1, $2) RETURNING id, role"
    )
    .bind(&payload.name)
    .bind(&configured_role)
    .fetch_one(pg_pool)
    .await
    .context("Failed to insert record into PostgreSQL database")?; // 3. anyhow Context for internal logs

    let inserted_id: i32 = result.get("id");
    let returned_role: String = result.get("role");

    let response = PgDemoRecordResponse {
        id: inserted_id,
        name: payload.name,
        role: Some(returned_role),
        created_at: Some(chrono::Utc::now().to_rfc3339()),
    };

    Ok((StatusCode::CREATED, Json(response)))
}

/// GET /api/pg-demo
/// READ operation fetching all records systematically safely mapping nullable roles.
/// Demonstrates robust scaling utilizing native Postgres Limit, Offset, and Filter optimizations dynamically.
pub async fn list_demo_records(
    State(state): State<Arc<AppState>>,
    axum::extract::Query(params): axum::extract::Query<crate::models::pg_demo::ListParams>,
) -> Result<impl IntoResponse, AppError> {
    let pg_pool = state.pg_db.as_ref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("Postgres is disabled."))
    })?;

    // 1. Pagination Mathematics resolving defaults securely
    let page = params.page.unwrap_or(1).max(1); // Force minimum page 1
    let limit = params.limit.unwrap_or(10).min(100); // Cap mapping locally at 100 max per pull
    let offset = (page - 1) * limit;

    // 2. Safe Database Execution: Optimized selection capturing specific columns filtering explicitly via $1 mappings without concatenation.
    // The query logic checks if `role` is null or if it matches.
    let records = sqlx::query(
        "SELECT id, name, role FROM demo_records WHERE ($1::varchar IS NULL OR role = $1) ORDER BY id DESC LIMIT $2 OFFSET $3"
    )
        .bind(&params.role)
        .bind(limit)
        .bind(offset)
        .fetch_all(pg_pool)
        .await
        .context("Failed fetching paginated records from PostgreSQL")?;

    let mut response_list = Vec::new();
    for row in records {
        response_list.push(crate::models::pg_demo::PgDemoRecordResponse {
            id: row.get("id"),
            name: row.get("name"),
            role: row.try_get("role").ok(),
            created_at: Some(chrono::Utc::now().to_rfc3339()), // AI Case Study mapping: Successfully injected backward compatible optional boundaries!
        });
    }

    Ok((StatusCode::OK, Json(response_list)))
}

/// PUT /api/pg-demo/:id
/// UPDATE operation dynamically replacing properties predictably.
pub async fn update_demo_record(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(id): axum::extract::Path<i32>,
    Json(payload): Json<crate::models::pg_demo::UpdateRecordPayload>,
) -> Result<impl IntoResponse, AppError> {
    let pg_pool = state.pg_db.as_ref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("Postgres is disabled."))
    })?;

    if payload.name.is_none() && payload.role.is_none() {
        return Err(AppError::BadRequest("No update fields provided".into()));
    }

    let result = sqlx::query(
        "UPDATE demo_records SET name = COALESCE($1, name), role = COALESCE($2, role) WHERE id = $3"
    )
    .bind(&payload.name)
    .bind(&payload.role)
    .bind(id)
    .execute(pg_pool)
    .await
    .context("Failed to execute update logic heavily abstracting errors")?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Record ID {} not found", id)));
    }

    Ok((StatusCode::OK, Json(serde_json::json!({ "message": "Record updated successfully" }))))
}

/// DELETE /api/pg-demo/:id
/// DELETE operation permanently tearing down constraints securely.
/// PROTECTED via Extractor Auth Hook Middleware blocking unauthenticated users!
pub async fn delete_demo_record(
    State(state): State<Arc<AppState>>,
    axum::extract::Path(id): axum::extract::Path<i32>,
    _auth: crate::middleware::auth::AuthUser, // Authentication Middleware Hook
) -> Result<impl IntoResponse, AppError> {
    let pg_pool = state.pg_db.as_ref().ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!("Postgres is disabled."))
    })?;

    let result = sqlx::query("DELETE FROM demo_records WHERE id = $1")
        .bind(id)
        .execute(pg_pool)
        .await
        .context("Deletion failed internally")?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Cannot delete, ID {} not found", id)));
    }

    Ok((StatusCode::OK, Json(serde_json::json!({ "message": "Record deleted successfully" }))))
}

