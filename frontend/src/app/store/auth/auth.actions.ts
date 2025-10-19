import { createAction, props } from '@ngrx/store';

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: { id: string; email: string; role: string }; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');

export const checkAuth = createAction('[Auth] Check Auth');

// Password Update Actions
export const updatePassword = createAction(
  '[Auth] Update Password',
  props<{ currentPassword: string; newPassword: string }>()
);

export const updatePasswordSuccess = createAction(
  '[Auth] Update Password Success',
  props<{ message: string }>()
);

export const updatePasswordFailure = createAction(
  '[Auth] Update Password Failure',
  props<{ error: string }>()
);

// Re-authenticate Action
export const reAuthenticate = createAction(
  '[Auth] Re-Authenticate',
  props<{ password: string }>()
);

export const reAuthenticateSuccess = createAction(
  '[Auth] Re-Authenticate Success'
);

export const reAuthenticateFailure = createAction(
  '[Auth] Re-Authenticate Failure',
  props<{ error: string }>()
);

// Clear Errors
export const clearAuthError = createAction('[Auth] Clear Error');

