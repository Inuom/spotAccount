import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../store';
import { CreateUserPaymentDto, SuggestedSchedule } from '../../models/payment.model';
import * as UserPaymentActions from '../../store/user-payments/user-payment.actions';
import * as UserPaymentSelectors from '../../store/user-payments/user-payment.selectors';

@Component({
  selector: 'app-user-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="payment-form-container">
      <h2>{{ isEditMode ? 'Edit Payment' : 'Create Payment' }}</h2>
      
      <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="payment-form">
        <div class="form-group">
          <label for="amount">Amount (€)</label>
          <input
            id="amount"
            type="number"
            formControlName="amount"
            step="0.01"
            min="0.01"
            class="form-control"
            [class.error]="paymentForm.get('amount')?.invalid && paymentForm.get('amount')?.touched">
          <div class="error-message" *ngIf="paymentForm.get('amount')?.invalid && paymentForm.get('amount')?.touched">
            <span *ngIf="paymentForm.get('amount')?.errors?.['required']">Amount is required</span>
            <span *ngIf="paymentForm.get('amount')?.errors?.['min']">Amount must be at least €0.01</span>
          </div>
        </div>

        <div class="form-group">
          <label for="currency">Currency</label>
          <select id="currency" formControlName="currency" class="form-control">
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div class="form-group">
          <label for="scheduled_date">Scheduled Date</label>
          <input
            id="scheduled_date"
            type="date"
            formControlName="scheduled_date"
            class="form-control"
            [class.error]="paymentForm.get('scheduled_date')?.invalid && paymentForm.get('scheduled_date')?.touched">
          <div class="error-message" *ngIf="paymentForm.get('scheduled_date')?.invalid && paymentForm.get('scheduled_date')?.touched">
            <span *ngIf="paymentForm.get('scheduled_date')?.errors?.['required']">Scheduled date is required</span>
            <span *ngIf="paymentForm.get('scheduled_date')?.errors?.['futureDate']">Date must be in the future</span>
          </div>
        </div>

        <div class="form-group" *ngIf="suggestedSchedule$ | async as schedule">
          <label>Suggested Dates</label>
          <div class="suggested-dates">
            <button 
              type="button" 
              class="btn-suggestion"
              (click)="useSuggestedDate(schedule.suggestedDate)">
              {{ schedule.suggestedDate | date:'shortDate' }} (Recommended)
            </button>
            <div class="alternatives" *ngIf="schedule.alternativeDates.length > 0">
              <p>Alternative dates:</p>
              <button 
                *ngFor="let altDate of schedule.alternativeDates" 
                type="button" 
                class="btn-suggestion btn-small"
                (click)="useSuggestedDate(altDate)">
                {{ altDate | date:'shortDate' }}
              </button>
            </div>
          </div>
          <p class="suggestion-reason">{{ schedule.reason }}</p>
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            class="btn-secondary" 
            (click)="onCancel()">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="paymentForm.invalid || (loading$ | async)">
            {{ (loading$ | async) ? 'Saving...' : (isEditMode ? 'Update Payment' : 'Create Payment') }}
          </button>
        </div>

        <div class="error-message server-error" *ngIf="error$ | async as error">
          {{ error }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .payment-form-container {
      max-width: 500px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h2 {
      margin-bottom: 2rem;
      color: #333;
    }

    .payment-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 500;
      color: #555;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
    }

    .server-error {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      padding: 0.75rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .suggested-dates {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-suggestion {
      background: #e9ecef;
      border: 1px solid #adb5bd;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .btn-suggestion:hover {
      background: #dee2e6;
    }

    .btn-suggestion.btn-small {
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
    }

    .alternatives {
      margin-top: 0.5rem;
    }

    .alternatives p {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: #666;
    }

    .suggestion-reason {
      font-size: 0.8rem;
      color: #666;
      font-style: italic;
      margin: 0.5rem 0 0 0;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
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

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #6c757d;
      cursor: not-allowed;
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
  `]
})
export class UserPaymentFormComponent implements OnInit {
  @Input() initialData?: CreateUserPaymentDto;
  @Input() isEditMode: boolean = false;
  @Output() formSubmitted = new EventEmitter<CreateUserPaymentDto>();
  @Output() formCancelled = new EventEmitter<void>();

  paymentForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  suggestedSchedule$: Observable<SuggestedSchedule | null>;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {
    this.loading$ = this.store.select(UserPaymentSelectors.selectUserPaymentsLoading);
    this.error$ = this.store.select(UserPaymentSelectors.selectUserPaymentsError);
    this.suggestedSchedule$ = this.store.select(UserPaymentSelectors.selectSuggestedSchedule);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['EUR'],
      scheduled_date: [tomorrowString, [Validators.required, this.futureDateValidator]]
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.paymentForm.patchValue({
        amount: this.initialData.amount,
        currency: this.initialData.currency || 'EUR',
        scheduled_date: this.initialData.scheduled_date.split('T')[0]
      });
    }

    // Get suggested schedule when amount changes
    this.paymentForm.get('amount')?.valueChanges.subscribe(amount => {
      if (amount && amount > 0) {
        this.store.dispatch(UserPaymentActions.getSuggestedSchedule({ amount }));
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.value;
      const paymentData: CreateUserPaymentDto = {
        amount: formValue.amount,
        currency: formValue.currency,
        scheduled_date: new Date(formValue.scheduled_date).toISOString()
      };

      this.formSubmitted.emit(paymentData);
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  useSuggestedDate(date: Date): void {
    const dateString = date.toISOString().split('T')[0];
    this.paymentForm.patchValue({
      scheduled_date: dateString
    });
  }

  private futureDateValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      return { futureDate: true };
    }

    return null;
  }
}
