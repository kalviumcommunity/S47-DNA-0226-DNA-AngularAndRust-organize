import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../services/api.service';

/**
 * authGuard — CanActivate functional guard
 *
 * Checks if the user is authenticated via ApiService.isAuthenticated().
 * - If authenticated → returns true, navigation proceeds.
 * - If NOT authenticated → redirects to /login with a returnUrl query param,
 *   so the login page can redirect back after successful login.
 *
 * No full page reload occurs — Angular Router handles redirection client-side.
 */
export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const api = inject(ApiService);
  const router = inject(Router);

  if (api.isAuthenticated()) {
    return true;
  }

  // Redirect to login, passing the attempted URL as a query param
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

/**
 * roleGuard — CanActivate functional guard factory
 *
 * Checks if the authenticated user has one of the allowed roles.
 * - If role matches → returns true.
 * - If role doesn't match → redirects to /dashboard.
 *
 * Usage: canActivate: [roleGuard('admin', 'manager')]
 */
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
