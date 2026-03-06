# Angular + Rust Web Engineering – Architecture 

## Project: Multi‑Tenant Workflow Automation SaaS

This repository contains documentation explaining how an Angular frontend communicates with a Rust backend and PostgreSQL database in a modern full‑stack architecture.

---

# 1. System Architecture Overview

The application follows a **three‑layer architecture**:

```
User → Angular Frontend → Rust Backend API → PostgreSQL Database
```

Each layer has a clear responsibility:

| Layer      | Responsibility                                                 |
| ---------- | -------------------------------------------------------------- |
| Angular    | Handles UI rendering, user interactions, and API communication |
| Rust       | Processes requests, enforces business logic, validates data    |
| PostgreSQL | Stores and retrieves persistent application data               |

This separation ensures scalability, maintainability, and performance.

---

# 2. Angular Frontend

Angular is responsible for handling all **user interactions** and rendering the application UI.

## Components

Angular components represent parts of the user interface.

Example:

```
ProfileComponent
```

Responsibilities:

* Capture user input
* Handle UI events
* Call Angular services
* Update the view when data changes

Example scenario:

When a user clicks **Save Changes** on their profile, the component collects the form data and calls a service method.

---

## Services

Angular services handle **communication with the backend API**.

They use Angular's **HttpClient** module to send HTTP requests.

Example:

```
profileService.updateProfile(data)
```

This service sends an HTTP request such as:

```
PUT /api/profile
```

The request contains updated user data in JSON format.

---

# 3. Rust Backend

The backend is implemented using **Rust with Axum (or Actix)**.

Rust handles:

* API request handling
* Authentication and authorization
* Business logic
* Data validation
* Communication with PostgreSQL

Example API endpoint:

```
PUT /api/profile
```

When Rust receives a request it performs the following steps:

1. Parses incoming JSON data
2. Validates the request
3. Executes business logic
4. Interacts with the database
5. Sends a structured response back to Angular

Rust is chosen because it provides **high performance, strong type safety, and memory safety**.

---

# 4. PostgreSQL Database

PostgreSQL stores all application data including:

* tenants
* users
* workflows
* requests
* approvals
* audit logs

Rust communicates with PostgreSQL using a database library such as:

```
SQLx
```

Example query executed by Rust:

```
UPDATE users
SET name = $1, email = $2, phone = $3
WHERE id = $4
```

The database returns the result to Rust, which then sends a response to Angular.

---

# 5. End‑to‑End Request Flow

Below is the full request lifecycle in the system.

```
User Interaction
      ↓
Angular Component
      ↓
Angular Service (HttpClient)
      ↓
HTTP Request
      ↓
Rust API Endpoint
      ↓
Business Logic Layer
      ↓
PostgreSQL Query
      ↓
Database Response
      ↓
Rust API Response
      ↓
Angular UI Update
```

### Step‑by‑Step Explanation

1. The user interacts with the UI (e.g., clicks **Save Changes**).
2. The Angular component captures the event.
3. The component calls an Angular service.
4. The service sends an HTTP request using HttpClient.
5. Rust receives the request at an API endpoint.
6. Rust executes validation and business logic.
7. Rust performs a query on PostgreSQL.
8. PostgreSQL returns the query result.
9. Rust sends a JSON response to Angular.
10. Angular updates the UI based on the response.

---

# 6. Case Study – Updating a User Profile

This section explains the **complete technical flow** when a user updates their profile.

### Step 1 – Angular Form

The user edits their information in the profile form:

* Name
* Email
* Phone Number

The user then clicks **Save Changes**.

---

### Step 2 – Angular Component

The `ProfileComponent` collects the form data and triggers a service call.

Example:

```
this.profileService.updateProfile(formData)
```

---

### Step 3 – Angular Service

The service sends an HTTP request to the backend.

Example request:

```
PUT /api/profile
Content-Type: application/json
```

Request body:

```
{
  "name": "Akshit",
  "email": "akshit@example.com",
  "phone": "1234567890"
}
```

---

### Step 4 – Rust API Handler

Rust receives the request using an API handler.

The handler performs:

* Request parsing
* Input validation
* Authentication check

If validation succeeds, Rust proceeds to update the database.

---

### Step 5 – PostgreSQL Query

Rust executes an SQL update query:

```
UPDATE users
SET name=$1, email=$2, phone=$3
WHERE id=$4
```

The database updates the user record.

---

### Step 6 – Rust Response

Rust returns a JSON response to the frontend.

Example:

```
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### Step 7 – Angular UI Update

Angular receives the response and updates the UI.

Possible actions:

* Display success message
* Update profile information
* Refresh displayed data

This completes the full request lifecycle.

---

# 7. Why Frontend and Backend Separation Matters

Separating the frontend and backend is important in modern web systems for several reasons.

### Scalability

Frontend and backend services can scale independently. For example, Angular can be served from a CDN while Rust APIs run on scalable cloud servers.

### Maintainability

Frontend and backend codebases remain modular. Teams can work independently without interfering with each other.

### Performance

Rust provides high‑performance APIs capable of handling large numbers of concurrent requests efficiently.

### Security

Sensitive operations such as authentication, authorization, and database access are handled on the backend rather than exposed to the client.

### Type Safety

Angular uses **TypeScript**, which adds static typing to JavaScript and helps detect errors during development.

Rust enforces strict **compile‑time safety guarantees**, preventing memory errors and data races.

Together, Angular and Rust create a **type‑safe full‑stack environment** that reduces bugs and improves reliability.

---

# 8. AI Feedback Improvement

Before final submission, the documentation was reviewed using AI tools to improve:

* clarity of explanations
* structure of technical flow
* depth of architectural description

Revisions were applied to ensure the documentation clearly explains how the system works end‑to‑end.

---

# Conclusion

This project demonstrates a modern full‑stack architecture where **Angular handles user interaction**, **Rust manages backend logic and APIs**, and **PostgreSQL stores persistent data**. The structured separation between these layers enables a scalable, maintainable, and high‑performance web system.
