import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { RequestStateService } from '../../../services/request-state.service';
import { WorkflowRequest } from '../../../models/api.models';

/**
 * MyRequestsComponent
 *
 * Demonstrates query parameters:
 * - Reads ?status= query param from ActivatedRoute.queryParamMap
 * - Filter buttons update query params via Router.navigate() with queryParams
 * - Requests are filtered reactively when query param changes
 *
 * Also demonstrates:
 * - Clickable rows navigating to /request/:id (route params)
 * - Service integration via RequestStateService
 */
@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Requests</h1>
        <p class="page-subtitle">Track all your submitted requests</p>
      </div>
      <a routerLink="/submit-request" class="btn btn-primary">+ New Request</a>
    </div>

    <!-- Query Param Filter Buttons -->
    <div class="filter-bar">
      <span class="filter-label">Filter by status:</span>
      <button class="btn btn-sm" [ngClass]="activeFilter === 'all' ? 'btn-primary' : 'btn-ghost'" (click)="setFilter('all')" id="filter-all">
        All
      </button>
      <button class="btn btn-sm" [ngClass]="activeFilter === 'pending' ? 'btn-primary' : 'btn-ghost'" (click)="setFilter('pending')" id="filter-pending">
        ⏳ Pending
      </button>
      <button class="btn btn-sm" [ngClass]="activeFilter === 'approved' ? 'btn-primary' : 'btn-ghost'" (click)="setFilter('approved')" id="filter-approved">
        ✅ Approved
      </button>
      <button class="btn btn-sm" [ngClass]="activeFilter === 'rejected' ? 'btn-primary' : 'btn-ghost'" (click)="setFilter('rejected')" id="filter-rejected">
        ❌ Rejected
      </button>
    </div>

    @if (loading) {
      <div class="empty-state"><div class="spinner spinner-lg"></div></div>
    } @else if (filteredRequests.length === 0) {
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">
          @if (activeFilter !== 'all') {
            No {{ activeFilter }} requests found
          } @else {
            No requests found
          }
        </div>
        @if (activeFilter !== 'all') {
          <button class="btn btn-ghost" (click)="setFilter('all')">Show All Requests</button>
        } @else {
          <a routerLink="/submit-request" class="btn btn-primary">Submit Your First Request</a>
        }
      </div>
    } @else {
      <div class="table-container">
        <table>
          <thead><tr><th>Title</th><th>Workflow</th><th>Status</th><th>Step</th><th>Created</th><th>Updated</th></tr></thead>
          <tbody>
            @for (req of filteredRequests; track req.id) {
              <tr class="animate-fade-in clickable-row" (click)="viewRequest(req)" id="my-request-row-{{req.id}}">
                <td style="color: var(--accent-primary-hover); font-weight: 500; cursor: pointer;">{{ req.title }}</td>
                <td>{{ req.workflowName }}</td>
                <td><span class="badge" [ngClass]="'badge-' + req.status">{{ req.status }}</span></td>
                <td>Step {{ req.currentStep }}</td>
                <td>{{ req.createdAt | date:'mediumDate' }}</td>
                <td>{{ req.updatedAt | date:'mediumDate' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-lg);
      flex-wrap: wrap;
    }
    .filter-label {
      font-size: var(--font-sm);
      color: var(--text-muted);
      font-weight: 500;
      margin-right: var(--space-xs);
    }
    .clickable-row {
      cursor: pointer;
      transition: background var(--transition-fast);
    }
    .clickable-row:hover td {
      background: var(--bg-surface-hover) !important;
    }
  `]
})
export class MyRequestsComponent implements OnInit, OnDestroy {
  requests: WorkflowRequest[] = [];
  filteredRequests: WorkflowRequest[] = [];
  loading = true;
  activeFilter: string = 'all';
  private querySub!: Subscription;

  constructor(
    private api: ApiService,
    private requestState: RequestStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // ── Read query parameters reactively ──
    // When the URL changes to ?status=pending, this subscription fires
    // and filters the displayed requests accordingly.
    this.querySub = this.route.queryParamMap.subscribe(params => {
      const status = params.get('status');
      this.activeFilter = status || 'all';
      this.applyFilter();
    });

    this.api.getRequests().subscribe({
      next: (data: WorkflowRequest[]) => {
        this.requests = Array.isArray(data) ? data : [];
        this.requestState.setRequests(this.requests);
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.requests = [];
        this.filteredRequests = [];
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
  }

  /**
   * Update the query parameter in the URL.
   * Uses Router.navigate() with queryParams — this does NOT reload the page,
   * it only updates the URL and triggers the queryParamMap subscription.
   */
  setFilter(status: string): void {
    if (status === 'all') {
      // Remove query param entirely
      this.router.navigate(['/my-requests']);
    } else {
      // Set ?status=<value> in the URL
      this.router.navigate(['/my-requests'], { queryParams: { status } });
    }
  }

  /**
   * Navigate to request detail page.
   * Caches the request in RequestStateService before navigating.
   */
  viewRequest(request: WorkflowRequest): void {
    this.requestState.selectRequest(request);
    this.router.navigate(['/request', request.id]);
  }

  private applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredRequests = [...this.requests];
    } else {
      this.filteredRequests = this.requests.filter(r => r.status === this.activeFilter);
    }
  }
}
