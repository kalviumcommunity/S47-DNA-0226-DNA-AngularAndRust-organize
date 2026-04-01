import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * SystemStateService
 * 
 * Centralized shared state management using BehaviorSubject (Reactive Pattern).
 * This service acts as the 'Single Source of Truth' for system-wide alerts.
 */
@Injectable({
  providedIn: 'root'
})
export class SystemStateService {
  /**
   * Private internal state subject
   * Initial state is an empty array of notifications
   */
  private alertsSubject = new BehaviorSubject<string[]>([]);

  /**
   * Public read-only stream exposed to components
   */
  public alerts$: Observable<string[]> = this.alertsSubject.asObservable();

  constructor() {}

  /**
   * Adds a new alert to the shared state.
   * 
   * Edge Case Handling:
   * 1. Reject empty alerts (Invalid update attempt).
   * 2. Limit the list to only the 5 most recent alerts (Memory/UI management).
   */
  addAlert(message: string): boolean {
    if (!message || message.trim() === '') {
      console.warn('SystemState: Attempted to add an empty alert.');
      return false; 
    }

    const currentAlerts = this.alertsSubject.getValue();
    
    // Add new alert to the beginning (most recent first)
    // Then take only the top 5 (The service's 'Max Alert Limit' rule)
    const updatedAlerts = [message, ...currentAlerts].slice(0, 5);
    
    this.alertsSubject.next(updatedAlerts);
    console.log('SystemState: Alert added. Total:', updatedAlerts.length);
    return true;
  }

  /**
   * Removes a specific alert by its current index in the stream
   */
  removeAlert(index: number): void {
    const currentAlerts = this.alertsSubject.getValue();
    const updatedAlerts = currentAlerts.filter((_, i) => i !== index);
    this.alertsSubject.next(updatedAlerts);
  }

  /**
   * Clears all alerts from the shared state.
   * Edge Case: Handles clearing even if already empty.
   */
  clearAlerts(): void {
    if (this.alertsSubject.getValue().length > 0) {
      this.alertsSubject.next([]);
      console.log('SystemState: All alerts cleared.');
    }
  }

  /**
   * Reactive count for components that only need the total number
   */
  getAlertCount(): Observable<number> {
    return this.alerts$.pipe(map(alerts => alerts.length));
  }
}
