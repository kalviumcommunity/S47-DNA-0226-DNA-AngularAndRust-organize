use axum::{routing::get, Router};
use crate::handlers;

/// Defines routes related to health checks and server status.
pub fn routes() -> Router {
    Router::new()
        .route("/", get(handlers::health::hello))
        .route("/health", get(handlers::health::health_check))
}
