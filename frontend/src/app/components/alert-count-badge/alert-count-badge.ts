import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { SystemStateService } from '../../services/system-state';

/**
 * AlertCountBadgeComponent
 * 
 * Demonstrates shared state by showing a real-time reactive counter.
 * This component is distinct from AlertListComponent but shares the SAME service instance.
 */
@Component({
  selector: 'app-alert-count-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-count-badge.html',
  styleUrl: './alert-count-badge.css'
})
export class AlertCountBadgeComponent {
  /**
   * Reactive count stream
   */
  count$: Observable<number>;

  /**
   * Injects the shared SystemStateService (DI).
   */
  constructor(private stateService: SystemStateService) {
    this.count$ = this.stateService.getAlertCount();
  }
}
