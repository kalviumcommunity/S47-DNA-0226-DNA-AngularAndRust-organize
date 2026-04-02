import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

export const authGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  const router = inject(Router);

  if (api.isAuthenticated()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const roleGuard = (...allowedRoles: string[]): CanActivateFn => {
  return () => {
    const api = inject(ApiService);
    const router = inject(Router);

    const role = api.userRole();
    if (role && allowedRoles.includes(role)) {
      return true;
    }
    router.navigate(['/dashboard']);
    return false;
  };
};
