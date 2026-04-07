import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { RequestStateService } from '../../services/request-state.service';
import { WorkflowRequest } from '../../models/api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  requests: WorkflowRequest[] = [];
  pendingApprovals: WorkflowRequest[] = [];
  loading = true;
  error = '';

  get totalRequests() { return this.requests.length; }
  get pendingCount() { return this.requests.filter(r => r.status === 'pending').length; }
  get approvedCount() { return this.requests.filter(r => r.status === 'approved').length; }
  get rejectedCount() { return this.requests.filter(r => r.status === 'rejected').length; }

  constructor(
    public api: ApiService,
    private requestState: RequestStateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.api.getRequests().subscribe({
      next: (data: WorkflowRequest[]) => {
        this.requests = Array.isArray(data) ? data : [];
        // Cache requests in the state service so Detail page can access them
        this.requestState.setRequests(this.requests);
        this.loading = false;
      },
      error: (_err: any) => {
        this.requests = [];
        this.loading = false;
      }
    });

    const role = this.api.userRole();
    if (role === 'manager' || role === 'admin') {
      this.api.getPendingApprovals().subscribe({
        next: (data: WorkflowRequest[]) => {
          this.pendingApprovals = Array.isArray(data) ? data : [];
        },
        error: () => { this.pendingApprovals = []; }
      });
    }
  }

  /**
   * Programmatic navigation to the request detail page.
   * Stores the request in RequestStateService before navigating,
   * so the Detail component can access it without re-fetching.
   */
  viewRequest(request: WorkflowRequest): void {
    this.requestState.selectRequest(request);
    this.router.navigate(['/request', request.id]);
  }
}
