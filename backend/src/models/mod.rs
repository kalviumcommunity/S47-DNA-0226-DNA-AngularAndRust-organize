pub mod health;
pub mod auth;
pub mod user;
pub mod tenant;
pub mod workflow;
pub mod request;
pub mod audit;
pub mod feedback;
pub mod profile;
pub mod pg_demo;

use serde::Serialize;

/// Standard API error response
#[derive(Serialize)]
pub struct ApiError {
    pub error: String,
}

impl ApiError {
    pub fn new(msg: &str) -> Self {
        ApiError {
            error: msg.to_string(),
        }
    }
}
