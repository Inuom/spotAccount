import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map, combineLatest, takeUntil, Subject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';

import { AppState } from '../../store';
import { User } from '../../models/user.model';
import { Subscription, AddParticipantDto } from '../../models/subscription.model';
import * as SubscriptionsActions from '../../store/subscriptions/subscriptions.actions';
import { selectSubscriptions } from '../../store/subscriptions/subscriptions.selectors';
import { selectUsers } from '../../store/users/users.selectors';

@Component({
  selector: 'app-add-participant',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="add-participant-form">
      <div class="form-header">
        <h3>Add Participant</h3>
        <button (click)="onCancel()" class="btn-cancel">×</button>
      </div>

      <form [formGroup]="addParticipantForm" (ngSubmit)="onSubmit()" class="form">
        <div class="form-group">
          <label for="user_id">Select User *</label>
          <select 
            id="user_id" 
            formControlName="user_id" 
            class="form-control"
            [class.error]="addParticipantForm.get('user_id')?.invalid && addParticipantForm.get('user_id')?.touched"
          >
            <option value="">Choose a user...</option>
            <option 
              *ngFor="let user of availableUsers$ | async" 
              [value]="user.id"
            >
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
          <span 
            *ngIf="addParticipantForm.get('user_id')?.invalid && addParticipantForm.get('user_id')?.touched" 
            class="error-message"
          >
            Please select a user
          </span>
          <span 
            *ngIf="userAlreadyParticipant" 
            class="error-message"
          >
            This user is already a participant in this subscription
          </span>
        </div>

        <div class="form-group">
          <label for="share_type">Share Type *</label>
          <select 
            id="share_type" 
            formControlName="share_type" 
            class="form-control"
            (change)="onShareTypeChange()"
          >
            <option value="EQUAL">Equal Share</option>
            <option value="CUSTOM">Custom Amount</option>
          </select>
        </div>

        <div class="form-group" *ngIf="addParticipantForm.get('share_type')?.value === 'CUSTOM'">
          <label for="share_value">Share Amount (€) *</label>
          <input 
            id="share_value" 
            type="number" 
            formControlName="share_value" 
            class="form-control"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            [max]="maxShareValue"
            [class.error]="addParticipantForm.get('share_value')?.invalid && addParticipantForm.get('share_value')?.touched"
          />
          <span 
            *ngIf="addParticipantForm.get('share_value')?.invalid && addParticipantForm.get('share_value')?.touched" 
            class="error-message"
          >
            Please enter a valid amount (max: €{{ maxShareValue }})
          </span>
        </div>

        <div class="form-actions">
          <button type="button" (click)="onCancel()" class="btn-secondary">Cancel</button>
          <button 
            type="submit" 
            [disabled]="addParticipantForm.invalid || userAlreadyParticipant || loading"
            class="btn-primary"
          >
            {{ loading ? 'Adding...' : 'Add Participant' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .add-participant-form {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .form-header h3 {
      margin: 0;
      color: #333;
    }

    .btn-cancel {
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

    .btn-cancel:hover {
      color: #333;
    }

    .form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
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
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-message {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .btn-primary, .btn-secondary {
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
    }

    .btn-secondary:hover {
      background: #5a6268;
    }
  `]
})
export class AddParticipantComponent implements OnInit, OnDestroy {
  @Input() subscriptionId!: string;
  @Output() participantAdded = new EventEmitter<Subscription>();
  @Output() cancel = new EventEmitter<void>();

  addParticipantForm: FormGroup;
  availableUsers$: Observable<User[]>;
  loading = false;
  userAlreadyParticipant = false;
  maxShareValue = 0;
  subscription$: Observable<Subscription | undefined>;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private actions$: Actions
  ) {
    this.addParticipantForm = this.fb.group({
      user_id: ['', Validators.required],
      share_type: ['EQUAL', Validators.required],
      share_value: [null]
    });

    this.subscription$ = this.store.select(selectSubscriptions).pipe(
      map(subscriptions => subscriptions.find(sub => sub.id === this.subscriptionId))
    );

    this.availableUsers$ = combineLatest([
      this.store.select(selectUsers),
      this.subscription$
    ]).pipe(
      map(([users, subscription]) => {
        if (!subscription?.participants) {
          return users;
        }
        
        const participantUserIds = subscription.participants.map(p => p.user_id);
        return users.filter((user: User) => !participantUserIds.includes(user.id));
      })
    );
  }

  ngOnInit(): void {
    // Get subscription details to set max share value
    this.subscription$.subscribe(subscription => {
      if (subscription) {
        this.maxShareValue = subscription.total_amount;
        
        // Set max validation on share_value
        const shareValueControl = this.addParticipantForm.get('share_value');
        if (shareValueControl) {
          shareValueControl.setValidators([
            Validators.required,
            Validators.min(0.01),
            Validators.max(this.maxShareValue)
          ]);
          shareValueControl.updateValueAndValidity();
        }
      }
    });

    // Watch for user selection to check if already participant
    this.addParticipantForm.get('user_id')?.valueChanges.subscribe(userId => {
      this.checkUserAlreadyParticipant(userId);
    });

    // Listen for add participant success/failure
    this.actions$.pipe(
      ofType(SubscriptionsActions.addParticipantSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading = false;
      this.subscription$.pipe(takeUntil(this.destroy$)).subscribe(sub => {
        if (sub) {
          this.participantAdded.emit(sub);
        }
      });
    });

    this.actions$.pipe(
      ofType(SubscriptionsActions.addParticipantFailure),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkUserAlreadyParticipant(userId: string): void {
    if (!userId) {
      this.userAlreadyParticipant = false;
      return;
    }

    this.subscription$.subscribe(subscription => {
      if (subscription?.participants) {
        this.userAlreadyParticipant = subscription.participants.some(
          p => p.user_id === userId && p.is_active
        );
        
        // Update form validity
        if (this.userAlreadyParticipant) {
          this.addParticipantForm.get('user_id')?.setErrors({ 'alreadyParticipant': true });
        }
      }
    });
  }

  onShareTypeChange(): void {
    const shareType = this.addParticipantForm.get('share_type')?.value;
    const shareValueControl = this.addParticipantForm.get('share_value');

    if (shareType === 'CUSTOM') {
      shareValueControl?.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.maxShareValue)
      ]);
    } else {
      shareValueControl?.clearValidators();
      shareValueControl?.setValue(null);
    }
    
    shareValueControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.addParticipantForm.valid && !this.userAlreadyParticipant) {
      this.loading = true;
      
      const formValue = this.addParticipantForm.value;
      const participant: AddParticipantDto = {
        user_id: formValue.user_id,
        share_type: formValue.share_type,
        share_value: formValue.share_type === 'CUSTOM' ? formValue.share_value : undefined
      };

      this.store.dispatch(SubscriptionsActions.addParticipant({
        subscriptionId: this.subscriptionId,
        participant
      }));
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
