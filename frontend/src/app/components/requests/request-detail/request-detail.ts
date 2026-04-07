import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { RequestStateService } from '../../../services/request-state.service';
import { WorkflowRequest } from '../../../models/api.models';

/**
 * RequestDetailComponent
 *
 * Demonstrates Angular route parameters.
 *
 * Route: /request/:id
 *
 * How it works:
 * 1. The :id route parameter is read from ActivatedRoute.paramMap
 * 2. First checks RequestStateService for cached data (set when user clicked from Dashboard)
 * 3. Falls back to fetching from API if no cached data (deep link / page refresh scenario)
 * 4. Includes both routerLink and programmatic navigation (Router.navigate)
 *
 * This is the answer to the Case Study question:
 * - Route configured as '/request/:id' in app.routes.ts
 * - Item identifier passed via route parameter
 * - Component reads parameter via ActivatedRoute.paramMap.subscribe()
 * - RequestStateService caches the selected item data
 */
@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './request-detail.html',
  styleUrl: './request-detail.css'
})
export class RequestDetailComponent implements OnInit, OnDestroy {
  request: WorkflowRequest | null = null;
  requestId: string = '';
  loading = true;
  error = '';
  private paramSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestState: RequestStateService,
    public api: ApiService
  ) {}

  ngOnInit(): void {
    // ── Read the :id route parameter reactively ──
    // Using paramMap.subscribe() so the component reacts if the param changes
    // without destroying/recreating the component (e.g., navigating between details)
    this.paramSub = this.route.paramMap.subscribe(params => {
      this.requestId = params.get('id') ?? '';
      this.loadRequest();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    this.paramSub?.unsubscribe();
  }

  /**
   * Load request data — demonstrates service integration with routing:
   * 1. Check if RequestStateService has cached data (from Dashboard click)
   * 2. Fall back to finding in the cached request list
   * 3. Fall back to API fetch
   */
  private loadRequest(): void {
    this.loading = true;
    this.error = '';

    // Strategy 1: Check the selected request in RequestStateService
    const cached = this.requestState.selectedRequest();
    if (cached && cached.id === this.requestId) {
      this.request = cached;
      this.loading = false;
      return;
    }

    // Strategy 2: Search in the cached request list
    const fromCache = this.requestState.getRequestById(this.requestId);
    if (fromCache) {
      this.request = fromCache;
      this.requestState.selectRequest(fromCache);
      this.loading = false;
      return;
    }

    // Strategy 3: Fetch from API (deep link / refresh scenario)
    this.api.getRequests().subscribe({
      next: (data: WorkflowRequest[]) => {
        this.requestState.setRequests(data);
        const found = data.find(r => r.id === this.requestId);
        if (found) {
          this.request = found;
          this.requestState.selectRequest(found);
        } else {
          this.error = `Request with ID "${this.requestId}" not found.`;
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load request details. The backend may not be running.';
        this.loading = false;
      }
    });
  }

  /**
   * Programmatic navigation — demonstrates Router.navigate()
   * Navigates back to the dashboard without using a template routerLink.
   */
  goBack(): void {
    this.requestState.clearSelection();
    this.router.navigate(['/dashboard']);
  }

  /**
   * Get a CSS class for the status badge
   */
  getStatusClass(status: string): string {
    return `badge-${status}`;
  }
}
