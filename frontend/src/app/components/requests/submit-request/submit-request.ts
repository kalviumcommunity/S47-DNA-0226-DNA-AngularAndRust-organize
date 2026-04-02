import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { WorkflowDefinition } from '../../../models/api.models';

@Component({
  selector: 'app-submit-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit-request.html',
  styleUrl: './submit-request.css'
})
export class SubmitRequestComponent implements OnInit {
  workflows: WorkflowDefinition[] = [];
  selectedWorkflow = '';
  title = '';
  description = '';
  loading = false;
  error = '';
  success = '';

  get selectedWorkflowInfo(): WorkflowDefinition | null {
    return this.workflows.find(w => w.id === this.selectedWorkflow) ?? null;
  }

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getWorkflows().subscribe({
      next: (data: WorkflowDefinition[]) => { this.workflows = data; },
      error: () => { this.error = 'Failed to load workflows'; }
    });
  }

  onSubmit() {
    this.error = '';
    this.success = '';
    this.loading = true;
    this.api.submitRequest({
      workflow_id: this.selectedWorkflow,
      title: this.title,
      description: this.description || undefined
    }).subscribe({
      next: () => {
        this.success = 'Request submitted successfully!';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/my-requests']), 1500);
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Failed to submit request';
        this.loading = false;
      }
    });
  }
}
