use sqlx::sqlite::SqlitePool;

/// Initializes the database schema. Creates all MVP tables if they don't exist.
pub async fn initialize(pool: &SqlitePool) {
    // Enable WAL mode for better concurrency
    sqlx::query("PRAGMA journal_mode=WAL;")
        .execute(pool)
        .await
        .ok();

    sqlx::query("PRAGMA foreign_keys=ON;")
        .execute(pool)
        .await
        .ok();

    // --- Tenants ---
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS tenants (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )"
    )
    .execute(pool)
    .await
    .expect("Failed to create tenants table");

    // --- Users ---
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            tenant_id TEXT NOT NULL REFERENCES tenants(id),
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'employee')),
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )"
    )
    .execute(pool)
    .await
    .expect("Failed to create users table");

    // --- Workflow Definitions ---
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS workflow_definitions (
            id TEXT PRIMARY KEY NOT NULL,
            tenant_id TEXT NOT NULL REFERENCES tenants(id),
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )"
    )
    .execute(pool)
    .await
    .expect("Failed to create workflow_definitions table");

    // --- Workflow Steps ---
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS workflow_steps (
            id TEXT PRIMARY KEY NOT NULL,
            workflow_id TEXT NOT NULL REFERENCES workflow_definitions(id),
            step_order INTEGER NOT NULL,
            role_required TEXT NOT NULL,
            UNIQUE(workflow_id, step_order)
        )"
    )
    .execute(pool)
    .await
    .expect("Failed to create workflow_steps table");

    // --- Requests ---
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY NOT NULL,
            tenant_id TEXT NOT NULL REFERENCES tenants(id),
            workflow_id TEXT NOT NULL REFERENCES workflow_definitions(id),
            created_by TEXT NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            description TEXT,
            current_step INTEGER NOT NULL DEFAULT 1,
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )"
    )
    .execute(pool)
    .await
    .expect("Failed to create requests table");

    // --- Approvals ---
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS approvals (
            id TEXT PRIMARY KEY NOT NULL,
            request_id TEXT NOT NULL REFERENCES requests(id),
            step_order INTEGER NOT NULL,
            approved_by TEXT NOT NULL REFERENCES users(id),
            decision TEXT NOT NULL CHECK(decision IN ('approved', 'rejected')),
            comment TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )"
    )
    .execute(pool)
    .await
    .expect("Failed to create approvals table");

    // --- Audit Logs ---
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY NOT NULL,
            tenant_id TEXT NOT NULL REFERENCES tenants(id),
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL DEFAULT '',
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            old_status TEXT,
            new_status TEXT,
            details TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )"
    )
    .execute(pool)
    .await
    .expect("Failed to create audit_logs table");

    println!("✅ Database schema initialized (7 tables)");
}
