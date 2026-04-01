import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../shared/shared-module';

/**
 * TenantProfileComponent
 * 
 * Demonstrates advanced form validation and error handling.
 * - Shows errors only after interaction (dirty/touched).
 * - Implements specific error messages for multiple validation rules.
 * - Prevents invalid submission with a 'markAllAsTouched' fallback.
 */
@Component({
  selector: 'app-tenant-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  templateUrl: './tenant-profile.html',
  styleUrl: './tenant-profile.css'
})
export class TenantProfileComponent implements OnInit {
  profileForm!: FormGroup;
  submittedData: any = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    /**
     * Define the Reactive Form with multiple validators:
     * - Required: Mandatory field
     * - MinLength: Minimum character limit
     * - Email: Correct email structure
     * - Pattern: Regular expression for 10-digit phone numbers
     */
    this.profileForm = this.fb.group({
      institutionName: ['', [Validators.required, Validators.minLength(3)]],
      principalEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      adminPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  /**
   * Getter for easier access to form controls in the template
   */
  get f() { return this.profileForm.controls; }

  /**
   * Helper to determine if a field should show validation errors
   * Rule: Must be invalid AND (previously touched OR modified)
   */
  shouldShowError(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.submittedData = this.profileForm.value;
      console.log('Form Successfully Submitted:', this.submittedData);
    } else {
      /**
       * Safe Form Submission:
       * Force validation to show on all invalid fields if the user tries to save
       */
      this.profileForm.markAllAsTouched();
      console.warn('Form submission blocked: Invalid data.');
    }
  }

  resetForm(): void {
    this.profileForm.reset();
    this.submittedData = null;
  }
}
