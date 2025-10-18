import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dumb-subscription-list',
  template: `
    <div class="subscription-list">
      <div class="header">
        <h2>Subscriptions</h2>
        <app-button 
          text="Add Subscription" 
          variant="primary"
          (click)="onCreateClick()">
        </app-button>
      </div>

      <app-loading [show]="loading" [message]="'Loading subscriptions...'"></app-loading>
      
      <app-error 
        [show]="!!error" 
        [message]="error || ''"
        (retry)="onRefresh()">
      </app-error>

      <div class="subscription-grid" *ngIf="!loading && !error">
        <app-card 
          *ngFor="let subscription of subscriptions" 
          [title]="subscription.title"
          [actions]="true">
          
          <div class="subscription-details">
            <p><strong>Total Amount:</strong> €{{ subscription.total_amount }}</p>
            <p><strong>Billing Day:</strong> {{ subscription.billing_day }}</p>
            <p><strong>Participants:</strong> {{ subscription.participants?.length || 0 }}</p>
            <p><strong>Status:</strong> 
              <span [class]="subscription.is_active ? 'status-active' : 'status-inactive'">
                {{ subscription.is_active ? 'Active' : 'Inactive' }}
              </span>
            </p>
          </div>

          <div slot="actions">
            <app-button 
              text="Edit" 
              variant="secondary" 
              size="small"
              (click)="onEdit(subscription)">
            </app-button>
            <app-button 
              text="Delete" 
              variant="danger" 
              size="small"
              (click)="onDelete(subscription.id)">
            </app-button>
          </div>
        </app-card>
      </div>

      <div class="empty-state" *ngIf="!loading && !error && subscriptions.length === 0">
        <p>No subscriptions found. Create your first subscription to get started.</p>
        <app-button 
          text="Create Subscription" 
          variant="primary"
          (click)="onCreateClick()">
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .subscription-list {
      padding: 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .subscription-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .subscription-details p {
      margin: 0.5rem 0;
    }

    .status-active {
      color: #27ae60;
      font-weight: bold;
    }

    .status-inactive {
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
export class DumbSubscriptionListComponent {
  @Input() subscriptions: any[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() create = new EventEmitter<void>();
  @Output() update = new EventEmitter<{ id: string; subscription: any }>();
  @Output() delete = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();

  onCreateClick() {
    this.create.emit();
  }

  onEdit(subscription: any) {
    this.update.emit({ id: subscription.id, subscription });
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this subscription?')) {
      this.delete.emit(id);
    }
  }

  onRefresh() {
    this.refresh.emit();
  }
}
