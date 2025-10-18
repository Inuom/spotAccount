import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dumb-payment-list',
  template: `
    <div class="payment-list">
      <div class="header">
        <h2>Payments</h2>
        <app-button 
          text="Add Payment" 
          variant="primary"
          (click)="onCreateClick()">
        </app-button>
      </div>

      <app-loading [show]="loading" [message]="'Loading payments...'"></app-loading>
      
      <app-error 
        [show]="!!error" 
        [message]="error || ''"
        (retry)="onRefresh()">
      </app-error>

      <div class="payment-table" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let payment of payments">
              <td>{{ payment.user?.name || 'Unknown' }}</td>
              <td>€{{ payment.amount }}</td>
              <td>
                <span [class]="getStatusClass(payment.status)">
                  {{ payment.status }}
                </span>
              </td>
              <td>{{ payment.scheduled_date | date:'short' }}</td>
              <td class="actions">
                <app-button 
                  *ngIf="canEdit(payment)"
                  text="Edit" 
                  variant="secondary" 
                  size="small"
                  (click)="onEdit(payment)">
                </app-button>
                <app-button 
                  *ngIf="canVerify(payment)"
                  text="Verify" 
                  variant="success" 
                  size="small"
                  (click)="onVerify(payment)">
                </app-button>
                <app-button 
                  *ngIf="canDelete(payment)"
                  text="Delete" 
                  variant="danger" 
                  size="small"
                  (click)="onDelete(payment.id)">
                </app-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" *ngIf="!loading && !error && payments.length === 0">
        <p>No payments found. Create your first payment to get started.</p>
        <app-button 
          text="Create Payment" 
          variant="primary"
          (click)="onCreateClick()">
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .payment-list {
      padding: 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .payment-table {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e1e8ed;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .status-pending {
      color: #f39c12;
      font-weight: bold;
    }

    .status-verified {
      color: #27ae60;
      font-weight: bold;
    }

    .status-cancelled {
      color: #e74c3c;
      font-weight: bold;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
  `]
})
export class DumbPaymentListComponent {
  @Input() payments: any[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() userRole: string | null = null;

  @Output() create = new EventEmitter<void>();
  @Output() update = new EventEmitter<{ id: string; payment: any }>();
  @Output() verify = new EventEmitter<{ id: string; verificationData: any }>();
  @Output() delete = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  canEdit(payment: any): boolean {
    return payment.status === 'pending' && this.userRole === 'admin';
  }

  canVerify(payment: any): boolean {
    return payment.status === 'pending' && this.userRole === 'admin';
  }

  canDelete(payment: any): boolean {
    return payment.status === 'pending' && this.userRole === 'admin';
  }

  onCreateClick() {
    this.create.emit();
  }

  onEdit(payment: any) {
    this.update.emit({ id: payment.id, payment });
  }

  onVerify(payment: any) {
    this.verify.emit({ id: payment.id, verificationData: {} });
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this payment?')) {
      this.delete.emit(id);
    }
  }

  onRefresh() {
    this.refresh.emit();
  }
}
