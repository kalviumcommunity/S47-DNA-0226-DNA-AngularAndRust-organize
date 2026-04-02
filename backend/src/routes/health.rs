use axum::{routing::get, Router};
use crate::config::AppState;
use std::sync::Arc;

/// Health check routes (public, no auth required)
pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(crate::handlers::health::hello))
        .route("/health", get(crate::handlers::health::health_check))
}
