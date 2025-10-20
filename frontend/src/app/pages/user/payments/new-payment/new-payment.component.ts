import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../../store';
import { CreateUserPaymentDto } from '../../../../models/payment.model';
import { UserPaymentFormComponent } from '../../../../components/user-payment-form/user-payment-form.component';
import * as UserPaymentSelectors from '../../../../store/user-payments/user-payment.selectors';
import * as UserPaymentActions from '../../../../store/user-payments/user-payment.actions';

@Component({
  selector: 'app-new-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, UserPaymentFormComponent],
  template: `
    <div class="new-payment-container">
      <div class="header">
        <h1>Create New Payment</h1>
        <button routerLink="/user/payments" class="btn-secondary">← Back to Payments</button>
      </div>

      <div class="form-wrapper">
        <app-user-payment-form
          [isEditMode]="false"
          (formSubmitted)="onFormSubmitted($event)"
          (formCancelled)="onFormCancelled()">
        </app-user-payment-form>
      </div>

      <!-- Loading indicator -->
      <div class="loading" *ngIf="loading$ | async">
        <p>Creating payment...</p>
      </div>

      <!-- Error message -->
      <div class="error" *ngIf="error$ | async as error">
        <p>Error: {{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .new-payment-container {
      padding: 2rem;
      max-width: 800px;
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

    .header h1 {
      margin: 0;
      color: #333;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .form-wrapper {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .error {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
    }

    .error p {
      margin: 0;
    }
  `]
})
export class NewPaymentComponent implements OnInit {
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
    this.loading$ = this.store.select(UserPaymentSelectors.selectUserPaymentsLoading);
    this.error$ = this.store.select(UserPaymentSelectors.selectUserPaymentsError);
  }

  ngOnInit(): void {
    // Component initialization
  }

  onFormSubmitted(paymentData: CreateUserPaymentDto): void {
    // Dispatch the create payment action
    this.store.dispatch(UserPaymentActions.createUserPayment({ payment: paymentData }));
    
    // Navigate back to payments list after successful creation
    // Note: In a real app, you might want to wait for success before navigating
    this.router.navigate(['/user/payments']);
  }

  onFormCancelled(): void {
    // Navigate back to payments list when form is cancelled
    this.router.navigate(['/user/payments']);
  }
}
