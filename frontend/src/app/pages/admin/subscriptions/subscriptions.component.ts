import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import { Subscription, CreateSubscriptionDto } from '../../../models/subscription.model';
import { User } from '../../../models/user.model';
import { Charge } from '../../../models/charge.model';
import * as SubscriptionsActions from '../../../store/subscriptions/subscriptions.actions';
import * as UsersActions from '../../../store/users/users.actions';
import { selectSubscriptions, selectSubscriptionsLoading } from '../../../store/subscriptions/subscriptions.selectors';
import { selectUsers } from '../../../store/users/users.selectors';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="subscriptions-container">
      <div class="header">
        <h1>Subscription Management</h1>
        <button (click)="toggleCreateForm()" class="btn-primary">
          {{ showCreateForm ? 'Cancel' : '+ Create Subscription' }}
        </button>
      </div>

      <!-- Create Form -->
      <div *ngIf="showCreateForm" class="create-form-section">
        <h2>Create New Subscription</h2>
        <form [formGroup]="createForm" (ngSubmit)="onSubmit()" class="create-form">
          <div class="form-row">
            <div class="form-group">
              <label for="title">Title *</label>
              <input
                id="title"
                type="text"
                formControlName="title"
                placeholder="e.g., Netflix Family Plan"
                class="form-control"
              />
              <span *ngIf="createForm.get('title')?.invalid && createForm.get('title')?.touched" class="error">
                Title is required
              </span>
            </div>

            <div class="form-group">
              <label for="total_amount">Total Amount (€) *</label>
              <input
                id="total_amount"
                type="number"
                formControlName="total_amount"
                placeholder="0.00"
                step="0.01"
                min="0"
                class="form-control"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="billing_day">Billing Day (1-31) *</label>
              <input
                id="billing_day"
                type="number"
                formControlName="billing_day"
                min="1"
                max="31"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="frequency">Frequency</label>
              <select id="frequency" formControlName="frequency" class="form-control">
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="start_date">Start Date</label>
              <input
                id="start_date"
                type="date"
                formControlName="start_date"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="end_date">End Date (Optional)</label>
              <input
                id="end_date"
                type="date"
                formControlName="end_date"
                class="form-control"
              />
            </div>
          </div>

          <!-- Participants Section -->
          <div class="participants-section">
            <h3>Participants *</h3>
            <div formArrayName="participants">
              <div *ngFor="let participant of participants.controls; let i = index" [formGroupName]="i" class="participant-row">
                <select formControlName="user_id" class="form-control">
                  <option value="">Select User</option>
                  <option *ngFor="let user of users$ | async" [value]="user.id">
                    {{ user.name }} ({{ user.email }})
                  </option>
                </select>

                <select formControlName="share_type" class="form-control">
                  <option value="EQUAL">Equal Share</option>
                  <option value="CUSTOM">Custom Share</option>
                </select>

                <input
                  *ngIf="participant.get('share_type')?.value === 'CUSTOM'"
                  type="number"
                  formControlName="share_value"
                  placeholder="Amount"
                  step="0.01"
                  min="0"
                  class="form-control"
                />

                <button type="button" (click)="removeParticipant(i)" class="btn-danger-sm">Remove</button>
              </div>
            </div>
            <button type="button" (click)="addParticipant()" class="btn-secondary">+ Add Participant</button>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="createForm.invalid || (subscriptionsLoading$ | async)" class="btn-primary">
              {{ (subscriptionsLoading$ | async) ? 'Creating...' : 'Create Subscription' }}
            </button>
            <button type="button" (click)="toggleCreateForm()" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Subscriptions List -->
      <div class="subscriptions-list-section">
        <h2>Existing Subscriptions</h2>
        
        <div *ngIf="subscriptionsLoading$ | async" class="loading">Loading subscriptions...</div>
        
        <div *ngIf="!(subscriptionsLoading$ | async)" class="subscriptions-grid">
          <div *ngFor="let subscription of subscriptions$ | async" class="subscription-card">
            <div class="card-header">
              <h3>{{ subscription.title }}</h3>
              <span class="status-badge" [class.active]="subscription.is_active">
                {{ subscription.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Total Amount:</span>
                <span class="value">€{{ subscription.total_amount }}</span>
              </div>
              <div class="info-row">
                <span class="label">Billing Day:</span>
                <span class="value">{{ subscription.billing_day }} of each month</span>
              </div>
              <div class="info-row">
                <span class="label">Frequency:</span>
                <span class="value">{{ subscription.frequency }}</span>
              </div>
              <div class="info-row">
                <span class="label">Participants:</span>
                <span class="value">{{ subscription.participants?.length || 0 }}</span>
              </div>
              <div class="info-row">
                <span class="label">Start Date:</span>
                <span class="value">{{ subscription.start_date | date:'short' }}</span>
              </div>
              <div *ngIf="subscription.end_date" class="info-row">
                <span class="label">End Date:</span>
                <span class="value">{{ subscription.end_date | date:'short' }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button (click)="viewSubscriptionDetails(subscription.id)" class="btn-secondary-sm">View Details</button>
              <button (click)="generateCharges(subscription.id)" class="btn-primary-sm">Generate Charges</button>
              <button
                (click)="toggleSubscriptionStatus(subscription.id, subscription.is_active)"
                class="btn-warning-sm"
              >
                {{ subscription.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>

          <div *ngIf="(subscriptions$ | async)?.length === 0" class="empty-state">
            <p>No subscriptions found.</p>
            <p>Create your first subscription using the button above.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subscriptions-container {
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

    h1 {
      margin: 0;
      color: #333;
    }

    h2 {
      margin: 0 0 1.5rem 0;
      color: #555;
      font-size: 1.5rem;
    }

    h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .btn-primary, .btn-secondary, .btn-danger-sm, .btn-warning-sm, .btn-secondary-sm, .btn-primary-sm {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
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

    .btn-danger-sm, .btn-warning-sm, .btn-secondary-sm, .btn-primary-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .btn-danger-sm {
      background: #dc3545;
      color: white;
    }

    .btn-danger-sm:hover {
      background: #c82333;
    }

    .btn-warning-sm {
      background: #ffc107;
      color: #333;
    }

    .btn-warning-sm:hover {
      background: #e0a800;
    }

    .btn-secondary-sm {
      background: #6c757d;
      color: white;
    }

    .btn-secondary-sm:hover {
      background: #5a6268;
    }

    .btn-primary-sm {
      background: #007bff;
      color: white;
    }

    .btn-primary-sm:hover {
      background: #0056b3;
    }

    .create-form-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .create-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .form-control {
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

    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .participants-section {
      border: 1px solid #e0e0e0;
      padding: 1.5rem;
      border-radius: 4px;
    }

    .participant-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      align-items: center;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .subscriptions-list-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .subscriptions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .subscription-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }

    .subscription-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
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

    .card-body {
      padding: 1.5rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .info-row .label {
      color: #666;
      font-weight: 500;
    }

    .info-row .value {
      color: #333;
    }

    .card-footer {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .empty-state p {
      margin: 0.5rem 0;
    }
  `]
})
export class SubscriptionsComponent implements OnInit {
  subscriptions$: Observable<Subscription[]>;
  users$: Observable<User[]>;
  subscriptionsLoading$: Observable<boolean>;
  showCreateForm = false;
  createForm: FormGroup;

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder
  ) {
    this.subscriptions$ = this.store.select(selectSubscriptions);
    this.users$ = this.store.select(selectUsers);
    this.subscriptionsLoading$ = this.store.select(selectSubscriptionsLoading);

    this.createForm = this.fb.group({
      title: ['', Validators.required],
      total_amount: [0, [Validators.required, Validators.min(0.01)]],
      billing_day: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      frequency: ['monthly'],
      start_date: [''],
      end_date: [''],
      participants: this.fb.array([], Validators.required)
    });
  }

  get participants(): FormArray {
    return this.createForm.get('participants') as FormArray;
  }

  ngOnInit(): void {
    this.store.dispatch(SubscriptionsActions.loadSubscriptions());
    this.store.dispatch(UsersActions.loadUsers({}));
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createForm.reset({
        title: '',
        total_amount: 0,
        billing_day: 1,
        frequency: 'monthly',
        start_date: '',
        end_date: ''
      });
      this.participants.clear();
    }
  }

  addParticipant(): void {
    const participantGroup = this.fb.group({
      user_id: ['', Validators.required],
      share_type: ['EQUAL', Validators.required],
      share_value: [null]
    });

    this.participants.push(participantGroup);
  }

  removeParticipant(index: number): void {
    this.participants.removeAt(index);
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      const formValue = this.createForm.value;
      const subscriptionDto: CreateSubscriptionDto = {
        title: formValue.title,
        total_amount: formValue.total_amount,
        billing_day: formValue.billing_day,
        frequency: formValue.frequency || 'monthly',
        start_date: formValue.start_date || undefined,
        end_date: formValue.end_date || undefined,
        participants: formValue.participants.map((p: any) => ({
          user_id: p.user_id,
          share_type: p.share_type,
          share_value: p.share_type === 'CUSTOM' ? p.share_value : undefined
        }))
      };

      this.store.dispatch(SubscriptionsActions.createSubscription({ subscription: subscriptionDto }));
      this.toggleCreateForm();
    }
  }

  viewSubscriptionDetails(id: string): void {
    this.store.dispatch(SubscriptionsActions.loadSubscription({ id }));
    // Navigate to details page or show modal
    console.log('View subscription details:', id);
  }

  generateCharges(subscriptionId: string): void {
    const until = new Date();
    until.setMonth(until.getMonth() + 1); // Generate charges for next month
    this.store.dispatch(SubscriptionsActions.generateCharges({
      subscriptionId,
      until: until.toISOString().split('T')[0]
    }));
  }

  toggleSubscriptionStatus(id: string, currentStatus: boolean): void {
    this.store.dispatch(SubscriptionsActions.updateSubscription({
      id,
      subscription: { is_active: !currentStatus }
    }));
  }
}

