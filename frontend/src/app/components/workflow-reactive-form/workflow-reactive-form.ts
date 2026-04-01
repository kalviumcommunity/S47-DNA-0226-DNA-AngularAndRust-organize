import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../shared/shared-module';

@Component({
  selector: 'app-workflow-reactive-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './workflow-reactive-form.html',
  styleUrl: './workflow-reactive-form.css'
})
export class WorkflowReactiveFormComponent implements OnInit {
  workflowForm!: FormGroup;
  submittedData: any = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // 1. Initialize Form with Validators
    this.workflowForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      department: ['', Validators.required],
      priority: ['Medium', Validators.required],
      requesterEmail: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });

    // 2. Observe Form State Changes (Reactive Mastery)
    this.workflowForm.valueChanges.subscribe(value => {
      console.log('Form values updating reactively:', value);
    });
  }

  // Easy access to form controls for template validation
  get f() { return this.workflowForm.controls; }

  onSubmit(): void {
    if (this.workflowForm.valid) {
      this.submittedData = this.workflowForm.value;
      console.log('Reactive Form Submitted Successfully:', this.submittedData);
    } else {
      // Mark all fields as touched to trigger validation messages
      this.workflowForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.workflowForm.reset({ priority: 'Medium' });
    this.submittedData = null;
  }
}
