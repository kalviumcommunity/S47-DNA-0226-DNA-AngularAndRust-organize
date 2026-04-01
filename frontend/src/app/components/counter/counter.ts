import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * CounterComponent
 * 
 * Demonstrates basic Angular component structure and reactive UI updates.
 * In a real-world multi-tenant workflow app, this could represent a 
 * "Quick Action" counter for a specific department (e.g., HR approvals).
 */
@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './counter.html',
  styleUrl: './counter.css'
})
export class CounterComponent {
  /** 
   * Component State
   * Angular automatically tracks changes to class properties like this.
   */
  count = 0;

  /**
   * Action: Increment
   * Updates state – triggers Angular's change detection to update the UI.
   */
  increment() {
    this.count++;
  }

  /**
   * Action: Decrement
   * Reduces count, ensuring it doesn't go below zero.
   */
  decrement() {
    if (this.count > 0) {
      this.count--;
    }
  }

  /**
   * Action: Reset
   * Restores state to initial value.
   */
  reset() {
    this.count = 0;
  }
}
