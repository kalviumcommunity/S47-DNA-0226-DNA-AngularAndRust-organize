use sqlx::sqlite::{SqlitePool, SqliteConnectOptions, SqliteJournalMode};
use sqlx::{PgPool};
use std::str::FromStr;

/// Shared application state accessible by all handlers via Axum's State extractor.
#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub pg_db: Option<PgPool>, // Assignment optional postgres connection
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

        // Safe DB connection for assignment
        let mut pg_db = None;
        if let Ok(pg_url) = std::env::var("PG_DATABASE_URL") {
            if let Ok(pool) = PgPool::connect(&pg_url).await {
                println!("✅ Connected to Postgres database!");
                
                // Ensure table exists for demo
                let _ = sqlx::query(
                    "CREATE TABLE IF NOT EXISTS demo_records (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )"
                ).execute(&pool).await;

                pg_db = Some(pool);
            } else {
                eprintln!("⚠️ Failed to connect to Postgres using PG_DATABASE_URL. Moving on safely.");
            }
        }

        AppState { db, pg_db, jwt_secret }
    }
}
