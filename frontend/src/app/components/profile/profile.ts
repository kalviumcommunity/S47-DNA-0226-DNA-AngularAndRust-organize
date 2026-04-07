import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

/**
 * ProfileComponent
 *
 * Displays the currently authenticated user's information.
 * Demonstrates how a routed component consumes data from a shared
 * Angular service (ApiService) — the user data persists correctly
 * when navigating between Dashboard, Profile, and other routes.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
  constructor(public api: ApiService) {}

  /** Get initials for the avatar */
  get initials(): string {
    const name = this.api.currentUser()?.name ?? '';
    return name
      .split(' ')
      .map(w => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /** Get a display-friendly join date */
  get memberSince(): string {
    // Static for now — would come from the API in production
    return 'April 2026';
  }
}
