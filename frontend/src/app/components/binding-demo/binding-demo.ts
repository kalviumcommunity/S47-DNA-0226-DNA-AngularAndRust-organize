import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * BindingDemoComponent
 * 
 * Demonstrates Angular's four main binding types: 
 * Interpolation, Property Binding, Event Binding, and Two-Way Binding.
 * Frame: "Tenant Quick Settings" for our Multi-Tenant SaaS.
 */
@Component({
  selector: 'app-binding-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './binding-demo.html',
  styleUrl: './binding-demo.css'
})
export class BindingDemoComponent {
  // 1. Interpolation: String and Number from the class to the view
  title = 'Tenant Quick Settings';
  tenantId = 1042;
  
  // 2. Property Binding: Values that dynamically update attributes
  isSaving = false;
  statusIcon = 'https://img.icons8.com/parakeet/48/checked.png';
  lastSaved = new Date().toLocaleTimeString();
  
  // 3. Two-Way Binding: Synchronized state between input and variable
  subdomain = 'acme-inc';

  // 4. State for testing Event Binding
  isActive = true;

  // Event Binding Methods
  toggleStatus() {
    this.isActive = !this.isActive;
    console.log(`Tenant status toggled to: ${this.isActive ? 'Active' : 'Inactive'}`);
  }

  saveChanges() {
    this.isSaving = true;
    this.lastSaved = new Date().toLocaleTimeString();
    
    // Simulate a fake API delay
    setTimeout(() => {
      this.isSaving = false;
    }, 1500);
  }
}
