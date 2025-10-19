import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import { User } from '../../../models/user.model';
import * as UsersActions from '../../../store/users/users.actions';
import {
  selectUsers,
  selectUsersLoading,
  selectInvitationLink,
  selectInvitationExpiresAt,
  selectInvitationUserId
} from '../../../store/users/users.selectors';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container">
      <div class="header">
        <h1>User Management</h1>
        <div class="header-actions">
          <button class="btn-secondary" (click)="showCreateUserModal = true">
            Create User
          </button>
          <button class="btn-primary" (click)="refreshUsers()">
            Refresh Users
          </button>
        </div>
      </div>

      <!-- Create User Modal -->
      <div *ngIf="showCreateUserModal" class="modal-overlay" (click)="closeCreateUserModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Create New User</h2>
            <button class="close-btn" (click)="closeCreateUserModal()">&times;</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="onCreateUser()">
              <div class="form-group">
                <label for="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="newUser.email"
                  name="email"
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div class="form-group">
                <label for="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  [(ngModel)]="newUser.name"
                  name="name"
                  required
                  placeholder="John Doe"
                />
              </div>
              <div class="form-group">
                <label for="role">Role</label>
                <select id="role" [(ngModel)]="newUser.role" name="role">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div class="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    [(ngModel)]="newUser.is_active"
                    name="is_active"
                  />
                  Active
                </label>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-secondary" (click)="closeCreateUserModal()">
                  Cancel
                </button>
                <button type="submit" class="btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Invitation Link Modal -->
      <div *ngIf="invitationLink$ | async as invitationLink" class="modal-overlay" (click)="clearInvitationLink()">
        <div class="modal-content invitation-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>User Created Successfully!</h2>
            <button class="close-btn" (click)="clearInvitationLink()">&times;</button>
          </div>
          <div class="modal-body">
            <p class="success-message">
              User has been created. Share this setup link with them to complete registration:
            </p>
            <div class="invitation-link-container">
              <input
                type="text"
                [value]="invitationLink"
                readonly
                #invitationInput
                class="invitation-link-input"
              />
              <button class="btn-copy" (click)="copyInvitationLink(invitationInput)">
                {{ linkCopied ? 'Copied!' : 'Copy Link' }}
              </button>
            </div>
            <div *ngIf="invitationExpiresAt$ | async as expiresAt" class="expiry-info">
              <p><strong>Link expires:</strong> {{ expiresAt | date:'medium' }}</p>
              <p class="expiry-warning">⚠️ This link can only be used once and will expire in 48 hours.</p>
            </div>
          </div>
        </div>
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

    .header-actions {
      display: flex;
      gap: 1rem;
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

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #007bff;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .invitation-modal {
      max-width: 600px;
    }

    .success-message {
      color: #28a745;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .invitation-link-container {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .invitation-link-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .btn-copy {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      white-space: nowrap;
    }

    .btn-copy:hover {
      background: #218838;
    }

    .expiry-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #ffc107;
    }

    .expiry-info p {
      margin: 0.5rem 0;
    }

    .expiry-warning {
      color: #856404;
      font-size: 0.9rem;
    }
  `]
})
export class UsersComponent implements OnInit {
  users$: Observable<User[]>;
  usersLoading$: Observable<boolean>;
  invitationLink$: Observable<string | null>;
  invitationExpiresAt$: Observable<string | null>;
  invitationUserId$: Observable<string | null>;

  showCreateUserModal = false;
  linkCopied = false;

  newUser = {
    email: '',
    name: '',
    role: 'USER' as 'USER' | 'ADMIN',
    is_active: true,
  };

  constructor(private store: Store<AppState>) {
    this.users$ = this.store.select(selectUsers);
    this.usersLoading$ = this.store.select(selectUsersLoading);
    this.invitationLink$ = this.store.select(selectInvitationLink);
    this.invitationExpiresAt$ = this.store.select(selectInvitationExpiresAt);
    this.invitationUserId$ = this.store.select(selectInvitationUserId);
  }

  ngOnInit(): void {
    this.store.dispatch(UsersActions.loadUsers({}));
  }

  refreshUsers(): void {
    this.store.dispatch(UsersActions.loadUsers({}));
  }

  closeCreateUserModal(): void {
    this.showCreateUserModal = false;
    this.resetNewUserForm();
  }

  onCreateUser(): void {
    if (!this.newUser.email || !this.newUser.name) {
      return;
    }

    this.store.dispatch(
      UsersActions.createUserWithInvitation({
        user: {
          email: this.newUser.email.trim(),
          name: this.newUser.name.trim(),
          role: this.newUser.role,
          is_active: this.newUser.is_active,
        },
      })
    );

    this.closeCreateUserModal();
  }

  copyInvitationLink(input: HTMLInputElement): void {
    input.select();
    document.execCommand('copy');
    this.linkCopied = true;

    // Reset the "Copied!" message after 3 seconds
    setTimeout(() => {
      this.linkCopied = false;
    }, 3000);
  }

  clearInvitationLink(): void {
    this.linkCopied = false;
    this.store.dispatch(UsersActions.clearInvitationLink());
  }

  private resetNewUserForm(): void {
    this.newUser = {
      email: '',
      name: '',
      role: 'USER',
      is_active: true,
    };
  }
}
