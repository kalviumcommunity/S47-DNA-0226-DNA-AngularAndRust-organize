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
    path: 'workflow-card',
    loadComponent: () =>
      import('./components/workflow-card/workflow-card').then(m => m.WorkflowCardComponent)
  },
  {
    path: 'demo-cli',
    loadComponent: () =>
      import('./components/demo-cli/demo-cli').then(m => m.DemoCliComponent)
  },
  {
    path: '',
    redirectTo: 'requests',
    pathMatch: 'full'
  }
];
