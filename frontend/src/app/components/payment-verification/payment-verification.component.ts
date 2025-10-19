import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { Payment, VerifyPaymentDto } from '../../models/payment.model';

@Component({
  selector: 'app-payment-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="payment-verification" *ngIf="payment">
      <div class="verification-header">
        <h3>Verify Payment</h3>
        <p class="payment-summary">
          <strong>€{{ payment.amount | number:'1.2-2' }}</strong> • 
          {{ payment.user?.name }} • 
          {{ payment.scheduled_date | date:'short' }}
        </p>
      </div>

      <form [formGroup]="verificationForm" (ngSubmit)="onVerify()" class="verification-form">
        <div class="form-group">
          <label for="verification_reference">Verification Reference</label>
          <input
            id="verification_reference"
            type="text"
            formControlName="verification_reference"
            placeholder="Enter bank reference, receipt number, etc."
            class="form-control"
          />
          <small class="form-text">Optional: Add a reference number for this verification</small>
        </div>

        <div class="verification-actions">
          <button 
            type="submit" 
            [disabled]="verificationForm.invalid || loading"
            class="btn-primary">
            {{ loading ? 'Verifying...' : 'Verify Payment' }}
          </button>
          <button 
            type="button" 
            (click)="onCancel()" 
            class="btn-secondary"
            [disabled]="loading">
            Cancel
          </button>
        </div>
      </form>

      <div class="payment-details">
        <h4>Payment Details</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">User:</span>
            <span class="value">{{ payment.user?.name }} ({{ payment.user?.email }})</span>
          </div>
          <div class="detail-item" *ngIf="payment.charge">
            <span class="label">Charge:</span>
            <span class="value">{{ payment.charge.amount_total }} for period {{ payment.charge.period_start | date:'short' }} - {{ payment.charge.period_end | date:'short' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Created:</span>
            <span class="value">{{ payment.created_at | date:'short' }} by {{ payment.creator?.name }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-verification {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      max-width: 500px;
    }

    .verification-header {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 1rem;
    }

    .verification-header h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .payment-summary {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
    }

    .verification-form {
      margin-bottom: 1.5rem;
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

    .form-text {
      display: block;
      margin-top: 0.25rem;
      color: #666;
      font-size: 0.875rem;
    }

    .verification-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-primary {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #218838;
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
      transition: background-color 0.2s;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn-secondary:disabled {
      background: #adb5bd;
      cursor: not-allowed;
    }

    .payment-details {
      border-top: 1px solid #e0e0e0;
      padding-top: 1.5rem;
    }

    .payment-details h4 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .detail-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .detail-item .label {
      color: #666;
      font-weight: 500;
      min-width: 100px;
      flex-shrink: 0;
    }

    .detail-item .value {
      color: #333;
      text-align: right;
      flex: 1;
    }
  `]
})
export class PaymentVerificationComponent implements OnInit {
  @Input() payment: Payment | null = null;
  @Input() loading = false;
  @Output() verify = new EventEmitter<VerifyPaymentDto>();
  @Output() cancel = new EventEmitter<void>();

  verificationForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.verificationForm = this.formBuilder.group({
      verification_reference: ['']
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  onVerify(): void {
    if (this.verificationForm.valid) {
      const verificationData: VerifyPaymentDto = {
        verification_reference: this.verificationForm.value.verification_reference || undefined
      };
      this.verify.emit(verificationData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
