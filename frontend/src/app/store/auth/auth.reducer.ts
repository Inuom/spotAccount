import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { User } from '../../models/user.model';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  // Login actions
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Logout
  on(AuthActions.logout, () => initialState),
  
  // Update password actions
  on(AuthActions.updatePassword, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.updatePasswordSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(AuthActions.updatePasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Re-authenticate actions
  on(AuthActions.reAuthenticate, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.reAuthenticateSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(AuthActions.reAuthenticateFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Setup password actions
  on(AuthActions.setupPassword, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.setupPasswordSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(AuthActions.setupPasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Clear errors
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null,
  })),
);

