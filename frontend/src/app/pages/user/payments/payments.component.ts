import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import { Payment } from '../../../models/payment.model';
import * as UserPaymentActions from '../../../store/user-payments/user-payment.actions';
import * as UserPaymentSelectors from '../../../store/user-payments/user-payment.selectors';
import { selectUser } from '../../../store/auth/auth.selectors';

@Component({
  selector: 'app-user-payments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="payments-container">
      <div class="header">
        <h1>My Payments</h1>
        <button routerLink="/user/payments/new" class="btn-primary">Create Payment</button>
      </div>

      <!-- Payment Stats -->
      <div class="stats-grid" *ngIf="paymentStats$ | async as stats">
        <div class="stat-card">
          <h3>Total Payments</h3>
          <p class="stat-value">{{ stats.totalPayments }}</p>
        </div>
        <div class="stat-card">
          <h3>Pending</h3>
          <p class="stat-value">{{ stats.pendingPayments }}</p>
        </div>
        <div class="stat-card">
          <h3>Verified</h3>
          <p class="stat-value">{{ stats.verifiedPayments }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Amount</h3>
          <p class="stat-value">€{{ stats.totalAmount | number:'1.2-2' }}</p>
        </div>
      </div>

      <!-- Payment Filters -->
      <div class="filters">
        <button 
          class="filter-btn" 
          [class.active]="selectedFilter === 'all'"
          (click)="setFilter('all')">
          All Payments
        </button>
        <button 
          class="filter-btn"
          [class.active]="selectedFilter === 'PENDING'"
          (click)="setFilter('PENDING')">
          Pending
        </button>
        <button 
          class="filter-btn"
          [class.active]="selectedFilter === 'VERIFIED'"
          (click)="setFilter('VERIFIED')">
          Verified
        </button>
        <button 
          class="filter-btn"
          [class.active]="selectedFilter === 'CANCELLED'"
          (click)="setFilter('CANCELLED')">
          Cancelled
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading$ | async">
        <p>Loading payments...</p>
      </div>

      <!-- Error State -->
      <div class="error" *ngIf="error$ | async as error">
        <p>Error: {{ error }}</p>
        <button (click)="refreshPayments()" class="btn-secondary">Retry</button>
      </div>

      <!-- Payments List -->
      <div class="payments-list" *ngIf="!(loading$ | async) && !(error$ | async)">
        <div class="payment-item" *ngFor="let payment of (filteredPayments$ | async)">
          <div class="payment-info">
            <div class="payment-header">
              <h4>€{{ payment.amount | number:'1.2-2' }}</h4>
              <span class="status" [class]="'status-' + payment.status.toLowerCase()">
                {{ payment.status }}
              </span>
            </div>
            <p class="payment-date">Scheduled: {{ payment.scheduled_date | date:'short' }}</p>
            <p class="payment-created" *ngIf="payment.charge?.subscription?.title">
              For: {{ payment.charge?.subscription?.title }}
            </p>
          </div>
          <div class="payment-actions" *ngIf="payment.status === 'PENDING'">
            <button (click)="editPayment(payment)" class="btn-small">Edit</button>
            <button (click)="cancelPayment(payment.id)" class="btn-small btn-danger">Cancel</button>
            <button (click)="deletePayment(payment.id)" class="btn-small btn-danger">Delete</button>
          </div>
          <div class="payment-verified" *ngIf="payment.status === 'VERIFIED' && payment.verified_at">
            <p class="verified-info">Verified {{ payment.verified_at | date:'short' }}</p>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="(filteredPayments$ | async)?.length === 0">
          <p>No payments found</p>
          <button routerLink="/user/payments/new" class="btn-primary">Create your first payment</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payments-container {
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

    .btn-primary {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
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
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .filter-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .filter-btn:hover:not(.active) {
      background: #e9ecef;
    }

    .payments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .payment-item {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .payment-info {
      flex: 1;
    }

    .payment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .payment-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }

    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
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

    .payment-date, .payment-created {
      margin: 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .payment-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .btn-small:not(.btn-danger) {
      background: #6c757d;
      color: white;
    }

    .btn-small.btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-small:hover {
      opacity: 0.8;
    }

    .verified-info {
      margin: 0;
      color: #28a745;
      font-size: 0.9rem;
    }

    .loading, .error {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
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
  `]
})
export class UserPaymentsComponent implements OnInit {
  payments$: Observable<Payment[]>;
  filteredPayments$: Observable<Payment[]>;
  paymentStats$: Observable<any>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  user$: Observable<any>;
  
  selectedFilter: string = 'all';

  constructor(private store: Store<AppState>) {
    this.payments$ = this.store.select(UserPaymentSelectors.selectAllUserPaymentsSelector);
    this.filteredPayments$ = this.store.select(UserPaymentSelectors.selectFilteredUserPayments);
    this.paymentStats$ = this.store.select(UserPaymentSelectors.selectUserPaymentStats);
    this.loading$ = this.store.select(UserPaymentSelectors.selectUserPaymentsLoading);
    this.error$ = this.store.select(UserPaymentSelectors.selectUserPaymentsError);
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
    this.store.dispatch(UserPaymentActions.loadUserPayments({ status: 'all' }));
    this.store.dispatch(UserPaymentActions.loadUserPaymentStats());
  }

  setFilter(status: string): void {
    this.selectedFilter = status;
    this.store.dispatch(UserPaymentActions.setPaymentFilter({ filter: status }));
  }

  refreshPayments(): void {
    this.store.dispatch(UserPaymentActions.loadUserPayments({ status: 'all' }));
  }

  editPayment(payment: Payment): void {
    // Navigate to edit page or open modal
    console.log('Edit payment:', payment);
  }

  cancelPayment(id: string): void {
    if (confirm('Are you sure you want to cancel this payment?')) {
      this.store.dispatch(UserPaymentActions.cancelUserPayment({ id }));
    }
  }

  deletePayment(id: string): void {
    if (confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      this.store.dispatch(UserPaymentActions.deleteUserPayment({ id }));
    }
  }
}
