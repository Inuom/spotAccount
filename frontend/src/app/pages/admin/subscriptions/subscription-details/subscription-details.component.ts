import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppState } from '../../../../store';
import { Subscription } from '../../../../models/subscription.model';
import * as SubscriptionsActions from '../../../../store/subscriptions/subscriptions.actions';
import { selectSubscriptions } from '../../../../store/subscriptions/subscriptions.selectors';
import { AddParticipantComponent } from '../../../../components/add-participant/add-participant.component';

@Component({
  selector: 'app-subscription-details',
  standalone: true,
  imports: [CommonModule, AddParticipantComponent],
  template: `
    <div class="subscription-details-container">
      <div class="header">
        <button (click)="goBack()" class="btn-back">← Back to Subscriptions</button>
        <h1>{{ (subscription$ | async)?.title || 'Loading...' }}</h1>
        <button 
          *ngIf="subscription$ | async as subscription"
          (click)="showAddParticipantForm = !showAddParticipantForm" 
          class="btn-primary"
        >
          + Add Participant
        </button>
      </div>

      <div *ngIf="subscription$ | async as subscription" class="subscription-details">
        <div class="info-section">
          <div class="info-card">
            <h2>Subscription Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <label>Total Amount:</label>
                <span>€{{ subscription.total_amount }}</span>
              </div>
              <div class="info-item">
                <label>Billing Day:</label>
                <span>{{ subscription.billing_day }} of each month</span>
              </div>
              <div class="info-item">
                <label>Frequency:</label>
                <span>{{ subscription.frequency }}</span>
              </div>
              <div class="info-item">
                <label>Status:</label>
                <span class="status-badge" [class.active]="subscription.is_active">
                  {{ subscription.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="info-item">
                <label>Start Date:</label>
                <span>{{ subscription.start_date | date:'short' }}</span>
              </div>
              <div class="info-item" *ngIf="subscription.end_date">
                <label>End Date:</label>
                <span>{{ subscription.end_date | date:'short' }}</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h2>Participants ({{ subscription.participants?.length || 0 }})</h2>
            <div *ngIf="subscription.participants && subscription.participants.length > 0" class="participants-list">
              <div *ngFor="let participant of subscription.participants" class="participant-item">
                <div class="participant-info">
                  <div class="participant-name">{{ participant.user?.name || 'Unknown User' }}</div>
                  <div class="participant-email">{{ participant.user?.email }}</div>
                </div>
                <div class="participant-share">
                  <span class="share-type">{{ participant.share_type }}</span>
                  <span *ngIf="participant.share_value" class="share-value">
                    €{{ participant.share_value }}
                  </span>
                </div>
                <div class="participant-status">
                  <span class="status-badge" [class.active]="participant.is_active">
                    {{ participant.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
            <div *ngIf="!subscription.participants || subscription.participants.length === 0" class="empty-state">
              <p>No participants found.</p>
            </div>
          </div>
        </div>

        <!-- Add Participant Form -->
        <div *ngIf="showAddParticipantForm" class="add-participant-section">
          <app-add-participant 
            [subscriptionId]="subscription.id"
            (participantAdded)="onParticipantAdded($event)"
            (cancel)="showAddParticipantForm = false"
          ></app-add-participant>
        </div>
      </div>

      <div *ngIf="!(subscription$ | async)" class="loading">
        <p>Loading subscription details...</p>
      </div>
    </div>
  `,
  styles: [`
    .subscription-details-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .btn-back {
      background: #6c757d;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
    }

    .btn-back:hover {
      background: #5a6268;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    h1 {
      margin: 0;
      color: #333;
      flex: 1;
      text-align: center;
    }

    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .info-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .info-card h2 {
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 1.25rem;
    }

    .info-grid {
      display: grid;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
    }

    .info-item span {
      color: #333;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      background: #e0e0e0;
      color: #666;
    }

    .status-badge.active {
      background: #28a745;
      color: white;
    }

    .participants-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .participant-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #f8f9fa;
    }

    .participant-info {
      flex: 1;
    }

    .participant-name {
      font-weight: 500;
      color: #333;
    }

    .participant-email {
      font-size: 0.9rem;
      color: #666;
    }

    .participant-share {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 1rem;
    }

    .share-type {
      background: #007bff;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .share-value {
      font-weight: 500;
      color: #333;
    }

    .add-participant-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e0e0e0;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .info-section {
        grid-template-columns: 1fr;
      }
      
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      
      .participant-item {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }
      
      .participant-share {
        margin: 0;
        justify-content: center;
      }
    }
  `]
})
export class SubscriptionDetailsComponent implements OnInit {
  subscription$: Observable<Subscription | undefined>;
  showAddParticipantForm = false;
  subscriptionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.subscription$ = this.store.select(selectSubscriptions).pipe(
      map(subscriptions => {
        if (this.subscriptionId) {
          return subscriptions.find(sub => sub.id === this.subscriptionId);
        }
        return undefined;
      })
    );
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.subscriptionId = params['id'];
      if (this.subscriptionId) {
        this.store.dispatch(SubscriptionsActions.loadSubscription({ id: this.subscriptionId }));
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/subscriptions']);
  }

  onParticipantAdded(subscription: Subscription): void {
    this.showAddParticipantForm = false;
    // The subscription will be automatically updated in the store via the effect
  }
}
