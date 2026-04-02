import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuditLog } from '../../../models/api.models';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Audit Logs</h1>
        <p class="page-subtitle">Complete activity trail for your organization</p>
      </div>
    </div>

    @if (loading) {
      <div class="empty-state"><div class="spinner spinner-lg"></div></div>
    } @else if (logs.length === 0) {
      <div class="empty-state">
        <div class="empty-state-icon">📜</div>
        <div class="empty-state-text">No audit logs yet</div>
      </div>
    } @else {
      <div class="table-container">
        <table>
          <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th><th>Status Change</th></tr></thead>
          <tbody>
            @for (log of logs; track log.id) {
              <tr class="animate-fade-in">
                <td style="white-space: nowrap;">{{ log.created_at | date:'short' }}</td>
                <td style="color: var(--text-primary); font-weight: 500;">{{ log.user_name }}</td>
                <td><span class="badge" [ngClass]="getActionClass(log.action)">{{ log.action }}</span></td>
                <td>{{ log.entity_type }}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ log.details }}</td>
                <td>
                  @if (log.old_status || log.new_status) {
                    <span style="color: var(--text-muted);">{{ log.old_status || '—' }}</span>
                    <span style="color: var(--text-muted);"> → </span>
                    <span style="color: var(--text-primary);">{{ log.new_status || '—' }}</span>
                  } @else {
                    <span style="color: var(--text-muted);">—</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  </div>
  `
})
export class AuditLogComponent implements OnInit {
  logs: AuditLog[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAuditLogs().subscribe({
      next: (data: AuditLog[]) => { this.logs = Array.isArray(data) ? data : []; this.loading = false; },
      error: () => { this.logs = []; this.loading = false; }
    });
  }

  getActionClass(action: string): string {
    if (action.includes('APPROVED')) return 'badge-approved';
    if (action.includes('REJECTED')) return 'badge-rejected';
    if (action.includes('SUBMIT') || action.includes('CREATED')) return 'badge-pending';
    return 'badge-admin';
  }
}
