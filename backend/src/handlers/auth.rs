use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use argon2::{
    Argon2,
    PasswordHasher, PasswordVerifier,
};
use password_hash::{SaltString, PasswordHash, rand_core::OsRng};
use jsonwebtoken::{encode, Header, EncodingKey};
use std::sync::Arc;
use uuid::Uuid;

use crate::config::AppState;
use crate::models::auth::*;
use crate::models::user::UserRow;

/// POST /api/auth/register-tenant
/// Creates a new tenant and its admin user in a single transaction.
pub async fn register_tenant(
    State(state): State<Arc<AppState>>,
    Json(body): Json<RegisterTenantRequest>,
) -> impl IntoResponse {
    // Validate input
    if body.tenant_name.trim().is_empty() || body.admin_email.trim().is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "Tenant name and email are required"})),
        );
    }

    if body.admin_password.len() < 6 {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "Password must be at least 6 characters"})),
        );
    }

    // Check if tenant name already exists
    let existing = sqlx::query_scalar::<_, String>(
        "SELECT id FROM tenants WHERE name = ?1"
    )
    .bind(&body.tenant_name)
    .fetch_optional(&state.db)
    .await;

    if let Ok(Some(_)) = existing {
        return (
            StatusCode::CONFLICT,
            Json(serde_json::json!({"error": "Tenant name already registered"})),
        );
    }

    // Check if email already exists
    let existing_email = sqlx::query_scalar::<_, String>(
        "SELECT id FROM users WHERE email = ?1"
    )
    .bind(&body.admin_email)
    .fetch_optional(&state.db)
    .await;

    if let Ok(Some(_)) = existing_email {
        return (
            StatusCode::CONFLICT,
            Json(serde_json::json!({"error": "Email already registered"})),
        );
    }

    // Hash password
    let salt = SaltString::generate(&mut OsRng);
    let password_hash = match Argon2::default().hash_password(body.admin_password.as_bytes(), &salt) {
        Ok(h) => h.to_string(),
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": "Failed to hash password"})),
            );
        }
    };

    let tenant_id = Uuid::new_v4().to_string();
    let user_id = Uuid::new_v4().to_string();

    // Create tenant
    let _ = sqlx::query(
        "INSERT INTO tenants (id, name) VALUES (?1, ?2)"
    )
    .bind(&tenant_id)
    .bind(&body.tenant_name)
    .execute(&state.db)
    .await;

    // Create admin user
    let _ = sqlx::query(
        "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?1, ?2, ?3, ?4, ?5, ?6)"
    )
    .bind(&user_id)
    .bind(&tenant_id)
    .bind(&body.admin_name)
    .bind(&body.admin_email)
    .bind(&password_hash)
    .bind("admin")
    .execute(&state.db)
    .await;

    // Create default workflows for this tenant
    // 1) Leave Approval: Employee → Manager → Admin
    let workflow_id = Uuid::new_v4().to_string();
    let _ = sqlx::query(
        "INSERT INTO workflow_definitions (id, tenant_id, name, description) VALUES (?1, ?2, ?3, ?4)"
    )
    .bind(&workflow_id)
    .bind(&tenant_id)
    .bind("Leave Approval")
    .bind("Employee submits leave request → Manager approves → Admin approves")
    .execute(&state.db)
    .await;
    let step1_id = Uuid::new_v4().to_string();
    let step2_id = Uuid::new_v4().to_string();
    let _ = sqlx::query("INSERT INTO workflow_steps (id, workflow_id, step_order, role_required) VALUES (?1, ?2, ?3, ?4)")
        .bind(&step1_id).bind(&workflow_id).bind(1).bind("manager")
        .execute(&state.db).await;
    let _ = sqlx::query("INSERT INTO workflow_steps (id, workflow_id, step_order, role_required) VALUES (?1, ?2, ?3, ?4)")
        .bind(&step2_id).bind(&workflow_id).bind(2).bind("admin")
        .execute(&state.db).await;

    // 2) Expense Reimbursement: Employee → Manager
    let wf2_id = Uuid::new_v4().to_string();
    let _ = sqlx::query(
        "INSERT INTO workflow_definitions (id, tenant_id, name, description) VALUES (?1, ?2, ?3, ?4)"
    )
    .bind(&wf2_id)
    .bind(&tenant_id)
    .bind("Expense Reimbursement")
    .bind("Employee submits expense claim → Manager approves")
    .execute(&state.db)
    .await;
    let s2_id = Uuid::new_v4().to_string();
    let _ = sqlx::query("INSERT INTO workflow_steps (id, workflow_id, step_order, role_required) VALUES (?1, ?2, ?3, ?4)")
        .bind(&s2_id).bind(&wf2_id).bind(1).bind("manager")
        .execute(&state.db).await;

    // 3) Document Approval: Employee → Admin
    let wf3_id = Uuid::new_v4().to_string();
    let _ = sqlx::query(
        "INSERT INTO workflow_definitions (id, tenant_id, name, description) VALUES (?1, ?2, ?3, ?4)"
    )
    .bind(&wf3_id)
    .bind(&tenant_id)
    .bind("Document Approval")
    .bind("Employee submits document for review → Admin approves")
    .execute(&state.db)
    .await;
    let s3_id = Uuid::new_v4().to_string();
    let _ = sqlx::query("INSERT INTO workflow_steps (id, workflow_id, step_order, role_required) VALUES (?1, ?2, ?3, ?4)")
        .bind(&s3_id).bind(&wf3_id).bind(1).bind("admin")
        .execute(&state.db).await;

    // Log to audit
    let audit_id = Uuid::new_v4().to_string();
    let _ = sqlx::query(
        "INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, entity_type, entity_id, new_status, details) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)"
    )
    .bind(&audit_id)
    .bind(&tenant_id)
    .bind(&user_id)
    .bind(&body.admin_name)
    .bind("TENANT_REGISTERED")
    .bind("tenant")
    .bind(&tenant_id)
    .bind("active")
    .bind(format!("Tenant '{}' registered with admin '{}'", &body.tenant_name, &body.admin_email))
    .execute(&state.db)
    .await;

    // Generate JWT
    let claims = Claims {
        sub: user_id.clone(),
        tenant_id: tenant_id.clone(),
        role: "admin".to_string(),
        name: body.admin_name.clone(),
        email: body.admin_email.clone(),
        tenant_name: body.tenant_name.clone(),
        exp: (chrono::Utc::now() + chrono::Duration::hours(24)).timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &state.jwt_encoding_key,
    )
    .unwrap_or_default();

    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "token": token,
            "user": {
                "id": user_id,
                "name": body.admin_name,
                "email": body.admin_email,
                "role": "admin",
                "tenantId": tenant_id,
                "tenantName": body.tenant_name
            }
        })),
    )
}

