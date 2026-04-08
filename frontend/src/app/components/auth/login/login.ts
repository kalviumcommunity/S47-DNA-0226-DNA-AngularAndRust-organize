import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  error = '';
  loading = false;
  redirectMsg = '';
  private returnUrl = '/dashboard';

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (api.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    // Read returnUrl query param — set by authGuard when redirecting here
    this.route.queryParamMap.subscribe(params => {
      const url = params.get('returnUrl');
      if (url) {
        this.returnUrl = url;
        this.redirectMsg = 'You must be logged in to access that page.';
      }
    });
  }

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (err: any) => {
        this.loading = false;
        if (err?.error?.error) {
          this.error = err.error.error;
        } else if (err?.status === 401) {
          this.error = 'Invalid email or password';
        } else if (err?.status === 0) {
          this.error = 'Cannot connect to server. Is the backend running?';
        } else {
          this.error = 'Login failed. Please try again.';
        }
      }
    });
  }

  /**
   * Demo login — sets mock auth state to demonstrate route guard behavior
   * without needing a running backend.
   */
  demoLogin(): void {
    this.api.demoLogin();
    this.router.navigate([this.returnUrl]);
  }
}
