use axum::{
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use std::sync::Arc;

use crate::config::AppState;
use crate::models::auth::Claims;
use crate::models::ApiError;

/// Authenticated user extracted from JWT Bearer token.
/// Use this as an extractor in any handler that requires authentication.
///
/// Example:
/// ```
/// async fn handler(auth: AuthUser) -> impl IntoResponse { ... }
/// ```
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: String,
    pub tenant_id: String,
    pub role: String,
    pub name: String,
    pub email: String,
    pub tenant_name: String,
}

impl FromRequestParts<Arc<AppState>> for AuthUser {
    type Rejection = Response;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &Arc<AppState>,
    ) -> Result<Self, Self::Rejection> {
        // Extract Bearer token from Authorization header
        let auth_header = parts
            .headers
            .get("authorization")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.strip_prefix("Bearer "));

        let token = match auth_header {
            Some(t) => t,
            None => {
                return Err((
                    StatusCode::UNAUTHORIZED,
                    Json(ApiError::new("Missing or invalid Authorization header")),
                )
                    .into_response());
            }
        };

        // Decode and validate JWT
        let token_data = decode::<Claims>(
            token,
            &state.jwt_decoding_key,
            &Validation::default(),
        );

        match token_data {
            Ok(data) => Ok(AuthUser {
                user_id: data.claims.sub,
                tenant_id: data.claims.tenant_id,
                role: data.claims.role,
                name: data.claims.name,
                email: data.claims.email,
                tenant_name: data.claims.tenant_name,
            }),
            Err(_) => Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiError::new("Invalid or expired token")),
            )
                .into_response()),
        }
    }
}

/// Role-based guard helper. Returns Err response if user doesn't have required role.
pub fn require_role(auth: &AuthUser, allowed: &[&str]) -> Result<(), Response> {
    if allowed.contains(&auth.role.as_str()) {
        Ok(())
    } else {
        Err((
            StatusCode::FORBIDDEN,
            Json(ApiError::new("Insufficient permissions")),
        )
            .into_response())
    }
}
