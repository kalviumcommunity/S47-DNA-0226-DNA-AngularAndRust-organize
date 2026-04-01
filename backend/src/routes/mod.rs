use axum::Router;

mod health;

/// Combines all route modules into a single Router.
/// Each sub-module defines its own routes and handlers.
pub fn create_routes() -> Router {
    Router::new().merge(health::routes())
}
