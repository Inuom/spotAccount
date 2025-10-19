import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../store';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-password-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="password-update">
      <div class="password-update-header">
        <h3>Change Password</h3>
        <p class="description">Update your password to keep your account secure</p>
      </div>

      <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()" class="password-form">
        <!-- Error Display -->
        <div *ngIf="authError$ | async as error" class="error-message">
          {{ error }}
        </div>

        <!-- Current Password -->
        <div class="form-group">
          <label for="currentPassword">Current Password *</label>
          <input
            id="currentPassword"
            type="password"
            formControlName="currentPassword"
            class="form-control"
            [class.error]="currentPassword?.invalid && currentPassword?.touched"
            placeholder="Enter your current password"
          />
          <span class="error-text" *ngIf="currentPassword?.errors?.['required'] && currentPassword?.touched">
            Current password is required
          </span>
        </div>

        <!-- New Password -->
        <div class="form-group">
          <label for="newPassword">New Password *</label>
          <input
            id="newPassword"
            type="password"
            formControlName="newPassword"
            class="form-control"
            [class.error]="newPassword?.invalid && newPassword?.touched"
            placeholder="Enter your new password"
          />
          <span class="error-text" *ngIf="newPassword?.errors?.['required'] && newPassword?.touched">
            New password is required
          </span>
          <span class="error-text" *ngIf="newPassword?.errors?.['minlength'] && newPassword?.touched">
            Password must be at least 8 characters long
          </span>
          <span class="error-text" *ngIf="newPassword?.errors?.['pattern'] && newPassword?.touched">
            Password must contain uppercase, lowercase, number, and special character
          </span>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label for="confirmPassword">Confirm New Password *</label>
          <input
            id="confirmPassword"
            type="password"
            formControlName="confirmPassword"
            class="form-control"
            [class.error]="confirmPassword?.invalid && confirmPassword?.touched"
            placeholder="Confirm your new password"
          />
          <span class="error-text" *ngIf="confirmPassword?.errors?.['required'] && confirmPassword?.touched">
            Please confirm your new password
          </span>
          <span class="error-text" *ngIf="passwordForm.errors?.['passwordMismatch'] && confirmPassword?.touched">
            Passwords do not match
          </span>
        </div>

        <!-- Password Requirements -->
        <div class="password-requirements">
          <h4>Password Requirements:</h4>
          <ul>
            <li [class.met]="hasMinLength">At least 8 characters</li>
            <li [class.met]="hasUppercase">One uppercase letter</li>
            <li [class.met]="hasLowercase">One lowercase letter</li>
            <li [class.met]="hasNumber">One number</li>
            <li [class.met]="hasSpecialChar">One special character (&#64;$!%*?&)</li>
          </ul>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button
            type="submit"
            [disabled]="passwordForm.invalid || (authLoading$ | async)"
            class="btn-primary">
            {{ (authLoading$ | async) ? 'Updating...' : 'Update Password' }}
          </button>
          <button
            type="button"
            (click)="onCancel()"
            class="btn-secondary"
            [disabled]="authLoading$ | async">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .password-update {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .password-update-header {
      margin-bottom: 2rem;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 1rem;
    }

    .password-update-header h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.5rem;
    }

    .description {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
    }

    .password-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #f5c6cb;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .error-text {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .password-requirements {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }

    .password-requirements h4 {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      color: #333;
    }

    .password-requirements ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .password-requirements li {
      padding: 0.25rem 0;
      color: #666;
      position: relative;
      padding-left: 1.5rem;
    }

    .password-requirements li::before {
      content: '✗';
      position: absolute;
      left: 0;
      color: #dc3545;
      font-weight: bold;
    }

    .password-requirements li.met {
      color: #28a745;
    }

    .password-requirements li.met::before {
      content: '✓';
      color: #28a745;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 1rem;
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

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn-secondary:disabled {
      background: #adb5bd;
      cursor: not-allowed;
    }
  `]
})
export class PasswordUpdateComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  passwordForm: FormGroup;
  authLoading$: Observable<boolean>;
  authError$: Observable<string | null>;

  // Password requirement indicators
  hasMinLength = false;
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSpecialChar = false;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>
  ) {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.authLoading$ = this.store.select(selectAuthLoading);
    this.authError$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    // Watch new password field for requirement indicators
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(value => {
      this.updatePasswordRequirements(value);
    });
  }

  get currentPassword() {
    return this.passwordForm.get('currentPassword');
  }

  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const newPassword = formGroup.get('newPassword');
    const confirmPassword = formGroup.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  updatePasswordRequirements(password: string): void {
    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[@$!%*?&]/.test(password);
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      
      this.store.dispatch(AuthActions.updatePassword({
        currentPassword,
        newPassword
      }));

      // Reset form after submission
      this.passwordForm.reset();
    }
  }

  onCancel(): void {
    this.passwordForm.reset();
    this.cancel.emit();
  }
}

