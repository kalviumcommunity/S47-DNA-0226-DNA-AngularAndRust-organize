import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'requests',
    loadComponent: () =>
      import('./components/workflow-request-list/workflow-request-list').then(m => m.WorkflowRequestListComponent)
  },
  {
    path: 'counter',
    loadComponent: () =>
      import('./components/counter/counter').then(m => m.CounterComponent)
  },
  {
    path: '',
    redirectTo: 'requests',
    pathMatch: 'full'
  }
];
