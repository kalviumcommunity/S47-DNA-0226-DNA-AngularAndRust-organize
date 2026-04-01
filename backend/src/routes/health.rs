use axum::{routing::get, Router};
use crate::handlers;

/// Defines routes for health checks and workflow requests.
pub fn routes() -> Router {
    Router::new()
        .route("/", get(handlers::health::hello))
        .route("/health", get(handlers::health::health_check))
        .route("/api/requests", get(handlers::health::get_requests))
}
