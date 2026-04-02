import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { User } from '../../../models/api.models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  showCreateForm = false;

  newName = '';
  newEmail = '';
  newPassword = '';
  newRole = 'employee';
  createLoading = false;
  createError = '';
  createSuccess = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading = true;
    this.api.getUsers().subscribe({
      next: (data: User[]) => { this.users = Array.isArray(data) ? data : []; this.loading = false; },
      error: () => { this.users = []; this.loading = false; }
    });
  }

  createUser() {
    this.createError = '';
    this.createSuccess = '';
    this.createLoading = true;
    this.api.createUser({
      name: this.newName,
      email: this.newEmail,
      password: this.newPassword,
      role: this.newRole as any
    }).subscribe({
      next: () => {
        this.createSuccess = 'User created successfully!';
        this.createLoading = false;
        this.newName = ''; this.newEmail = ''; this.newPassword = ''; this.newRole = 'employee';
        this.showCreateForm = false;
        this.loadUsers();
      },
      error: (err: any) => {
        this.createError = err.error?.error || 'Failed to create user';
        this.createLoading = false;
      }
    });
  }

  updateRole(userId: string, newRole: string) {
    this.api.updateUserRole(userId, newRole).subscribe({
      next: () => { this.loadUsers(); },
      error: (err: any) => { alert(err.error?.error || 'Failed to update role'); }
    });
  }
}
