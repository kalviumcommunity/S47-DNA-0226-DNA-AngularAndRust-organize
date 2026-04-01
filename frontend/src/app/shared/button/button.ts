import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false, // Part of SharedModule
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class ButtonComponent {
  /** 
   * Input properties to make the button reusable 
   */
  @Input() label: string = '';
  @Input() btnType: 'primary' | 'secondary' | 'text' | 'tile' = 'primary';
  @Input() disabled: boolean = false;
  @Input() icon: string = '';

  /**
   * Output event to notify parent components of clicks
   */
  @Output() buttonClick = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) {
      this.buttonClick.emit();
    }
  }
}
