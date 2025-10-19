import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import { User } from '../../../models/user.model';
import * as UsersActions from '../../../store/users/users.actions';
import { selectUsers, selectUsersLoading } from '../../../store/users/users.selectors';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="users-container">
      <div class="header">
        <h1>User Management</h1>
        <button class="btn-primary" (click)="refreshUsers()">
          Refresh Users
        </button>
      </div>

      <div class="users-section">
        <h2>All Users</h2>
        
        <div *ngIf="usersLoading$ | async" class="loading">Loading users...</div>
        
        <div *ngIf="!(usersLoading$ | async)" class="users-grid">
          <div *ngFor="let user of users$ | async" class="user-card">
            <div class="card-header">
              <h3>{{ user.name }}</h3>
              <span class="role-badge" [class.admin]="user.role === 'ADMIN'">
                {{ user.role }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">{{ user.email }}</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span class="value" [class.active]="user.is_active">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="info-row">
                <span class="label">Created:</span>
                <span class="value">{{ user.created_at | date:'short' }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button class="btn-secondary-sm">Edit User</button>
              <button class="btn-warning-sm">
                {{ user.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>

          <div *ngIf="(users$ | async)?.length === 0" class="empty-state">
            <p>No users found.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    h2 {
      margin: 0 0 1.5rem 0;
      color: #555;
      font-size: 1.5rem;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .users-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .users-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .user-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }

    .user-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      background: #e0e0e0;
      color: #666;
    }

    .role-badge.admin {
      background: #007bff;
      color: white;
    }

    .card-body {
      padding: 1.5rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .info-row .label {
      color: #666;
      font-weight: 500;
    }

    .info-row .value {
      color: #333;
    }

    .info-row .value.active {
      color: #28a745;
      font-weight: 500;
    }

    .card-footer {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-secondary-sm, .btn-warning-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-secondary-sm {
      background: #6c757d;
      color: white;
    }

    .btn-secondary-sm:hover {
      background: #5a6268;
    }

    .btn-warning-sm {
      background: #ffc107;
      color: #333;
    }

    .btn-warning-sm:hover {
      background: #e0a800;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
      grid-column: 1 / -1;
    }
  `]
})
export class UsersComponent implements OnInit {
  users$: Observable<User[]>;
  usersLoading$: Observable<boolean>;

  constructor(private store: Store<AppState>) {
    this.users$ = this.store.select(selectUsers);
    this.usersLoading$ = this.store.select(selectUsersLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(UsersActions.loadUsers({}));
  }

  refreshUsers(): void {
    this.store.dispatch(UsersActions.loadUsers({}));
  }
}
