import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';

import { AppState } from '../../../store';
import { Payment } from '../../../models/payment.model';
import { User } from '../../../models/user.model';
import * as PaymentActions from '../../../store/payments/payment.actions';
import * as UsersActions from '../../../store/users/users.actions';
import { 
  selectAllPaymentsSelector, 
  selectPaymentsLoading, 
  selectPaymentsError,
  selectPendingPayments
} from '../../../store/payments/payment.selectors';
import { selectUsers } from '../../../store/users/users.selectors';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="payments-container">
      <div class="header">
        <h1>Payment Management</h1>
        <div class="header-actions">
          <select [(ngModel)]="selectedStatus" (change)="onStatusFilterChange()" class="filter-select">
            <option value="">All Payments</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button (click)="refreshPayments()" class="btn-secondary">Refresh</button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Pending Verification</h3>
          <p class="stat-value">{{ pendingCount }}</p>
        </div>
        <div class="stat-card">
          <h3>Verified Today</h3>
          <p class="stat-value">{{ todayVerifiedCount }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Amount Pending</h3>
          <p class="stat-value">€{{ totalPendingAmount | number:'1.2-2' }}</p>
        </div>
      </div>

      <!-- Error Display -->
      <div *ngIf="paymentsError$ | async as error" class="error-message">
        {{ error }}
        <button (click)="clearError()" class="btn-close">×</button>
      </div>

      <!-- Payments List -->
      <div class="payments-section">
        <div *ngIf="paymentsLoading$ | async" class="loading">
          Loading payments...
        </div>

        <div *ngIf="!(paymentsLoading$ | async)" class="payments-grid">
          <div *ngFor="let payment of filteredPayments$ | async" class="payment-card" 
               [class.pending]="payment.status === 'PENDING'"
               [class.verified]="payment.status === 'VERIFIED'"
               [class.cancelled]="payment.status === 'CANCELLED'">
            
            <div class="card-header">
              <div class="payment-info">
                <h3>€{{ payment.amount | number:'1.2-2' }}</h3>
                <p>{{ payment.user?.name || 'Unknown User' }}</p>
                <p class="email">{{ payment.user?.email }}</p>
              </div>
              <span class="status-badge" [class]="payment.status.toLowerCase()">
                {{ payment.status }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Scheduled Date:</span>
                <span class="value">{{ payment.scheduled_date | date:'short' }}</span>
              </div>
              
              <div class="info-row">
                <span class="label">Created:</span>
                <span class="value">{{ payment.created_at | date:'short' }}</span>
              </div>

              <div *ngIf="payment.charge?.subscription" class="info-row">
                <span class="label">Subscription:</span>
                <span class="value">{{ payment.charge?.subscription?.title }}</span>
              </div>

              <div *ngIf="payment.verification_reference" class="info-row">
                <span class="label">Reference:</span>
                <span class="value">{{ payment.verification_reference }}</span>
              </div>

              <div *ngIf="payment.verified_at" class="info-row">
                <span class="label">Verified:</span>
                <span class="value">{{ payment.verified_at | date:'short' }} by {{ payment.verifier?.name }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button (click)="viewPaymentDetails(payment.id)" class="btn-secondary-sm">
                View Details
              </button>
              
              <button 
                *ngIf="payment.status === 'PENDING'"
                (click)="openVerificationModal(payment)" 
                class="btn-primary-sm">
                Verify Payment
              </button>
              
              <button 
                *ngIf="payment.status === 'PENDING'"
                (click)="cancelPayment(payment.id)" 
                class="btn-warning-sm">
                Cancel
              </button>
            </div>
          </div>

          <div *ngIf="(filteredPayments$ | async)?.length === 0" class="empty-state">
            <p>No payments found.</p>
            <p *ngIf="selectedStatus">Try changing the filter above.</p>
          </div>
        </div>
      </div>

      <!-- Verification Modal -->
      <div *ngIf="verificationModalOpen" class="modal-overlay" (click)="closeVerificationModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Verify Payment</h2>
            <button (click)="closeVerificationModal()" class="btn-close">×</button>
          </div>
          
          <div *ngIf="selectedPayment" class="modal-body">
            <div class="payment-summary">
              <p><strong>Amount:</strong> €{{ selectedPayment.amount | number:'1.2-2' }}</p>
              <p><strong>User:</strong> {{ selectedPayment.user?.name }} ({{ selectedPayment.user?.email }})</p>
              <p><strong>Scheduled:</strong> {{ selectedPayment.scheduled_date | date:'short' }}</p>
            </div>

            <form [formGroup]="verificationForm" (ngSubmit)="verifyPayment()">
              <div class="form-group">
                <label for="verification_reference">Verification Reference (Optional)</label>
                <input
                  id="verification_reference"
                  type="text"
                  formControlName="verification_reference"
                  placeholder="e.g., Bank transfer reference, receipt number"
                  class="form-control"
                />
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  [disabled]="verificationForm.invalid || (paymentsLoading$ | async)"
                  class="btn-primary">
                  {{ (paymentsLoading$ | async) ? 'Verifying...' : 'Verify Payment' }}
                </button>
                <button type="button" (click)="closeVerificationModal()" class="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payments-container {
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

    .header h1 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
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

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: inherit;
    }

    .payments-section {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .payments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }

    .payment-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }

    .payment-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .payment-card.pending {
      border-left: 4px solid #ffc107;
    }

    .payment-card.verified {
      border-left: 4px solid #28a745;
    }

    .payment-card.cancelled {
      border-left: 4px solid #dc3545;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .payment-info h3 {
      margin: 0 0 0.25rem 0;
      color: #333;
      font-size: 1.25rem;
    }

    .payment-info p {
      margin: 0.125rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .payment-info .email {
      font-size: 0.8rem;
      color: #999;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.verified {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .card-body {
      padding: 1rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .info-row .label {
      color: #666;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .info-row .value {
      color: #333;
      font-size: 0.9rem;
    }

    .card-footer {
      padding: 1rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary, .btn-warning-sm, .btn-secondary-sm {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
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
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
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
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      color: #333;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .payment-summary {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }

    .payment-summary p {
      margin: 0.5rem 0;
      color: #333;
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

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
  `]
})
export class PaymentsComponent implements OnInit {
  payments$: Observable<Payment[]>;
  filteredPayments$: Observable<Payment[]>;
  paymentsLoading$: Observable<boolean>;
  paymentsError$: Observable<string | null>;
  users$: Observable<User[]>;
  
  selectedStatus = '';
  pendingCount = 0;
  todayVerifiedCount = 0;
  totalPendingAmount = 0;
  
  verificationModalOpen = false;
  selectedPayment: Payment | null = null;
  verificationForm: FormGroup;

  constructor(
    private store: Store<AppState>,
    private formBuilder: FormBuilder
  ) {
    this.payments$ = this.store.select(selectAllPaymentsSelector);
    this.filteredPayments$ = this.payments$;
    this.paymentsLoading$ = this.store.select(selectPaymentsLoading);
    this.paymentsError$ = this.store.select(selectPaymentsError);
    this.users$ = this.store.select(selectUsers);

    this.verificationForm = this.formBuilder.group({
      verification_reference: ['']
    });

    // Calculate statistics
    this.payments$.subscribe(payments => {
      const today = new Date().toDateString();
      
      this.pendingCount = payments.filter(p => p.status === 'PENDING').length;
      this.todayVerifiedCount = payments.filter(p => 
        p.status === 'VERIFIED' && 
        new Date(p.verified_at!).toDateString() === today
      ).length;
      this.totalPendingAmount = payments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + p.amount, 0);
    });
  }

  ngOnInit(): void {
    this.store.dispatch(PaymentActions.loadPayments({}));
    this.store.dispatch(PaymentActions.loadPendingPayments());
    this.store.dispatch(UsersActions.loadUsers({}));
  }

  onStatusFilterChange(): void {
    if (this.selectedStatus) {
      this.filteredPayments$ = this.payments$.pipe(
        map(payments => payments.filter(payment => payment.status === this.selectedStatus))
      );
    } else {
      this.filteredPayments$ = this.payments$;
    }
  }

  refreshPayments(): void {
    this.store.dispatch(PaymentActions.loadPayments({}));
    this.store.dispatch(PaymentActions.loadPendingPayments());
  }

  clearError(): void {
    this.store.dispatch(PaymentActions.clearPaymentsError());
  }

  openVerificationModal(payment: Payment): void {
    this.selectedPayment = payment;
    this.verificationModalOpen = true;
    this.verificationForm.reset();
  }

  closeVerificationModal(): void {
    this.verificationModalOpen = false;
    this.selectedPayment = null;
    this.verificationForm.reset();
  }

  verifyPayment(): void {
    if (this.selectedPayment && this.verificationForm.valid) {
      const verificationData = {
        verification_reference: this.verificationForm.value.verification_reference || undefined
      };
      
      this.store.dispatch(PaymentActions.verifyPayment({
        id: this.selectedPayment.id,
        verificationData
      }));
      
      this.closeVerificationModal();
    }
  }

  cancelPayment(paymentId: string): void {
    if (confirm('Are you sure you want to cancel this payment?')) {
      this.store.dispatch(PaymentActions.cancelPayment({ id: paymentId }));
    }
  }

  viewPaymentDetails(paymentId: string): void {
    // Navigation to payment details could be implemented here
    console.log('View payment details:', paymentId);
  }
}
