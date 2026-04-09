use sqlx::sqlite::{SqlitePool, SqliteConnectOptions, SqliteJournalMode};
use sqlx::{PgPool};
use std::str::FromStr;

use jsonwebtoken::{EncodingKey, DecodingKey};

/// Shared application state accessible by all handlers via Axum's State extractor.
#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub pg_db: Option<PgPool>, // Assignment optional postgres connection
    pub jwt_encoding_key: EncodingKey,
    pub jwt_decoding_key: DecodingKey,
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
                
                // 3. Execution of Schema Version Migrations mapping directly to our `./migrations` folder!
                // This tracks the exact versions locally and natively deploys new up/down SQL schema patches.
                sqlx::migrate!("./migrations")
                    .run(&pool)
                    .await
                    .expect("Failed to apply schema migrations to PostgreSQL!");

                pg_db = Some(pool);
            } else {
                eprintln!("⚠️ Failed to connect to Postgres using PG_DATABASE_URL. Moving on safely.");
            }
        }

        let jwt_encoding_key = EncodingKey::from_secret(jwt_secret.as_bytes());
        let jwt_decoding_key = DecodingKey::from_secret(jwt_secret.as_bytes());

        AppState { db, pg_db, jwt_encoding_key, jwt_decoding_key }
    }
}
