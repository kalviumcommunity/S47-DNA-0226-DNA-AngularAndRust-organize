use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct CreateRecordPayload {
    pub name: String,
    pub role: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct ListParams {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub role: Option<String>, // Optional explicit filtering target
}

#[derive(Deserialize, Debug)]
pub struct UpdateRecordPayload {
    pub name: Option<String>,
    pub role: Option<String>,
}

#[derive(Serialize, Debug)]
pub struct RecordResponse {
    pub id: i32,
    pub name: String,
    pub role: String,
    pub message: String,
}

#[derive(Serialize, Debug)]
pub struct FetchRecordResponse {
    pub id: i32,
    pub name: String,
    pub role: Option<String>, // Schema upgrade could mean old records have NULL
}
