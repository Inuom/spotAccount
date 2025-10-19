// frontend/src/app/pages/user/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import * as AuthActions from '../../../store/auth/auth.actions';
import * as UiActions from '../../../store/ui/ui.actions';
import { selectAuthLoading } from '../../../store/auth/auth.selectors';
import { selectError } from '../../../store/ui/ui.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <h1>Connexion</h1>
      
      <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
        <div *ngIf="authError$ | async as error" class="error-message">
          {{ error }}
        </div>
        
        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            type="email" 
            formControlName="email" 
            placeholder="admin@example.com"
            class="form-control">
        </div>
        
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input 
            id="password"
            type="password" 
            formControlName="password" 
            placeholder="0000"
            class="form-control">
        </div>
        
        <button 
          type="submit" 
          [disabled]="loginForm.invalid || (authLoading$ | async)"
          class="btn-primary">
          {{ (authLoading$ | async) ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
    }
    .error-message {
      color: red;
      margin-bottom: 1rem;
    }
    .success-message {
      color: green;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
    }
    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  authLoading$: Observable<boolean>;
  authError$: Observable<string | null>;
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@example.com', [Validators.required, Validators.email]],
      password: ['0000', [Validators.required]]
    });
    
    this.authLoading$ = this.store.select(selectAuthLoading);
    this.authError$ = this.store.select(selectError);
  }

  ngOnInit() {
    // Check for success message from query params
    const message = this.route.snapshot.queryParams['message'];
    if (message) {
      this.successMessage = message;
      // Clear the query param after displaying the message
      setTimeout(() => {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { message: null },
          queryParamsHandling: 'merge'
        });
        this.successMessage = '';
      }, 5000);
    }

    // Rediriger si déjà connecté
    this.store.select(state => state.auth.user).subscribe(user => {
      if (user) {
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      // Clear any previous errors
      this.store.dispatch(UiActions.clearError());
      const { email, password } = this.loginForm.value;
      this.store.dispatch(AuthActions.login({ email, password }));
    }
  }
}