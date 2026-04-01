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
    path: 'responsive-layout',
    loadComponent: () =>
      import('./components/responsive-layout/responsive-layout').then(m => m.ResponsiveLayoutComponent)
  },
  {
    path: 'binding-demo',
    loadComponent: () =>
      import('./components/binding-demo/binding-demo').then(m => m.BindingDemoComponent)
  },
  {
    path: 'forms/reactive',
    loadComponent: () =>
      import('./components/workflow-reactive-form/workflow-reactive-form').then(m => m.WorkflowReactiveFormComponent)
  },
  {
    path: 'forms/template',
    loadComponent: () =>
      import('./components/workflow-template-form/workflow-template-form').then(m => m.WorkflowTemplateFormComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/tenant-profile/tenant-profile').then(m => m.TenantProfileComponent) // Fixed name if changed to Component
  },
  {
    path: '',
    redirectTo: 'requests',
    pathMatch: 'full'
  }
];
