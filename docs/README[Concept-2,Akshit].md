# Rust Backend API Request Flow

This document explains how the Rust backend processes requests from the Angular frontend, validates input using typed structs, interacts with PostgreSQL, and returns JSON responses.

---

# 1. API Explanation (Route → Handler → Logic → Response)

The backend API is built using Rust and follows a structured request processing flow. When the Angular frontend sends a request, the Rust backend routes the request to the appropriate handler, processes business logic, interacts with PostgreSQL, and sends a JSON response back to the frontend.

---

## Route Mapping

In Rust frameworks such as **Axum** or **Actix**, routes map HTTP endpoints to handler functions.

Example:

```rust
Router::new()
    .route("/products", post(create_product))
```

Explanation:

* `/products` is the API endpoint.
* `POST` is the HTTP method.
* `create_product` is the handler function.

When Angular sends a POST request to `/products`, the request is forwarded to the `create_product` handler.

---

## Handler Processing

The handler function receives the HTTP request and processes the data.

Example:

```rust
async fn create_product(
    Json(payload): Json<CreateProductRequest>,
) -> Result<Json<ProductResponse>, StatusCode> {
```

The handler performs the following steps:

1. Receives the request data.
2. Converts JSON input into a typed Rust struct.
3. Validates the input data.
4. Executes business logic.
5. Interacts with the PostgreSQL database.
6. Returns a JSON response.

---

## Typed Structs for Safe Input and Output

Rust uses typed structs to define request and response formats.

Example request struct:

```rust
#[derive(Deserialize)]
struct CreateProductRequest {
    name: String,
    quantity: i32,
}
```

Example response struct:

```rust
#[derive(Serialize)]
struct ProductResponse {
    id: i32,
    name: String,
    quantity: i32,
}
```

Typed structs ensure:

* Correct request format
* Correct data types
* Automatic validation during request parsing

This improves reliability and prevents invalid data from reaching the business logic.

---

## Business Logic Processing

After the request is validated, the handler executes business logic such as:

* Checking product values
* Preparing database operations
* Creating response objects

Rust's strong type system ensures predictable behavior and prevents many runtime errors.

---

## Database Interaction (PostgreSQL using SQLx)

The backend interacts with PostgreSQL using SQLx.

Example query:

```rust
sqlx::query!(
    "INSERT INTO products (name, quantity) VALUES ($1, $2)",
    payload.name,
    payload.quantity
)
.execute(&pool)
.await?;
```

SQLx provides:

* Compile-time query checking
* Type-safe database interactions
* Protection against SQL injection

---

## Returning JSON Response

After successful processing, the API returns a JSON response.

Example:

```rust
Ok(Json(ProductResponse {
    id,
    name: payload.name,
    quantity: payload.quantity,
}))
```

This response is received by Angular and used to update the UI.

---

# 2. End-to-End API Request Flow Diagram

```
Angular Service (HTTP Request)
        ↓
Rust Route
        ↓
Rust Handler
(Validation + Business Logic)
        ↓
PostgreSQL Query
        ↓
Rust JSON Response
        ↓
Angular UI Update
```

Explanation:

1. Angular sends an HTTP request.
2. Rust route identifies the correct handler.
3. Handler validates the request using typed structs.
4. Business logic executes.
5. SQLx runs the PostgreSQL query.
6. Rust returns a JSON response.
7. Angular updates the UI.

---

# 3. Reflection

Type-safe and strongly validated Rust APIs are important in modern backend development because they improve reliability, safety, and predictability.

Rust’s strong type system ensures that many potential errors are detected at compile time instead of runtime. Typed request and response structures guarantee that APIs only accept valid data formats, reducing unexpected failures.

Additionally, Rust’s memory safety and predictable error handling improve backend stability. This makes Rust a powerful choice for building secure and high-performance backend systems.

---

# 4. AI Feedback Improvement

Before finalizing this documentation, the explanation was reviewed using an AI assistant to improve clarity and architectural explanation.

The following improvements were applied:

* Simplified explanation of request flow.
* Improved structure of Route → Handler → Logic → Response.
* Clarified the role of typed structs in input validation.
* Improved the architecture diagram explanation.

These revisions help clearly communicate how the Rust backend processes requests.

---

# Case Study: Add Product Flow

Example scenario:
A user submits a form to add a product.

Product Name: **Laptop**
Quantity: **5**

---

## Step 1 – Angular Sends Request

The Angular service sends a POST request:

```
POST /products
{
  "name": "Laptop",
  "quantity": 5
}
```

---

## Step 2 – Rust Route Matches Endpoint

The Rust router detects the `/products` endpoint and routes the request to the `create_product` handler.

---

## Step 3 – Handler Receives Typed Data

The request JSON is converted into a Rust struct:

```
CreateProductRequest {
  name: "Laptop",
  quantity: 5
}
```

If the request format is invalid, Rust rejects it automatically.

---

## Step 4 – Validation and Business Logic

The handler validates the data and prepares the database operation.

---

## Step 5 – PostgreSQL Insert Query

SQLx executes the database query:

```
INSERT INTO products (name, quantity)
VALUES ('Laptop', 5);
```

The product is stored in the database.

---

## Step 6 – Rust Returns JSON Response

Rust returns a JSON response:

```
{
  "id": 1,
  "name": "Laptop",
  "quantity": 5
}
```

---

## Step 7 – Angular Updates UI

The Angular frontend receives the response and updates the product list in the user interface.
