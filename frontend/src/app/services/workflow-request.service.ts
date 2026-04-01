import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkflowRequest } from '../models/workflow-request.model';

/**
 * WorkflowRequestService
 *
 * Handles all API communication related to Workflow Requests.
 * This service demonstrates how TypeScript enforces type safety
 * in Angular services:
 *
 * - The return type Observable<WorkflowRequest[]> guarantees the response
 *   will be an array of WorkflowRequest objects
 * - HttpClient.get<WorkflowRequest[]>() uses TypeScript generics to type
 *   the HTTP response automatically
 * - Any component consuming this service gets full IntelliSense
 *   and compile-time checks on the returned data
 *
 * TypeScript Features Demonstrated:
 * - Generics: Observable<T>, HttpClient.get<T>()
 * - Typed function return values
 * - Class with dependency injection
 * - Import and usage of interfaces
 */
@Injectable({
  providedIn: 'root'
})
export class WorkflowRequestService {

  private apiUrl = 'http://localhost:8080/api/requests';

  constructor(private http: HttpClient) {}

  /**
   * Fetches all workflow requests from the Rust backend API.
   * Returns a typed Observable — subscribers receive WorkflowRequest[] not any[].
   */
  getRequests(): Observable<WorkflowRequest[]> {
    return this.http.get<WorkflowRequest[]>(this.apiUrl);
  }

  /**
   * Fetches a single workflow request by its ID.
   * Demonstrates generics with a single entity response.
   */
  getRequestById(id: number): Observable<WorkflowRequest> {
    return this.http.get<WorkflowRequest>(`${this.apiUrl}/${id}`);
  }
}
