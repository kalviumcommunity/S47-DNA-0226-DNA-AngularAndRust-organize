use serde::{Deserialize, Serialize};

/// Request model using Serde Deserialize
/// This struct enforces that any incoming JSON must strictly contain
/// 'name' and 'email' as strings.
#[derive(Deserialize, Debug)]
pub struct CreateProfileRequest {
    pub name: String,
    pub email: String,
}

/// Response model using Serde Serialize
/// Used to convert our Rust backend data into a valid JSON response string.
#[derive(Serialize, Debug)]
pub struct ProfileResponse {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub status: String,
}
