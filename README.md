# Multi-Tenant Workflow Automation SaaS

**Angular + Rust (Axum) + PostgreSQL**

A multi-tenant SaaS platform where institutions can independently register, configure approval workflows, submit requests, and maintain a full audit trail.

---

## 📁 Project Structure Overview

```
S47-DNA-0226-DNA-AngularAndRust-organize/
├── frontend/              # Angular 21 Application
│   ├── src/
│   │   ├── app/           # Core application logic
│   │   │   ├── app.ts                  # Root component (TypeScript logic)
│   │   │   ├── app.html                # Root component template (HTML)
│   │   │   ├── app.css                 # Root component styles
│   │   │   ├── app.config.ts           # App-wide providers & configuration
│   │   │   ├── app.config.server.ts    # Server-side rendering config
│   │   │   ├── app.routes.ts           # Client-side route definitions
│   │   │   └── app.routes.server.ts    # Server-side route config
│   │   ├── index.html                  # Entry HTML file served to browser
│   │   ├── main.ts                     # Application bootstrap (client)
│   │   ├── main.server.ts              # Application bootstrap (SSR)
│   │   ├── server.ts                   # Express server for SSR
│   │   └── styles.css                  # Global stylesheet
│   ├── public/                         # Static assets (favicon, images)
│   ├── angular.json                    # Angular workspace configuration
│   ├── package.json                    # npm dependencies & scripts
│   └── tsconfig.json                   # TypeScript compiler settings
│
├── backend/               # Rust Axum API Server
│   ├── src/
│   │   ├── main.rs                     # Application entry point
│   │   ├── routes/                     # Routing layer
│   │   │   ├── mod.rs                  # Route aggregator
│   │   │   └── health.rs              # Health check route definitions
│   │   ├── handlers/                   # Business logic layer
│   │   │   ├── mod.rs                  # Handler module exports
│   │   │   └── health.rs              # Health check handler functions
│   │   └── models/                     # Typed data structures
│   │       ├── mod.rs                  # Model module exports
│   │       └── health.rs              # Health response struct
│   ├── Cargo.toml                      # Dependencies & project metadata
│   └── Cargo.lock                      # Locked dependency versions
│
├── docs/                  # Project Documentation
│   ├── README[Concept-1,Akshit].md     # System architecture overview
│   ├── README[Concept-2,Akshit].md     # Backend API design
│   └── README[Concept-3,Akshit].md     # Frontend UI architecture
│
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

---

## 🔍 Angular Project Structure Breakdown

### What lives inside `/src`

The `src/` directory is the root of all source code for the Angular application. It contains:

- **`index.html`** — The single HTML page served to the browser. Angular dynamically renders all content into this file's `<app-root>` tag. This is the entry point for the Single Page Application (SPA).
- **`main.ts`** — Bootstraps the Angular application on the client side. It initializes the root component and starts the Angular framework.
- **`main.server.ts`** — Bootstraps the app for Server-Side Rendering (SSR). Used when the app is rendered on the server before being sent to the browser.
- **`server.ts`** — An Express.js server that handles SSR, serving pre-rendered HTML to improve initial load performance and SEO.
- **`styles.css`** — Global styles applied across the entire application. Component-specific styles go in each component's own CSS file.

### The purpose of the `/app` folder

The `app/` folder is where all application logic lives. It contains the root component, configuration, and route definitions. As the project grows, this folder will contain:

- **Components** — UI building blocks (e.g., `LoginComponent`, `DashboardComponent`). Each component gets its own folder with `.ts`, `.html`, and `.css` files.
- **Services** — Classes that handle API communication and shared business logic (e.g., `AuthService`, `WorkflowService`). Services are injected into components via Angular's dependency injection.
- **Guards** — Route protection logic (e.g., checking authentication before allowing access).
- **Models/Interfaces** — TypeScript interfaces defining data shapes (e.g., `User`, `Tenant`, `WorkflowRequest`).

### What `app.config.ts` does (replaces `app.module.ts`)

> **Note:** Angular 21 uses standalone components by default. The traditional `app.module.ts` has been replaced by `app.config.ts`.

`app.config.ts` serves the same purpose — it configures application-wide providers and settings:

- **`provideRouter(routes)`** — Registers the routing configuration so Angular knows how to navigate between pages.
- **`provideClientHydration()`** — Enables client-side hydration for SSR, allowing the browser to "take over" server-rendered HTML seamlessly.
- **`provideBrowserGlobalErrorListeners()`** — Sets up global error handling for the browser environment.

In older Angular versions, `app.module.ts` handled this via `@NgModule({ imports: [...], providers: [...] })`.

### What `app.ts` / `app.html` / `app.css` represent

These three files form the **root component** — the top-level container for the entire application:

| File | Role |
|------|------|
| `app.ts` | The **TypeScript class** defining the component's logic, properties, and behavior. Contains the `@Component` decorator linking the template and styles. |
| `app.html` | The **HTML template** defining what the component renders. Uses Angular template syntax (`{{ }}`, `@for`, `@if`) for dynamic content. |
| `app.css` | The **scoped stylesheet** for this component only. Styles defined here do not leak to other components. |

The root component includes `<router-outlet />` which acts as a placeholder — Angular swaps in different page components based on the current URL.

### Where components and services belong

```
src/app/
├── components/            # UI components (pages & reusable)
│   ├── login/
│   ├── dashboard/
│   └── shared/            # Reusable UI elements
├── services/              # API communication & business logic
│   ├── auth.service.ts
│   └── workflow.service.ts
├── guards/                # Route protection
├── models/                # TypeScript interfaces
├── app.ts                 # Root component
├── app.config.ts          # App configuration
└── app.routes.ts          # Route definitions
```

### How Angular organizes UI logic vs. API logic

Angular enforces a clear **separation of concerns**:

| Concern | Where it lives | Example |
|---------|---------------|---------|
| **UI rendering** | Components (`.ts` + `.html` + `.css`) | Displaying a form, handling button clicks |
| **API communication** | Services (`.service.ts`) | Calling `PUT /api/profile` via `HttpClient` |
| **Navigation** | Routes (`app.routes.ts`) | Defining URL → Component mappings |
| **Data shapes** | Models/Interfaces (`.model.ts`) | `interface User { id: string; name: string; }` |

Components **never** call APIs directly. They inject services and call service methods. This keeps UI code clean and makes API logic reusable across multiple components.

---

## 🦀 Rust Project Structure Breakdown

### `src/main.rs` — Application Entry Point

The `main.rs` file is the starting point of the Rust backend. It:

1. Imports the `routes`, `handlers`, and `models` modules
2. Builds the Axum `Router` by calling `routes::create_routes()`
3. Binds a TCP listener to `127.0.0.1:8080`
4. Starts the Axum server to process incoming HTTP requests

`main.rs` is intentionally kept **minimal** — it only wires things together. All routing, business logic, and data structures live in their own modules.

### `/routes` folder — Routing Layer

The `routes/` folder defines **which URLs map to which handler functions**. It contains:

- **`mod.rs`** — Aggregates all route sub-modules into a single `Router`. This is the only file `main.rs` needs to call.
- **`health.rs`** — Defines the health-check routes: `GET /` and `GET /health`.

Routes define the **"what"** (URL path + HTTP method) but delegate the **"how"** (actual logic) to handlers. This separation means you can reorganize URLs without touching business logic.

### `/handlers` folder — Business Logic Layer

The `handlers/` folder contains the **actual functions** that process requests. Each handler:

1. Receives the parsed request (body, params, headers)
2. Executes business logic (validation, computation, database calls)
3. Returns a structured response (JSON, status codes)

- **`mod.rs`** — Exports all handler sub-modules.
- **`health.rs`** — Contains `hello()` and `health_check()` functions.

As the project grows, this folder will contain handlers for authentication, tenant management, workflow processing, etc.

### `/models` folder — Typed Structs

The `models/` folder defines **data structures** used throughout the application:

- **Request models** — Structs representing incoming JSON request bodies (deserialized with `serde::Deserialize`)
- **Response models** — Structs representing outgoing JSON responses (serialized with `serde::Serialize`)
- **Database models** — Structs mapping to PostgreSQL table rows

- **`mod.rs`** — Exports all model sub-modules.
- **`health.rs`** — Defines `HealthResponse` with `status` and `message` fields.

Using typed models provides **compile-time safety** — if the response shape changes, the Rust compiler catches all affected code immediately.

### `Cargo.toml` — Dependencies & Metadata

`Cargo.toml` is the Rust equivalent of `package.json`. It defines:

| Field | Purpose |
|-------|---------|
| `[package]` | Project name, version, and Rust edition |
| `[dependencies]` | External crates (libraries) the project uses |

Current dependencies:

| Crate | Purpose |
|-------|---------|
| `axum 0.8` | Web framework for building HTTP APIs |
| `tokio 1` | Async runtime powering the server |
| `serde 1` | Serialization/deserialization of JSON data |
| `serde_json 1` | JSON parsing and generation |

### Config & Migration Folders (Planned)

As the project progresses into Sprint #2, these folders will be added:

```
backend/src/
├── config/          # Database connection, environment variables, JWT secrets
├── middleware/       # Authentication, CORS, logging middleware
└── migrations/      # PostgreSQL schema migration files (via SQLx)
```

---

## 🚀 Quick Start

### Prerequisites

| Tool      | Required Version |
|-----------|--------------------|
| Node.js   | v18+ LTS           |
| npm       | v9+                |
| Rust      | 1.75+              |
| Cargo     | 1.75+              |

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
| Frontend | Angular 21, TypeScript  |
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
