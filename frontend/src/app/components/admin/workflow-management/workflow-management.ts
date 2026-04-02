import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { WorkflowDefinition } from '../../../models/api.models';

@Component({
  selector: 'app-workflow-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow-management.html',
  styleUrl: './workflow-management.css'
})
export class WorkflowManagementComponent implements OnInit {
  workflows: WorkflowDefinition[] = [];
  loading = true;
  showCreateForm = false;

  newName = '';
  newDescription = '';
  newSteps: { step_order: number; role_required: string }[] = [
    { step_order: 1, role_required: 'manager' }
  ];
  createLoading = false;
  createError = '';
  createSuccess = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadWorkflows(); }

  loadWorkflows() {
    this.loading = true;
    this.api.getWorkflows().subscribe({
      next: (data: WorkflowDefinition[]) => { this.workflows = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addStep() {
    const nextOrder = this.newSteps.length + 1;
    this.newSteps.push({ step_order: nextOrder, role_required: 'admin' });
  }

  removeStep(index: number) {
    if (this.newSteps.length > 1) {
      this.newSteps.splice(index, 1);
      this.newSteps.forEach((s, i) => s.step_order = i + 1);
    }
  }

  createWorkflow() {
    this.createError = '';
    this.createSuccess = '';
    if (!this.newName.trim()) {
      this.createError = 'Workflow name is required';
      return;
    }
    this.createLoading = true;
    this.api.createWorkflow({
      name: this.newName,
      description: this.newDescription || undefined,
      steps: this.newSteps
    }).subscribe({
      next: () => {
        this.createSuccess = `Workflow "${this.newName}" created!`;
        this.createLoading = false;
        this.newName = '';
        this.newDescription = '';
        this.newSteps = [{ step_order: 1, role_required: 'manager' }];
        this.showCreateForm = false;
        this.loadWorkflows();
      },
      error: (err: any) => {
        this.createError = err.error?.error || 'Failed to create workflow';
        this.createLoading = false;
      }
    });
  }
}
