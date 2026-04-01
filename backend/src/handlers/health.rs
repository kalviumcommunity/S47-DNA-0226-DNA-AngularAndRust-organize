use axum::Json;
use crate::models::health::{HealthResponse, WorkflowRequest};

/// Returns a simple string confirming the backend is running.
pub async fn hello() -> &'static str {
    "Rust Axum backend running"
}

/// Returns a JSON health check response.
pub async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        message: "Rust Axum backend running".to_string(),
    })
}

/// Returns a list of sample workflow requests as JSON.
/// Data represents requests from multiple departments across institutions.
pub async fn get_requests() -> Json<Vec<WorkflowRequest>> {
    let requests = vec![
        WorkflowRequest {
            id: 1,
            title: "Annual Leave Request – 5 Days".to_string(),
            department: "HR".to_string(),
            requested_by: "Rahul Sharma".to_string(),
            status: "Pending".to_string(),
            priority: "Medium".to_string(),
            created_at: "2024-03-28".to_string(),
            approved_by: None,
            remarks: Some("Family function in hometown".to_string()),
        },
        WorkflowRequest {
            id: 2,
            title: "Semester Exam Schedule Approval".to_string(),
            department: "Academics".to_string(),
            requested_by: "Dr. Priya Verma".to_string(),
            status: "Approved".to_string(),
            priority: "High".to_string(),
            created_at: "2024-03-25".to_string(),
            approved_by: Some("Dean Academics".to_string()),
            remarks: None,
        },
        WorkflowRequest {
            id: 3,
            title: "Lab Equipment Purchase – ₹2.5L".to_string(),
            department: "Finance".to_string(),
            requested_by: "Ankit Gupta".to_string(),
            status: "Pending".to_string(),
            priority: "High".to_string(),
            created_at: "2024-03-27".to_string(),
            approved_by: None,
            remarks: Some("Urgent requirement for physics lab upgrade".to_string()),
        },
        WorkflowRequest {
            id: 4,
            title: "Campus Wi-Fi Infrastructure Upgrade".to_string(),
            department: "Admin".to_string(),
            requested_by: "Sanjay Patel".to_string(),
            status: "Rejected".to_string(),
            priority: "Low".to_string(),
            created_at: "2024-03-20".to_string(),
            approved_by: Some("Admin Head".to_string()),
            remarks: Some("Budget exceeded for current quarter".to_string()),
        },
        WorkflowRequest {
            id: 5,
            title: "New Faculty Onboarding – 3 Positions".to_string(),
            department: "HR".to_string(),
            requested_by: "Meena Iyer".to_string(),
            status: "Approved".to_string(),
            priority: "Medium".to_string(),
            created_at: "2024-03-22".to_string(),
            approved_by: Some("HR Director".to_string()),
            remarks: None,
        },
        WorkflowRequest {
            id: 6,
            title: "Student Grievance Review – Batch 2024".to_string(),
            department: "Academics".to_string(),
            requested_by: "Prof. Kiran Desai".to_string(),
            status: "Pending".to_string(),
            priority: "High".to_string(),
            created_at: "2024-03-29".to_string(),
            approved_by: None,
            remarks: Some("Multiple complaints regarding evaluation criteria".to_string()),
        },
    ];

    Json(requests)
}
