import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-status" [class]="statusClass">
      <span class="status-badge" [class]="statusClass">
        <span class="status-icon" *ngIf="showIcon">{{ statusIcon }}</span>
        {{ statusText }}
      </span>
      <span *ngIf="showTimestamp && timestampText" class="status-timestamp">
        {{ timestampText }}
      </span>
    </div>
  `,
  styles: [`
    .payment-status {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .payment-status.vertical {
      flex-direction: column;
      align-items: flex-start;
    }

    .payment-status.horizontal {
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .status-badge.pending {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .status-badge.verified {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-badge.cancelled {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .status-icon {
      font-size: 0.875rem;
    }

    .status-timestamp {
      font-size: 0.75rem;
      color: #6c757d;
      font-weight: 400;
      text-transform: none;
      letter-spacing: normal;
    }

    /* Size variants */
    .status-badge.large {
      padding: 0.625rem 1rem;
      font-size: 1rem;
    }

    .status-badge.small {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
  `]
})
export class PaymentStatusComponent {
  @Input() payment: Payment | null = null;
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Input() size: 'small' | 'normal' | 'large' = 'normal';
  @Input() showIcon = true;
  @Input() showTimestamp = false;

  get statusClass(): string {
    if (!this.payment) return 'pending';
    return this.payment.status.toLowerCase();
  }

  get statusText(): string {
    if (!this.payment) return 'Unknown';
    return this.payment.status;
  }

  get statusIcon(): string {
    switch (this.payment?.status) {
      case 'PENDING':
        return '⏳';
      case 'VERIFIED':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '❓';
    }
  }

  get timestampText(): string {
    if (!this.payment || !this.showTimestamp) return '';

    switch (this.payment.status) {
      case 'PENDING':
        return `Created ${this.formatDate(this.payment.created_at)}`;
      case 'VERIFIED':
        return `Verified ${this.formatDate(this.payment.verified_at!)}`;
      case 'CANCELLED':
        return `Updated ${this.formatDate(this.payment.updated_at)}`;
      default:
        return '';
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'today';
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
