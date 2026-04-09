use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct CreateRecordPayload {
    pub name: String,
}

#[derive(Serialize, Debug)]
pub struct RecordResponse {
    pub id: i32,
    pub name: String,
    pub message: String,
}
