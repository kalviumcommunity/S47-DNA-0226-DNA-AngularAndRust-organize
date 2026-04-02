use serde::{Deserialize, Serialize};

// ── Registration ──

#[derive(Deserialize)]
pub struct RegisterTenantRequest {
    pub tenant_name: String,
    pub admin_name: String,
    pub admin_email: String,
    pub admin_password: String,
}

// ── Login ──

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

// ── Create User (admin action) ──

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub name: String,
    pub email: String,
    pub password: String,
    pub role: String,
}

// ── Responses ──

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserInfo,
}

#[derive(Serialize, Clone)]
pub struct UserInfo {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub tenant_id: String,
    pub tenant_name: String,
}

// ── JWT Claims ──

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,        // user_id
    pub tenant_id: String,
    pub role: String,
    pub name: String,
    pub email: String,
    pub tenant_name: String,
    pub exp: usize,
}
