import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { SystemStateService } from '../../services/system-state';
import { SharedModule } from '../../shared/shared-module';
import { AlertCountBadgeComponent } from '../alert-count-badge/alert-count-badge';

/**
 * AlertListComponent
 * 
 * Demonstrates shared state management by consuming the 'SystemStateService'.
 * Injects the service using the constructor (Dependency Injection).
 */
@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule, SharedModule, AlertCountBadgeComponent],
  templateUrl: './alert-list.html',
  styleUrl: './alert-list.css'
})
export class AlertListComponent {
  /**
   * Observable stream of shared alerts
   * Fetched reactively from the single source of truth
   */
  alerts$: Observable<string[]>;

  /**
   * Constructor injection of the shared service.
   * Angular's DI system provides the SAME instance to all components.
   */
  constructor(private stateService: SystemStateService) {
    this.alerts$ = this.stateService.alerts$;
  }

  addTestAlert(): void {
    const timestamp = new Date().toLocaleTimeString();
    this.stateService.addAlert(`System Alert at ${timestamp}`);
  }

  removeAlert(index: number): void {
    this.stateService.removeAlert(index);
  }

  clearAll(): void {
    this.stateService.clearAlerts();
  }
}
