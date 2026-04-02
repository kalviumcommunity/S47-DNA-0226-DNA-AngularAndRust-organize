use sqlx::sqlite::{SqlitePool, SqliteConnectOptions, SqliteJournalMode};
use std::str::FromStr;

/// Shared application state accessible by all handlers via Axum's State extractor.
#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub jwt_secret: String,
}

impl AppState {
    pub async fn new() -> Self {
        dotenvy::dotenv().ok();

        let database_url =
            std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:workflow.db".to_string());
        let jwt_secret = std::env::var("JWT_SECRET")
            .unwrap_or_else(|_| "default-dev-secret".to_string());

        let options = SqliteConnectOptions::from_str(&database_url)
            .expect("Invalid DATABASE_URL")
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal);

        let db = SqlitePool::connect_with(options)
            .await
            .expect("Failed to connect to SQLite database");

        AppState { db, jwt_secret }
    }
}
