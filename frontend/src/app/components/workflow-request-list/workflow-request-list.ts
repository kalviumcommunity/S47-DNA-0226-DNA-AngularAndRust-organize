import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowRequestService } from '../../services/workflow-request.service';
import { WorkflowRequest } from '../../models/workflow-request.model';
import { SharedModule } from '../../shared/shared-module';

/**
 * WorkflowRequestListComponent
 *
 * Displays a list of workflow requests fetched from the backend API.
 * Demonstrates how TypeScript + Angular work together:
 *
 * - The component declares `requests` as WorkflowRequest[] — not any[]
 * - The service returns Observable<WorkflowRequest[]> — typed end-to-end
 * - Template binds to typed properties, getting compile-time checks
 * - If the WorkflowRequest interface changes, TypeScript catches all broken references
 *
 * TypeScript Features Demonstrated:
 * - Typed class properties (requests: WorkflowRequest[])
 * - Typed method parameters and return values
 * - Interface import and usage in a component
 * - Angular signals with type inference
 * - Union types (string | null)
 */
@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './workflow-request-list.html',
  styleUrl: './workflow-request-list.css'
})
export class WorkflowRequestListComponent implements OnInit {

  /** Strongly typed array — only WorkflowRequest objects can be stored here */
  requests: WorkflowRequest[] = [];

  /** Loading state signal with inferred boolean type */
  isLoading = signal<boolean>(false);

  /** Error message — string or null demonstrates union types */
  errorMessage: string | null = null;

  constructor(private requestService: WorkflowRequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  /**
   * Fetches workflow requests from the service and assigns them to the typed array.
   * The subscribe callback receives WorkflowRequest[] — fully typed, no casting needed.
   */
  loadRequests(): void {
    this.isLoading.set(true);
    this.errorMessage = null;

    this.requestService.getRequests().subscribe({
      next: (requests: WorkflowRequest[]) => {
        this.requests = requests;
        this.isLoading.set(false);

        // Console log demonstrates typed data in action
        console.log('Fetched requests (typed as WorkflowRequest[]):', requests);
        console.log('First request title:', requests[0]?.title);
        console.log('First request department:', requests[0]?.department);
        console.log('First request status:', requests[0]?.status);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load workflow requests. Is the backend running?';
        this.isLoading.set(false);
        console.error('API Error:', err);
      }
    });
  }

  /** Returns a CSS class based on request status */
  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  /** Returns a CSS class based on priority level */
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      default: return 'priority-low';
    }
  }
}
