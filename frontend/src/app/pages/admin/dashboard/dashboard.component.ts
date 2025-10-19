import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import { Subscription } from '../../../models/subscription.model';
import { User } from '../../../models/user.model';
import { Charge } from '../../../models/charge.model';
import * as SubscriptionsActions from '../../../store/subscriptions/subscriptions.actions';
import * as UsersActions from '../../../store/users/users.actions';
import * as ChargesActions from '../../../store/charges/charges.actions';
import { selectSubscriptions, selectSubscriptionsLoading } from '../../../store/subscriptions/subscriptions.selectors';
import { selectUsers, selectUsersLoading } from '../../../store/users/users.selectors';
import { selectCharges, selectChargesLoading } from '../../../store/charges/charges.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>
      
      <div class="dashboard-grid">
        <!-- Statistics Cards -->
        <div class="stat-card">
          <h3>Total Subscriptions</h3>
          <p class="stat-value">{{ (subscriptions$ | async)?.length || 0 }}</p>
          <button (click)="navigateToSubscriptions()" class="btn-link">Manage Subscriptions</button>
        </div>
        
        <div class="stat-card">
          <h3>Active Subscriptions</h3>
          <p class="stat-value">{{ activeSubscriptionsCount }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Total Users</h3>
          <p class="stat-value">{{ (users$ | async)?.length || 0 }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Total Charges</h3>
          <p class="stat-value">{{ (charges$ | async)?.length || 0 }}</p>
        </div>
      </div>

      <!-- Recent Subscriptions -->
      <div class="section">
        <h2>Recent Subscriptions</h2>
        <div *ngIf="subscriptionsLoading$ | async" class="loading">Loading...</div>
        <div *ngIf="!(subscriptionsLoading$ | async)" class="subscriptions-list">
          <div *ngFor="let subscription of (subscriptions$ | async)?.slice(0, 5)" class="subscription-item">
            <div class="subscription-info">
              <h4>{{ subscription.title }}</h4>
              <p>Total: €{{ subscription.total_amount }} | Billing Day: {{ subscription.billing_day }}</p>
              <p>Participants: {{ subscription.participants?.length || 0 }}</p>
            </div>
            <span class="status-badge" [class.active]="subscription.is_active">
              {{ subscription.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div *ngIf="(subscriptions$ | async)?.length === 0" class="empty-state">
            No subscriptions found. <a routerLink="/admin/subscriptions">Create one</a>
          </div>
        </div>
      </div>

      <!-- Recent Users -->
      <div class="section">
        <h2>Recent Users</h2>
        <div *ngIf="usersLoading$ | async" class="loading">Loading...</div>
        <div *ngIf="!(usersLoading$ | async)" class="users-list">
          <div *ngFor="let user of (users$ | async)?.slice(0, 5)" class="user-item">
            <div class="user-info">
              <h4>{{ user.name }}</h4>
              <p>{{ user.email }}</p>
            </div>
            <span class="role-badge" [class.admin]="user.role === 'ADMIN'">
              {{ user.role }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button (click)="navigateToSubscriptions()" class="action-btn">
            <span class="icon">📋</span>
            <span>Manage Subscriptions</span>
          </button>
          <button (click)="navigateToUsers()" class="action-btn">
            <span class="icon">👥</span>
            <span>Manage Users</span>
          </button>
          <button (click)="navigateToCharges()" class="action-btn">
            <span class="icon">💰</span>
            <span>View Charges</span>
          </button>
          <button (click)="navigateToPayments()" class="action-btn">
            <span class="icon">💳</span>
            <span>Manage Payments</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 2rem;
      color: #333;
    }

    h2 {
      margin-bottom: 1rem;
      color: #555;
      font-size: 1.5rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-card h3 {
      margin: 0 0 1rem 0;
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #007bff;
      margin: 0 0 1rem 0;
    }

    .btn-link {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
      font-size: 0.9rem;
    }

    .btn-link:hover {
      color: #0056b3;
    }

    .section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .subscriptions-list, .users-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .subscription-item, .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      transition: box-shadow 0.2s;
    }

    .subscription-item:hover, .user-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .subscription-info, .user-info {
      flex: 1;
    }

    .subscription-info h4, .user-info h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .subscription-info p, .user-info p {
      margin: 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .status-badge, .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      background: #e0e0e0;
      color: #666;
    }

    .status-badge.active {
      background: #28a745;
      color: white;
    }

    .role-badge.admin {
      background: #007bff;
      color: white;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .empty-state a {
      color: #007bff;
      text-decoration: none;
    }

    .empty-state a:hover {
      text-decoration: underline;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #e9ecef;
      border-color: #adb5bd;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .action-btn .icon {
      font-size: 2rem;
    }

    .action-btn span:last-child {
      font-weight: 500;
      color: #495057;
    }
  `]
})
export class DashboardComponent implements OnInit {
  subscriptions$: Observable<Subscription[]>;
  users$: Observable<User[]>;
  charges$: Observable<Charge[]>;
  subscriptionsLoading$: Observable<boolean>;
  usersLoading$: Observable<boolean>;
  chargesLoading$: Observable<boolean>;
  activeSubscriptionsCount = 0;

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
    this.subscriptions$ = this.store.select(selectSubscriptions);
    this.users$ = this.store.select(selectUsers);
    this.charges$ = this.store.select(selectCharges);
    this.subscriptionsLoading$ = this.store.select(selectSubscriptionsLoading);
    this.usersLoading$ = this.store.select(selectUsersLoading);
    this.chargesLoading$ = this.store.select(selectChargesLoading);
  }

  ngOnInit(): void {
    // Load data
    this.store.dispatch(SubscriptionsActions.loadSubscriptions());
    this.store.dispatch(UsersActions.loadUsers({}));
    this.store.dispatch(ChargesActions.loadCharges({}));

    // Count active subscriptions
    this.subscriptions$.subscribe(subscriptions => {
      this.activeSubscriptionsCount = subscriptions.filter(s => s.is_active).length;
    });
  }

  navigateToSubscriptions(): void {
    this.router.navigate(['/admin/subscriptions']);
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToCharges(): void {
    this.router.navigate(['/admin/charges']);
  }

  navigateToPayments(): void {
    this.router.navigate(['/admin/payments']);
  }
}

