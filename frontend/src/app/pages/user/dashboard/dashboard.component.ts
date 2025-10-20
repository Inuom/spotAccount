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
import * as UserPaymentActions from '../../../store/user-payments/user-payment.actions';
import * as UserPaymentSelectors from '../../../store/user-payments/user-payment.selectors';

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
          <p class="stat-value">{{ (paymentStats$ | async)?.pendingPayments || 0 }}</p>
          <a routerLink="/user/payments" class="btn-link">Manage Payments</a>
        </div>
        
        <div class="stat-card">
          <h3>Total Payments</h3>
          <p class="stat-value">{{ (paymentStats$ | async)?.totalPayments || 0 }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Total Amount</h3>
          <p class="stat-value">€{{ ((paymentStats$ | async)?.totalAmount || 0) | number:'1.2-2' }}</p>
        </div>
        
        <div class="stat-card">
          <h3>My Balance</h3>
          <p class="stat-value">View Details</p>
          <a routerLink="/user/balance" class="btn-link">View Balance</a>
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
          <button class="action-btn" routerLink="/user/balance">
            <span class="icon">💰</span>
            <span>My Balance</span>
          </button>
        </div>
      </div>

      <!-- Recent Payments -->
      <div class="section">
        <h2>Recent Payments</h2>
        <ng-container *ngIf="(recentPayments$ | async) as payments; else noRecentPayments">
          <div class="recent-payments" *ngIf="payments.length > 0">
            <div class="payment-item" *ngFor="let payment of payments | slice:0:5">
              <div class="payment-info">
                <span class="payment-amount">€{{ payment.amount | number:'1.2-2' }}</span>
                <span class="payment-status" [class]="'status-' + payment.status.toLowerCase()">
                  {{ payment.status }}
                </span>
              </div>
              <div class="payment-details">
                <span class="payment-date">{{ payment.scheduled_date | date:'short' }}</span>
                <span class="payment-subscription" *ngIf="payment.charge?.subscription?.title">
                  For {{ payment.charge?.subscription?.title }}
                </span>
              </div>
            </div>
            <div class="view-all-link">
              <a routerLink="/user/payments" class="btn-link">View All Payments</a>
            </div>
          </div>
        </ng-container>
        <ng-template #noRecentPayments>
          <div class="empty-state">
            <p>No recent payments to display.</p>
            <a routerLink="/user/payments" class="btn-link">Create your first payment</a>
          </div>
        </ng-template>
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

    .recent-payments {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .payment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }

    .payment-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .payment-amount {
      font-weight: 600;
      color: #333;
      font-size: 1.1rem;
    }

    .payment-status {
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 600;
      width: fit-content;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-verified {
      background: #d4edda;
      color: #155724;
    }

    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .payment-details {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      font-size: 0.9rem;
      color: #666;
    }

    .view-all-link {
      margin-top: 1rem;
      text-align: center;
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  user$: Observable<User | null>;
  paymentStats$: Observable<any>;
  recentPayments$: Observable<Payment[]>;

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
    this.user$ = this.store.select(selectUser);
    this.paymentStats$ = this.store.select(UserPaymentSelectors.selectUserPaymentStats);
    this.recentPayments$ = this.store.select(UserPaymentSelectors.selectAllUserPaymentsSelector);
  }

  ngOnInit(): void {
    // Load user payment data
    this.store.dispatch(UserPaymentActions.loadUserPaymentStats());
    this.store.dispatch(UserPaymentActions.loadUserPayments({ status: 'all' }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
