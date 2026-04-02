import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ── Public routes ──
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register').then(m => m.RegisterComponent)
  },

  // ── Protected routes (wrapped in layout) ──
  {
    path: '',
    loadComponent: () => import('./components/layout/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'submit-request',
        loadComponent: () => import('./components/requests/submit-request/submit-request').then(m => m.SubmitRequestComponent)
      },
      {
        path: 'my-requests',
        loadComponent: () => import('./components/requests/my-requests/my-requests').then(m => m.MyRequestsComponent)
      },
      {
        path: 'approvals',
        loadComponent: () => import('./components/approvals/approvals').then(m => m.ApprovalsComponent),
        canActivate: [roleGuard('admin', 'manager')]
      },
      {
        path: 'users',
        loadComponent: () => import('./components/admin/user-management/user-management').then(m => m.UserManagementComponent),
        canActivate: [roleGuard('admin')]
      },
      {
        path: 'workflows',
        loadComponent: () => import('./components/admin/workflow-management/workflow-management').then(m => m.WorkflowManagementComponent),
        canActivate: [roleGuard('admin')]
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./components/audit/audit-log/audit-log').then(m => m.AuditLogComponent),
        canActivate: [roleGuard('admin', 'manager')]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // ── Fallback ──
  { path: '**', redirectTo: 'login' }
];
