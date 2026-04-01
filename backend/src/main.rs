mod routes;
mod handlers;
mod models;

/// Application entry point.
/// - Initializes the Axum router by loading all routes from the routes module
/// - Binds the server to 127.0.0.1:8080
/// - Starts listening for incoming HTTP requests
///
/// main.rs is kept minimal — all routing, business logic, and data models
/// are organized into their respective modules.
#[tokio::main]
async fn main() {
    let app = routes::create_routes();

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();

    println!("🚀 Backend server running on http://127.0.0.1:8080");

    axum::serve(listener, app).await.unwrap();
}
