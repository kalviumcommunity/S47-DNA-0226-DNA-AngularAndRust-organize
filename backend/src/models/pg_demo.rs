use serde::{Deserialize, Serialize};

// ✨ STRICT TYPED REQUEST MODEL aligning exactly to Angular CreatePgDemoRequest ✨
#[derive(Deserialize, Debug)]
pub struct CreatePgDemoRequest {
    pub name: String,
    pub role: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct ListParams {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub role: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct UpdateRecordPayload {
    pub name: Option<String>,
    pub role: Option<String>,
}

// ✨ STRICT TYPED RESPONSE MODEL mapping EXACTLY onto Angular PgDemoRecordResponse ✨
// Notice the explicit new Optional field 'created_at' protecting forward/backward bounds!
#[derive(Serialize, Debug)]
pub struct PgDemoRecordResponse {
    pub id: i32,
    pub name: String,
    pub role: Option<String>,
    pub created_at: Option<String>, 
}
