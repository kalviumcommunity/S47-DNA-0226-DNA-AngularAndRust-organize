use tower_http::cors::{CorsLayer, Any};

mod routes;
mod handlers;
mod models;

/// Application entry point.
/// - Initializes the Axum router with all routes and CORS middleware
/// - Binds the server to 127.0.0.1:8080
/// - Starts listening for incoming HTTP requests
#[tokio::main]
async fn main() {
    // Allow Angular frontend (port 4200) to call this API
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = routes::create_routes().layer(cors);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();

    println!("🚀 Backend server running on http://127.0.0.1:8080");

    axum::serve(listener, app).await.unwrap();
}