/// POST /api/auth/login
/// Authenticates user by email + password, returns JWT.
pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(body): Json<LoginRequest>,
) -> impl IntoResponse {
    // Find user by email
    let user = sqlx::query_as::<_, UserRow>(
        "SELECT id, tenant_id, name, email, password_hash, role, created_at FROM users WHERE email = ?1"
    )
    .bind(&body.email)
    .fetch_optional(&state.db)
    .await;

    let user = match user {
        Ok(Some(u)) => u,
        _ => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(serde_json::json!({"error": "Invalid email or password"})),
            );
        }
    };

    // Verify password
    let parsed_hash = match PasswordHash::new(&user.password_hash) {
        Ok(h) => h,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": "Internal error"})),
            );
        }
    };

    if Argon2::default()
        .verify_password(body.password.as_bytes(), &parsed_hash)
        .is_err()
    {
        return (
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({"error": "Invalid email or password"})),
        );
    }

    // Get tenant name
    let tenant_name = sqlx::query_scalar::<_, String>(
        "SELECT name FROM tenants WHERE id = ?1"
    )
    .bind(&user.tenant_id)
    .fetch_one(&state.db)
    .await
    .unwrap_or_else(|_| "Unknown".to_string());

    // Generate JWT
    let claims = Claims {
        sub: user.id.clone(),
        tenant_id: user.tenant_id.clone(),
        role: user.role.clone(),
        name: user.name.clone(),
        email: user.email.clone(),
        tenant_name: tenant_name.clone(),
        exp: (chrono::Utc::now() + chrono::Duration::hours(24)).timestamp() as usize,
    };
    let token = encode(
        &Header::default(),
        &claims,
        &state.jwt_encoding_key,
    )
    .unwrap_or_default();

    // Audit log
    let audit_id = Uuid::new_v4().to_string();
    let _ = sqlx::query(
        "INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, entity_type, entity_id, details) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
    )
    .bind(&audit_id)
    .bind(&user.tenant_id)
    .bind(&user.id)
    .bind(&user.name)
    .bind("USER_LOGIN")
    .bind("user")
    .bind(&user.id)
    .bind(format!("{} logged in", &user.email))
    .execute(&state.db)
    .await;

    (
        StatusCode::OK,
        Json(serde_json::json!({
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "tenantId": user.tenant_id,
                "tenantName": tenant_name
            }
        })),
    )
}

