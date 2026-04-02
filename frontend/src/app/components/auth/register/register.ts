import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  tenantName = '';
  adminName = '';
  adminEmail = '';
  adminPassword = '';
  error = '';
  loading = false;

  constructor(private api: ApiService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.api.registerTenant({
      tenant_name: this.tenantName,
      admin_name: this.adminName,
      admin_email: this.adminEmail,
      admin_password: this.adminPassword
    }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.error = err.error?.error || err?.statusText || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
