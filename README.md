# Multi-Tenant Workflow Automation SaaS

**Angular + Rust (Axum) + PostgreSQL**

A multi-tenant SaaS platform where institutions can independently register, configure approval workflows, submit requests, and maintain a full audit trail.

---

## 📁 Project Structure

```
├── frontend/          # Angular 19 (routing, SSR)
├── backend/           # Rust Axum web server
├── docs/              # Project documentation
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

| Tool      | Required Version |
|-----------|-----------------|
| Node.js   | v18+ LTS        |
| npm       | v9+             |
| Rust      | 1.75+           |
| Cargo     | 1.75+           |

### Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

Open **http://localhost:4200** — you should see the Angular welcome page.

### Backend (Rust/Axum)

```bash
cd backend
cargo run
```

Open **http://localhost:8080** — returns `"Rust Axum backend running"`.  
Open **http://localhost:8080/health** — returns JSON health check.

---

## 🛠️ Tech Stack

| Layer    | Technology              |
|----------|------------------------|
| Frontend | Angular 19, TypeScript  |
| Backend  | Rust, Axum 0.8, Tokio   |
| Database | PostgreSQL (upcoming)   |
| Auth     | JWT + Argon2 (upcoming) |

---

## 📋 Sprint #2 Scope

- Multi-tenant registration & isolation
- RBAC: Tenant Admin / Manager / Employee
- Leave Approval workflow engine
- Request lifecycle: Submit → Approve/Reject → Audit
- Dashboard per role

---

*Sprint #2 — Angular + Rust Web Engineering*