/// POST /api/auth/create-user
/// Admin-only: creates a new user within the admin's tenant.
pub async fn create_user(
    State(state): State<Arc<AppState>>,
    auth: crate::middleware::auth::AuthUser,
    Json(body): Json<CreateUserRequest>,
) -> impl IntoResponse {
    // Only admins can create users
    if auth.role != "admin" {
        return (
            StatusCode::FORBIDDEN,
            Json(serde_json::json!({"error": "Only admins can create users"})),
        );
    }

    // Validate role
    if !["admin", "manager", "employee"].contains(&body.role.as_str()) {
        return (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "Role must be admin, manager, or employee"})),
        );
    }

    // Check email uniqueness
    let existing = sqlx::query_scalar::<_, String>("SELECT id FROM users WHERE email = ?1")
        .bind(&body.email)
        .fetch_optional(&state.db)
        .await;

    if let Ok(Some(_)) = existing {
        return (
            StatusCode::CONFLICT,
            Json(serde_json::json!({"error": "Email already registered"})),
        );
    }

    // Hash password
    let salt = SaltString::generate(&mut OsRng);
    let password_hash = match Argon2::default().hash_password(body.password.as_bytes(), &salt) {
        Ok(h) => h.to_string(),
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": "Failed to hash password"})),
            );
        }
    };

    let user_id = Uuid::new_v4().to_string();

    let _ = sqlx::query(
        "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?1, ?2, ?3, ?4, ?5, ?6)"
    )
    .bind(&user_id)
    .bind(&auth.tenant_id)
    .bind(&body.name)
    .bind(&body.email)
    .bind(&password_hash)
    .bind(&body.role)
    .execute(&state.db)
    .await;

    // Audit log
    let audit_id = Uuid::new_v4().to_string();
    let _ = sqlx::query(
        "INSERT INTO audit_logs (id, tenant_id, user_id, user_name, action, entity_type, entity_id, details) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
    )
    .bind(&audit_id)
    .bind(&auth.tenant_id)
    .bind(&auth.user_id)
    .bind(&auth.name)
    .bind("USER_CREATED")
    .bind("user")
    .bind(&user_id)
    .bind(format!("Created {} user '{}' ({})", &body.role, &body.name, &body.email))
    .execute(&state.db)
    .await;

    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "id": user_id,
            "name": body.name,
            "email": body.email,
            "role": body.role,
            "tenantId": auth.tenant_id
        })),
    )
}

/// GET /api/auth/me
/// Returns currently authenticated user info.
pub async fn me(
    auth: crate::middleware::auth::AuthUser,
) -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(serde_json::json!({
            "id": auth.user_id,
            "name": auth.name,
            "email": auth.email,
            "role": auth.role,
            "tenantId": auth.tenant_id,
            "tenantName": auth.tenant_name
        })),
    )
}
