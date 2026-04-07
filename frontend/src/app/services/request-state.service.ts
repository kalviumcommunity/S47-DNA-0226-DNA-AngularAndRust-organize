import { Injectable, signal, computed } from '@angular/core';
import { WorkflowRequest } from '../models/api.models';

/**
 * RequestStateService
 *
 * A singleton service that maintains the currently selected WorkflowRequest
 * across route changes. This demonstrates Angular's service-based state
 * management pattern — data set on the Dashboard persists when navigating
 * to the Detail page, avoiding unnecessary re-fetches.
 *
 * Key Angular concepts demonstrated:
 * - providedIn: 'root' → singleton across the entire app
 * - Signals for reactive state management
 * - Service as a shared data bridge between routed components
 */
@Injectable({ providedIn: 'root' })
export class RequestStateService {
  // ── Reactive state using Angular signals ──
  private selectedRequestSignal = signal<WorkflowRequest | null>(null);
  private allRequestsSignal = signal<WorkflowRequest[]>([]);

  /** The currently selected request (read-only computed) */
  selectedRequest = computed(() => this.selectedRequestSignal());

  /** All cached requests (read-only computed) */
  allRequests = computed(() => this.allRequestsSignal());

  /** Whether a request is currently selected */
  hasSelection = computed(() => this.selectedRequestSignal() !== null);

  /**
   * Store the selected request before navigating to the detail page.
   * Called from Dashboard/MyRequests when user clicks a request.
   */
  selectRequest(request: WorkflowRequest): void {
    this.selectedRequestSignal.set(request);
  }

  /**
   * Clear the current selection (e.g. when navigating away from detail).
   */
  clearSelection(): void {
    this.selectedRequestSignal.set(null);
  }

  /**
   * Cache the full request list fetched from the API.
   * Allows other components to access the list without re-fetching.
   */
  setRequests(requests: WorkflowRequest[]): void {
    this.allRequestsSignal.set(requests);
  }

  /**
   * Find a cached request by ID — used as fallback on the detail page
   * when the user navigates directly via URL (deep link).
   */
  getRequestById(id: string): WorkflowRequest | undefined {
    return this.allRequestsSignal().find(r => r.id === id);
  }
}
