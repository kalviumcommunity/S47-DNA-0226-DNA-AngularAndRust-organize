use axum::{
    routing::{get, post, put},
    Router,
};
use std::sync::Arc;
use crate::config::AppState;
use crate::handlers;

mod health;

/// Builds the complete application router with all routes.
pub fn create_routes(state: Arc<AppState>) -> Router {
    Router::new()
        // Health (public)
        .merge(health::routes())
        // Auth (public)
        .route("/api/auth/register-tenant", post(handlers::auth::register_tenant))
        .route("/api/auth/login", post(handlers::auth::login))
        // Auth (protected)
        .route("/api/auth/me", get(handlers::auth::me))
        .route("/api/auth/create-user", post(handlers::auth::create_user))
        // Users (protected)
        .route("/api/users", get(handlers::users::list_users))
        .route("/api/users/{id}/role", put(handlers::users::update_user_role))
        // Workflows (protected)
        .route("/api/workflows", get(handlers::workflows::list_workflows))
        .route("/api/workflows", post(handlers::workflows::create_workflow))
        // Requests (protected)
        .route("/api/requests", get(handlers::requests::list_requests))
        .route("/api/requests", post(handlers::requests::create_request))
        .route("/api/requests/pending", get(handlers::requests::pending_approvals))
        .route("/api/requests/{id}/decide", post(handlers::requests::decide_request))
        // Audit (protected)
        .route("/api/audit-logs", get(handlers::audit::list_audit_logs))
        // Feedback (public demo endpoint for REST API assignment)
        .route("/api/feedback", post(handlers::feedback::submit_feedback))
        // Profiles (public demo endpoint for Serde JSON mapping assignment)
        .route("/api/profiles", post(handlers::profile::create_profile))
        .with_state(state)
}
