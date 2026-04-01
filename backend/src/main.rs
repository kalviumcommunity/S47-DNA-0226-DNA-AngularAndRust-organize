use axum::{routing::get, Json, Router};
use serde::Serialize;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    message: String,
}

async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        message: "Rust Axum backend running".to_string(),
    })
}

async fn hello() -> &'static str {
    "Rust Axum backend running"
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(hello))
        .route("/health", get(health_check));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .unwrap();

    println!("🚀 Backend server running on http://127.0.0.1:8080");

    axum::serve(listener, app).await.unwrap();
}
