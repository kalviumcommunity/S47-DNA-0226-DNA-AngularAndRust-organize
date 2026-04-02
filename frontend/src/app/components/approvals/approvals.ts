import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { WorkflowRequest } from '../../models/api.models';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals.html',
  styleUrl: './approvals.css'
})
export class ApprovalsComponent implements OnInit {
  pendingRequests: WorkflowRequest[] = [];
  loading = true;
  actionLoading: string | null = null;
  comment = '';
  activeRequestId: string | null = null;
  successMsg = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.loading = true;
    this.api.getPendingApprovals().subscribe({
      next: (data: WorkflowRequest[]) => { this.pendingRequests = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  showCommentBox(requestId: string) {
    this.activeRequestId = this.activeRequestId === requestId ? null : requestId;
    this.comment = '';
  }

  decide(requestId: string, decision: 'approved' | 'rejected') {
    this.actionLoading = requestId;
    this.successMsg = '';
    this.api.decideRequest(requestId, { decision, comment: this.comment || undefined }).subscribe({
      next: (_res: any) => {
        this.successMsg = `Request ${decision}!`;
        this.actionLoading = null;
        this.activeRequestId = null;
        this.comment = '';
        this.loadPending();
      },
      error: (err: any) => {
        this.actionLoading = null;
        alert(err.error?.error || 'Action failed');
      }
    });
  }
}
