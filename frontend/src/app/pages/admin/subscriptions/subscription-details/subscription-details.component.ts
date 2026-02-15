import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil } from 'rxjs/operators';

import { AppState } from '../../../../store';
import { Subscription } from '../../../../models/subscription.model';
import { Charge, CreateChargeDto } from '../../../../models/charge.model';
import * as SubscriptionsActions from '../../../../store/subscriptions/subscriptions.actions';
import * as ChargesActions from '../../../../store/charges/charges.actions';
import { selectSubscriptions, selectSubscriptionsLoading } from '../../../../store/subscriptions/subscriptions.selectors';
import { selectChargesBySubscriptionId, selectChargesLoading } from '../../../../store/charges/charges.selectors';
import { AddParticipantComponent } from '../../../../components/add-participant/add-participant.component';

@Component({
  selector: 'app-subscription-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, AddParticipantComponent],
  template: `
    <div class="subscription-details-container">
      <div class="header">
        <a routerLink="/admin/dashboard" class="btn-back">← Dashboard</a>
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

          <div class="info-card share-link-card">
            <h2>Share Balance Link</h2>
            @if (!subscription.share_token) {
              <p class="share-status disabled">Sharing is currently disabled.</p>
              <button 
                class="btn-primary" 
                (click)="onGenerateShareLink(subscription.id)"
                [disabled]="loading$ | async"
              >
                {{ (loading$ | async) ? 'Generating...' : 'Generate Share Link' }}
              </button>
            } @else {
              <p class="share-status active">Sharing is active.</p>
              <div class="share-url-row">
                <input 
                  type="text" 
                  readonly 
                  [value]="getShareableUrl(subscription)"
                  #shareUrlInput
                  class="share-url-input"
                />
                <button 
                  class="btn-copy" 
                  (click)="onCopyLink(subscription)"
                  [class.copied]="linkCopied"
                >
                  {{ linkCopied ? 'Copied!' : 'Copy Link' }}
                </button>
                <button 
                  class="btn-revoke" 
                  (click)="onRevokeLink(subscription.id)"
                  [disabled]="loading$ | async"
                >
                  Revoke Link
                </button>
              </div>
            }
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

          <div class="info-card charges-card">
            <div class="charges-card-header">
              <h2>Charges ({{ (charges$ | async)?.length || 0 }})</h2>
              <button
                *ngIf="subscription"
                (click)="openAddChargeForm(subscription)"
                class="btn-primary-sm"
              >
                + Add Charge
              </button>
            </div>
            <div *ngIf="chargesLoading$ | async" class="charges-loading">Loading charges...</div>
            <div *ngIf="!(chargesLoading$ | async) && (charges$ | async) as charges">
              <div *ngIf="charges.length > 0" class="charges-list">
                <div *ngFor="let charge of charges" class="charge-item">
                  <div class="charge-period">
                    {{ charge.period_start | date:'shortDate' }} – {{ charge.period_end | date:'shortDate' }}
                  </div>
                  <div class="charge-amount">€{{ charge.amount_total }}</div>
                  <div class="charge-meta">
                    <span class="status-badge" [class.generated]="charge.status === 'GENERATED'">{{ charge.status }}</span>
                    <span class="charge-shares">{{ charge.shares?.length || 0 }} shares</span>
                  </div>
                </div>
              </div>
              <div *ngIf="charges.length === 0" class="empty-state">
                <p>No charges generated yet.</p>
                <p class="empty-hint">Add a charge below or generate charges from the Subscriptions list.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Charge Form -->
        <div *ngIf="showAddChargeForm && subscription" class="add-charge-section">
          <div class="add-charge-form">
            <div class="form-header">
              <h3>Add Charge</h3>
              <button (click)="onCancelAddCharge()" class="btn-cancel">×</button>
            </div>
            <form [formGroup]="addChargeForm" (ngSubmit)="onSubmitAddCharge(subscription)" class="form">
              <div *ngIf="createChargeError" class="error-banner">{{ createChargeError }}</div>
              <div class="form-row">
                <div class="form-group">
                  <label for="period_start">Period Start *</label>
                  <input id="period_start" type="date" formControlName="period_start" class="form-control" />
                </div>
                <div class="form-group">
                  <label for="period_end">Period End *</label>
                  <input id="period_end" type="date" formControlName="period_end" class="form-control" />
                  <span *ngIf="addChargeForm.get('period_end')?.hasError('periodOrder')" class="error-message">
                    End date must be after start date
                  </span>
                </div>
              </div>
              <div class="form-group">
                <label for="amount_total">Amount (€) *</label>
                <input
                  id="amount_total"
                  type="number"
                  formControlName="amount_total"
                  class="form-control"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                />
              </div>
              <div class="form-group">
                <label for="status">Status</label>
                <select id="status" formControlName="status" class="form-control">
                  <option value="GENERATED">Generated</option>
                  <option value="PENDING">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="button" (click)="onCancelAddCharge()" class="btn-secondary">Cancel</button>
                <button
                  type="submit"
                  [disabled]="addChargeForm.invalid || (chargesLoading$ | async)"
                  class="btn-primary"
                >
                  {{ (chargesLoading$ | async) ? 'Creating...' : 'Add Charge' }}
                </button>
              </div>
            </form>
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

    .share-link-card .share-status {
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
    }
    .share-link-card .share-status.disabled {
      color: #666;
    }
    .share-link-card .share-status.active {
      color: #28a745;
      font-weight: 500;
    }
    .share-url-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .share-url-input {
      flex: 1;
      min-width: 200px;
      padding: 0.5rem;
      font-size: 0.9rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .btn-copy {
      background: #007bff;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-copy:hover { background: #0056b3; }
    .btn-copy.copied {
      background: #28a745;
    }
    .btn-revoke {
      background: #dc3545;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-revoke:hover { background: #c82333; }
    .btn-revoke:disabled { opacity: 0.6; cursor: not-allowed; }

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

    .empty-hint {
      font-size: 0.9rem;
      margin-top: 0.25rem;
      color: #999;
    }

    .charges-card {
      grid-column: 1 / -1;
    }

    .charges-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .charges-card-header h2 {
      margin: 0;
    }

    .btn-primary-sm {
      background: #007bff;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .btn-primary-sm:hover {
      background: #0056b3;
    }

    .add-charge-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e0e0e0;
    }

    .add-charge-form {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .add-charge-form .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .add-charge-form .form-header h3 {
      margin: 0;
      color: #333;
    }

    .add-charge-form .btn-cancel {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .add-charge-form .btn-cancel:hover {
      color: #333;
    }

    .add-charge-form .form {
      padding: 1.5rem;
    }

    .add-charge-form .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .add-charge-form .form-group {
      margin-bottom: 1.5rem;
    }

    .add-charge-form .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .add-charge-form .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    .add-charge-form .form-control:focus {
      outline: none;
      border-color: #007bff;
    }

    .add-charge-form .error-banner {
      background: #f8d7da;
      color: #721c24;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .add-charge-form .error-message {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .add-charge-form .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .add-charge-form .btn-primary, .add-charge-form .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .add-charge-form .btn-primary {
      background: #007bff;
      color: white;
    }

    .add-charge-form .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .add-charge-form .btn-primary:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .add-charge-form .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .add-charge-form .btn-secondary:hover {
      background: #5a6268;
    }

    .charges-loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .charges-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .charge-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #f8f9fa;
    }

    .charge-period {
      font-weight: 500;
      color: #333;
    }

    .charge-amount {
      font-weight: 600;
      color: #333;
    }

    .charge-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .charge-shares {
      font-size: 0.9rem;
      color: #666;
    }

    .status-badge.generated {
      background: #28a745;
      color: white;
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

      .add-charge-form .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SubscriptionDetailsComponent implements OnInit, OnDestroy {
  subscription$: Observable<Subscription | undefined>;
  loading$: Observable<boolean>;
  charges$: Observable<Charge[]>;
  chargesLoading$: Observable<boolean>;
  showAddParticipantForm = false;
  showAddChargeForm = false;
  addChargeForm: FormGroup;
  createChargeError: string | null = null;
  subscriptionId: string | null = null;
  linkCopied = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private actions$: Actions
  ) {
    this.addChargeForm = this.fb.group({
      period_start: ['', Validators.required],
      period_end: ['', Validators.required],
      amount_total: [0, [Validators.required, Validators.min(0.01)]],
      status: ['GENERATED'],
    });
    this.loading$ = this.store.select(selectSubscriptionsLoading);
    this.chargesLoading$ = this.store.select(selectChargesLoading);
    this.subscription$ = this.store.select(selectSubscriptions).pipe(
      map(subscriptions => {
        if (this.subscriptionId) {
          return subscriptions.find(sub => sub.id === this.subscriptionId);
        }
        return undefined;
      })
    );
    this.charges$ = this.route.params.pipe(
      switchMap(params => {
        const id = params['id'] || null;
        return this.store.select(selectChargesBySubscriptionId(id));
      })
    );
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.subscriptionId = params['id'];
      if (this.subscriptionId) {
        this.store.dispatch(SubscriptionsActions.loadSubscription({ id: this.subscriptionId }));
        this.store.dispatch(ChargesActions.loadCharges({ subscriptionId: this.subscriptionId }));
      }
    });

    this.actions$.pipe(
      ofType(ChargesActions.createChargeSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.showAddChargeForm = false;
      this.createChargeError = null;
      this.addChargeForm.reset();
      if (this.subscriptionId) {
        this.store.dispatch(ChargesActions.loadCharges({ subscriptionId: this.subscriptionId }));
      }
    });

    this.actions$.pipe(
      ofType(ChargesActions.createChargeFailure),
      takeUntil(this.destroy$)
    ).subscribe(({ error }) => {
      this.createChargeError = error;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAddChargeForm(subscription: Subscription): void {
    this.store
      .select(selectChargesBySubscriptionId(subscription.id))
      .pipe(take(1))
      .subscribe((charges) => {
        const day = Math.min(subscription.billing_day || 1, 28);
        let periodStart: Date;
        let periodEnd: Date;

        const lastCharge = charges.length > 0
          ? charges.reduce((latest, c) => {
              const end = new Date(c.period_end);
              return !latest || end > new Date(latest.period_end) ? c : latest;
            }, null as Charge | null)
          : null;

        if (lastCharge) {
          const lastEnd = new Date(lastCharge.period_end);
          periodStart = new Date(lastEnd);
          periodStart.setDate(periodStart.getDate() + 1);
          periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
        } else {
          const now = new Date();
          periodStart = new Date(now.getFullYear(), now.getMonth(), day);
          periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
        }

        this.addChargeForm.patchValue({
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          amount_total: subscription.total_amount,
          status: 'GENERATED',
        });
        this.createChargeError = null;
        this.showAddChargeForm = true;
      });
  }

  onSubmitAddCharge(subscription: Subscription): void {
    if (this.addChargeForm.invalid || !this.subscriptionId) return;

    const start = new Date(this.addChargeForm.get('period_start')?.value);
    const end = new Date(this.addChargeForm.get('period_end')?.value);
    if (end < start) {
      this.addChargeForm.get('period_end')?.setErrors({ periodOrder: true });
      return;
    }

    const dto: CreateChargeDto = {
      subscription_id: subscription.id,
      period_start: start.toISOString(),
      period_end: end.toISOString(),
      amount_total: Number(this.addChargeForm.get('amount_total')?.value),
      status: this.addChargeForm.get('status')?.value || 'GENERATED',
    };
    this.store.dispatch(ChargesActions.createCharge({ charge: dto }));
  }

  onCancelAddCharge(): void {
    this.showAddChargeForm = false;
    this.createChargeError = null;
    this.addChargeForm.reset();
  }

  goBack(): void {
    this.router.navigate(['/admin/subscriptions']);
  }

  onParticipantAdded(subscription: Subscription): void {
    this.showAddParticipantForm = false;
  }

  getShareableUrl(subscription: Subscription): string {
    if (!subscription?.share_token) return '';
    return `${window.location.origin}/public/subscription/${subscription.share_token}`;
  }

  onGenerateShareLink(subscriptionId: string): void {
    this.store.dispatch(SubscriptionsActions.generateShareToken({ subscriptionId }));
  }

  onCopyLink(subscription: Subscription): void {
    const url = this.getShareableUrl(subscription);
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.linkCopied = true;
      setTimeout(() => (this.linkCopied = false), 2000);
    });
  }

  onRevokeLink(subscriptionId: string): void {
    this.store.dispatch(SubscriptionsActions.revokeShareToken({ subscriptionId }));
  }
}
