# Angular Frontend UI Architecture

This document explains how the Angular frontend interacts with the Rust backend using Angular components and services. The architecture follows a component-driven design where UI components handle user interaction and Angular services manage API communication with the Rust backend.

---

# 1. Angular UI Feature Explanation (Component + Service)

In this implementation, a **ProductList component** is created to display products retrieved from the backend API. The component interacts with a service responsible for calling the Rust backend using Angular's HttpClient.

---

## Angular Component

The **ProductList component** is responsible for rendering the user interface and responding to user interactions.

Responsibilities of the component:

* Display a list of products
* Trigger API requests when a user clicks a button
* Receive data from the Angular service
* Update the UI with the received data

Example component logic:

```typescript
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {

  products: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {}

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }
}
```

---

## Component Template

The template renders UI elements and binds data from the component.

Example template:

```html
<button (click)="loadProducts()">View Products</button>

<ul>
  <li *ngFor="let product of products">
    {{ product.name }} - Quantity: {{ product.quantity }}
  </li>
</ul>
```

When the **"View Products"** button is clicked, the component calls the service to fetch product data.

---

## Angular Service

Angular services handle API communication and business logic outside the UI layer. This keeps the component focused only on presentation.

Example service implementation:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8080/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
```

The service uses **HttpClient** to call the Rust backend API and returns an observable response to the component.

---

## How Data Updates the UI

1. The user clicks the **View Products** button.
2. The Angular component calls the service method.
3. The service sends an HTTP GET request to the Rust API.
4. Rust processes the request and returns JSON data.
5. The component receives the response and updates the `products` array.
6. Angular automatically re-renders the UI using data binding.

---

# 2. End-to-End Frontend → Backend Flow Diagram

```
User Interaction
      ↓
Angular Component
      ↓
Angular Service (HttpClient)
      ↓
Rust API Route
      ↓
Rust Handler + Business Logic
      ↓
PostgreSQL Query
      ↓
Rust JSON Response
      ↓
Angular Component Re-Renders UI
```

Explanation:

1. A user interacts with the UI (clicks a button).
2. The Angular component handles the event.
3. The component calls an Angular service.
4. The service sends an HTTP request to the Rust backend.
5. Rust identifies the API route and forwards the request to the correct handler.
6. The handler executes business logic and queries PostgreSQL if necessary.
7. Rust returns a JSON response.
8. Angular receives the response and updates the UI.

---

# 3. Code Implementation (Component + Service)

The implementation includes:

* A functional Angular component (`ProductListComponent`).
* An Angular service (`ProductService`) that calls the Rust backend API.
* Data retrieved from the backend displayed in the UI.

This structure ensures a clear separation between UI logic and backend communication.

---

# 4. Reflection

Using components and services makes Angular applications more scalable and maintainable.

Components focus on presenting the UI and handling user interactions, while services manage business logic and API communication. This separation of concerns improves code organization and makes the application easier to maintain.

Additionally, services can be reused across multiple components, reducing code duplication. The modular architecture of Angular also allows developers to expand the application easily by adding new components or services without affecting existing functionality.

---

