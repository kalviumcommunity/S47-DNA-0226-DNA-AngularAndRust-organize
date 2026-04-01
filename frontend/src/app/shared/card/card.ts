import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: false, // Part of SharedModule
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class CardComponent {
  /**
   * Input properties for basic card info
   */
  @Input() cardTitle: string = '';
  @Input() subtitle: string = '';
  
  /**
   * Optional header badge text and class (e.g. status)
   */
  @Input() headerBadge: string = '';
  @Input() badgeClass: string = '';

  /**
   * Adds an accent left border color (e.g. 'blue', 'green', 'amber')
   */
  @Input() accentColor: string = '';

  /**
   * Optional: adds a stat icon
   */
  @Input() icon: string = '';
}
