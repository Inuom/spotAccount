import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import * as AuthActions from '../../../store/auth/auth.actions';
import * as UiActions from '../../../store/ui/ui.actions';
import { selectAuthLoading } from '../../../store/auth/auth.selectors';
import { selectError } from '../../../store/ui/ui.selectors';

@Component({
  selector: 'app-setup-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="setup-container">
      <div class="setup-card">
        <div class="header">
          <h1>Set Your Password</h1>
          <p class="subtitle">Complete your account setup</p>
        </div>
        
        <div *ngIf="errorMessage$ | async as error" class="error-message">
          {{ error }}
        </div>
        
        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <form [formGroup]="setupForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="password">New Password</label>
            <input 
              id="password"
              type="password" 
              formControlName="password" 
              placeholder="Enter your new password"
              class="form-control"
              [class.error]="setupForm.get('password')?.invalid && setupForm.get('password')?.touched">
            <div *ngIf="setupForm.get('password')?.invalid && setupForm.get('password')?.touched" class="field-error">
              <div *ngIf="setupForm.get('password')?.errors?.['required']">Password is required</div>
              <div *ngIf="setupForm.get('password')?.errors?.['minlength']">Password must be at least 8 characters</div>
              <div *ngIf="setupForm.get('password')?.errors?.['pattern']">
                Password must contain at least one uppercase letter, one lowercase letter, and one number
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              id="confirmPassword"
              type="password" 
              formControlName="confirmPassword" 
              placeholder="Confirm your new password"
              class="form-control"
              [class.error]="setupForm.get('confirmPassword')?.invalid && setupForm.get('confirmPassword')?.touched">
            <div *ngIf="setupForm.get('confirmPassword')?.invalid && setupForm.get('confirmPassword')?.touched" class="field-error">
              <div *ngIf="setupForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</div>
              <div *ngIf="setupForm.get('confirmPassword')?.errors?.['passwordMismatch']">Passwords do not match</div>
            </div>
          </div>
          
          <div class="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li>At least 8 characters long</li>
              <li>Contains at least one uppercase letter</li>
              <li>Contains at least one lowercase letter</li>
              <li>Contains at least one number</li>
            </ul>
          </div>
          
          <button 
            type="submit" 
            [disabled]="setupForm.invalid || (loading$ | async) || !token"
            class="btn-primary">
            {{ (loading$ | async) ? 'Setting Password...' : 'Set Password' }}
          </button>
        </form>
        
        <div *ngIf="!token" class="error-message">
          <strong>Invalid Link:</strong> No invitation token found in the URL. Please check your invitation link.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .setup-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 3rem;
      width: 100%;
      max-width: 500px;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
      font-weight: 600;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 1rem;
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
      padding: 0.75rem 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.error {
      border-color: #dc3545;
    }

    .field-error {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #dc3545;
    }

    .password-requirements {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .password-requirements h4 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1rem;
    }

    .password-requirements ul {
      margin: 0;
      padding-left: 1.25rem;
      color: #666;
      font-size: 0.9rem;
    }

    .password-requirements li {
      margin-bottom: 0.25rem;
    }

    .btn-primary {
      width: 100%;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a67d8;
    }

    .btn-primary:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
    }

    .error-message {
      background: #fed7d7;
      color: #c53030;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border: 1px solid #feb2b2;
    }

    .success-message {
      background: #c6f6d5;
      color: #2f855a;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border: 1px solid #9ae6b4;
    }

    @media (max-width: 640px) {
      .setup-container {
        padding: 1rem;
      }
      
      .setup-card {
        padding: 2rem;
      }
    }
  `]
})
export class SetupPasswordComponent implements OnInit {
  setupForm: FormGroup;
  loading$: Observable<boolean>;
  errorMessage$: Observable<string | null>;
  token: string | null = null;
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.setupForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.loading$ = this.store.select(selectAuthLoading);
    this.errorMessage$ = this.store.select(selectError);
  }

  ngOnInit(): void {
    // Get token from query parameters
    this.token = this.route.snapshot.queryParams['token'];
    
    if (!this.token) {
      console.error('No token found in URL');
      return;
    }

    // Check for success message from query params (redirected from effects)
    const message = this.route.snapshot.queryParams['message'];
    if (message) {
      this.successMessage = message;
      // Clear the query param after showing the message
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { token: this.token, message: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  onSubmit(): void {
    if (this.setupForm.valid && this.token) {
      // Clear any previous errors
      this.store.dispatch(UiActions.clearError());
      const { password } = this.setupForm.value;
      this.store.dispatch(AuthActions.setupPassword({ token: this.token, password }));
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
