use tower_http::cors::{CorsLayer, Any};
use std::sync::Arc;

mod config;
mod db;
mod routes;
mod handlers;
mod models;
mod middleware;

/// Application entry point.
/// - Loads environment config (.env file)
/// - Initializes SQLite database and schema
/// - Creates Axum router with all routes and CORS middleware
/// - Starts the server on a configurable port (default: 8080)
#[tokio::main]
async fn main() {
    // Initialize application state (loads .env, connects to DB)
    let state = Arc::new(config::AppState::new().await);

    // Create database tables
    db::initialize(&state.db).await;

    // Allow Angular frontend (port 4200) to call this API
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = routes::create_routes(state).layer(cors);

    // Configurable port via PORT environment variable
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("127.0.0.1:{}", port);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap();

    println!("🚀 Backend server running on http://{}", addr);
    println!("📋 API endpoints:");
    println!("   GET  /health                    ← Health check (no auth)");
    println!("   POST /api/feedback              ← REST API assignment (no auth)");
    println!("   POST /api/auth/register-tenant");
    println!("   POST /api/auth/login");
    println!("   GET  /api/auth/me");
    println!("   POST /api/auth/create-user");
    println!("   GET  /api/users");
    println!("   GET  /api/workflows");
    println!("   POST /api/workflows");
    println!("   GET  /api/requests");
    println!("   POST /api/requests");
    println!("   GET  /api/requests/pending");
    println!("   POST /api/requests/:id/decide");
    println!("   GET  /api/audit-logs");

    axum::serve(listener, app).await.unwrap();
}

