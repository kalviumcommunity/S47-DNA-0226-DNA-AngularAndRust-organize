import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared-module';

@Component({
  selector: 'app-workflow-template-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './workflow-template-form.html',
  styleUrl: './workflow-template-form.css'
})
export class WorkflowTemplateFormComponent {
  /**
   * Template-Driven Model
   */
  contactData = {
    name: '',
    email: '',
    message: ''
  };

  submittedData: any = null;

  onSubmit(form: any): void {
    if (form.valid) {
      this.submittedData = { ...this.contactData };
      console.log('Template-Driven Form Submitted Successfully:', this.submittedData);
    } else {
      console.warn('Form is invalid. Please correct errors.');
    }
  }

  resetForm(form: any): void {
    form.reset();
    this.submittedData = null;
  }
}
