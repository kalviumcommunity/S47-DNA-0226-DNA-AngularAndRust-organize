import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from '../services/api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // We use inject to lazily access Router & ApiService natively inside functional interceptors cleanly.
  const router = inject(Router);
  const apiService = inject(ApiService);

  // Attach token explicitly exclusively inside browser environments safely 
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('wf_token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  // Monitor network interactions intrinsically identifying expired sessions
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Execute forced UI teardown completely if tokens naturally expired fundamentally blocking unauthorized data access immediately! 
      if (error.status === 401 && req.url.includes('/api/')) {
        console.warn('🔒 [SECURITY]: Token Expired uniquely. Forcibly terminating local bounds systematically!');
        apiService.logout();
      }
      return throwError(() => error);
    })
  );
};
