# Rust Core Concepts: Ownership, Borrowing, and Lifetimes 🦀

This document explains the three pillar concepts that make Rust one of the most secure and performant languages for backend development.

---

## 1. Ownership 💎

**Ownership** is Rust's most unique feature. It manages memory without a garbage collector through a set of rules:

- **One Owner**: Each value in Rust has a single variable that is its "owner."
- **One at a Time**: Only one owner exists at any given moment.
- **Auto-Drop**: When the owner goes out of scope, the value is automatically cleaned up (dropped).
- **Move Semantics**: When you assign a value to another variable, ownership is *moved*.

### Example: Ownership Move
```rust
fn main() {
    let s1 = String::from("hello"); // s1 owns the string
    let s2 = s1; // Ownership moves from s1 to s2

    // println!("{}", s1); // ❌ ERROR: s1 is no longer valid
    println!("{}", s2); // ✅ SUCCESS: s2 is the current owner
}
```
**Why s1 becomes invalid?**
When `s2 = s1`, Rust moves the pointer to the heap data from `s1` to `s2`. To prevent "double-free" errors (cleaning up the same memory twice), Rust invalidates `s1` so it can no longer be used.

---

## 2. Borrowing 📚

Instead of moving ownership, we can **borrow** a value using references (`&`). 

- **Immutable Borrow (`&T`)**: You can have as many as you want, but you can't change the value.
- **Mutable Borrow (`&mut T`)**: You can only have **one** at a time to prevent data races.
- **The Rule**: You cannot have a mutable borrow while any immutable borrows exist.

### Example: Borrowing & Errors
```rust
fn print_len(s: &String) {
    println!("Length: {}", s.len());
}

fn main() {
    let mut data = String::from("Rust");

    print_len(&data); // ✅ Immutable borrow (read-only)

    let r1 = &mut data; // ✅ Mutable borrow 1
    // let r2 = &mut data; // ❌ ERROR: Cannot borrow `data` as mutable more than once at a time
    
    r1.push_str(" is awesome!");
    println!("{}", r1);
}
```

---

## 3. Lifetimes ⏳

**Lifetimes** are a way for the Rust compiler to ensure that all borrows are valid and no reference points to invalid memory (dangling references). Most of the time, Rust infers lifetimes automatically, but sometimes we need to specify them.

### Example: The Longest Function
```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("long");
    let s2 = "longer";
    
    let result = longest(s1.as_str(), s2);
    println!("The longest is {}", result);
}
```
**What `'a` guarantees?**
The lifetime annotation `<'a>` tells the compiler that the returned reference will live **at least as long as** the shortest-lived input (`x` or `y`). This prevents the function from returning a reference to a string that might be dropped before the result is used.

---

## 🚀 Impact on itganize Backend (Actix/Axum)

Ownership, borrowing, and lifetimes are essential for building a reliable multi-tenant workflow SaaS:

1.  **Preventing Dangling References**: In high-performance backend handlers, Rust ensures that data passed between services (like `WorkflowRequest` from the database to the API handler) never points to "garbage" memory, preventing crashes.
2.  **Avoiding Data Races**: Because Rust enforces "one mutable borrow at a time," it's impossible to have two async tasks accidentally modify the same `Tenant` configuration simultaneously. This eliminates a huge class of concurrency bugs common in other languages.
3.  **Ensuring Safe Database Connections**: Rust's ownership rules ensure that database connection pools are used efficiently—a connection is "borrowed" for a query and automatically "returned" to the pool when the variable goes out of scope.
4.  **Security**: By preventing invalid data access at the compiler level, we ensure that one institution's data can never "leak" into another due to memory-unsafety bugs.

---

*Multi-Tenant Workflow SaaS — Rust Engineering*
