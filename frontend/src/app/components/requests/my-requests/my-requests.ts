import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { WorkflowRequest } from '../../../models/api.models';

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

    @if (loading) {
      <div class="empty-state"><div class="spinner spinner-lg"></div></div>
    } @else if (requests.length === 0) {
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">No requests found</div>
        <a routerLink="/submit-request" class="btn btn-primary">Submit Your First Request</a>
      </div>
    } @else {
      <div class="table-container">
        <table>
          <thead><tr><th>Title</th><th>Workflow</th><th>Status</th><th>Step</th><th>Created</th><th>Updated</th></tr></thead>
          <tbody>
            @for (req of requests; track req.id) {
              <tr class="animate-fade-in">
                <td style="color: var(--text-primary); font-weight: 500;">{{ req.title }}</td>
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
  `
})
export class MyRequestsComponent implements OnInit {
  requests: WorkflowRequest[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getRequests().subscribe({
      next: (data: WorkflowRequest[]) => { this.requests = Array.isArray(data) ? data : []; this.loading = false; },
      error: () => { this.requests = []; this.loading = false; }
    });
  }
}
