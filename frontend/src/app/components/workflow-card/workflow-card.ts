import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * WorkflowCardComponent
 * 
 * Demonstrates component-scoped styling and conditional rendering in Angular.
 * Represents a single workflow request in our multi-tenant SaaS project.
 */
@Component({
  selector: 'app-workflow-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-card.html',
  styleUrl: './workflow-card.css'
})
export class WorkflowCardComponent {
  /** 
   * Component State
   * These properties are displayed in the UI using Interpolation {{ }}.
   */
  requestTitle = 'Purchase Laptop for New HR Intern';
  department = 'Human Resources';
  priorityLevel = 'High';
  isApproved = false;
  statusMessage = '';

  /**
   * Action: Approve Request
   * Triggers a state change which the UI reactively displays via @if.
   */
  approveRequest() {
    this.isApproved = true;
    this.statusMessage = 'Request has been successfully approved!';
  }

  /**
   * Action: Toggle Priority
   * Demonstrates state manipulation that updates the UI instantly.
   */
  togglePriority() {
    this.priorityLevel = this.priorityLevel === 'High' ? 'Medium' : 'High';
  }
}
