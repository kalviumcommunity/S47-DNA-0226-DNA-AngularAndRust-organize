import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'requests',
    loadComponent: () =>
      import('./components/workflow-request-list/workflow-request-list').then(m => m.WorkflowRequestListComponent)
  },
  {
    path: '',
    redirectTo: 'requests',
    pathMatch: 'full'
  }
];
