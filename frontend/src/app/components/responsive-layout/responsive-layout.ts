import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ResponsiveLayoutComponent
 * 
 * Demonstrates a responsive dashboard layout using CSS Grid and Flexbox.
 * Frame: Multi-Tenant Dashboard Overview for our SaaS application.
 */
@Component({
  selector: 'app-responsive-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './responsive-layout.html',
  styleUrl: './responsive-layout.css'
})
export class ResponsiveLayoutComponent {
  /** 
   * Dashboard Statistics
   * These cards will be displayed in a responsive grid.
   */
  stats = [
    { title: 'Total Tenants', value: '142', change: '+12%', icon: '🏢', color: 'blue' },
    { title: 'Active Workflows', value: '1,208', change: '+5%', icon: '⚡', color: 'purple' },
    { title: 'Pending Approvals', value: '45', change: '-2%', icon: '🕒', color: 'amber' },
    { title: 'System Health', value: '99.9%', change: 'Stable', icon: '✅', color: 'green' }
  ];

  /**
   * Recent Activity data for the secondary sections
   */
  recentActivity = [
    { user: 'Rahul Sharma', action: 'Approved Leave Request', time: '2 mins ago', dept: 'HR' },
    { user: 'Dr. Priya Verma', action: 'Created New Workflow', time: '15 mins ago', dept: 'Academics' },
    { user: 'Ankit Gupta', action: 'Submitted Budget Proposal', time: '1 hour ago', dept: 'Finance' }
  ];
}
