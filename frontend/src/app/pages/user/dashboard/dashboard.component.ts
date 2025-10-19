import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import { Subscription } from '../../../models/subscription.model';
import { User } from '../../../models/user.model';
import { Payment } from '../../../models/payment.model';
import * as AuthActions from '../../../store/auth/auth.actions';
import { selectUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>My Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{ (user$ | async)?.name || 'User' }}!</span>
          <button (click)="logout()" class="btn-secondary">Logout</button>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <!-- Quick Stats -->
        <div class="stat-card">
          <h3>Active Subscriptions</h3>
          <p class="stat-value">0</p>
          <a routerLink="/user/subscriptions" class="btn-link">View All</a>
        </div>
        
        <div class="stat-card">
          <h3>Pending Payments</h3>
          <p class="stat-value">0</p>
          <a routerLink="/user/payments" class="btn-link">Manage Payments</a>
        </div>
        
        <div class="stat-card">
          <h3>Total Owed</h3>
          <p class="stat-value">€0.00</p>
        </div>
        
        <div class="stat-card">
          <h3>Total Paid</h3>
          <p class="stat-value">€0.00</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-btn" routerLink="/user/account">
            <span class="icon">👤</span>
            <span>My Account</span>
          </button>
          <button class="action-btn" routerLink="/user/settings">
            <span class="icon">⚙️</span>
            <span>Settings</span>
          </button>
          <button class="action-btn" routerLink="/user/subscriptions">
            <span class="icon">📋</span>
            <span>My Subscriptions</span>
          </button>
          <button class="action-btn" routerLink="/user/payments">
            <span class="icon">💳</span>
            <span>My Payments</span>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="section">
        <h2>Recent Activity</h2>
        <div class="empty-state">
          <p>No recent activity to display.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-secondary:hover {
      background: #5a6268;
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
      text-align: center;
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
      color: #007bff;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .btn-link:hover {
      color: #0056b3;
      text-decoration: underline;
    }

    .section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
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
      text-decoration: none;
      color: inherit;
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

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  user$: Observable<User | null>;

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    // Load any user-specific data here if needed
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
