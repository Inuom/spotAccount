import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import * as AuthActions from '../auth/auth.actions';
import * as UiActions from '../ui/ui.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login({ email, password }).pipe(
          map((response) => AuthActions.loginSuccess({ user: response.user, token: response.access_token })),
          catchError((error) => {
            console.error('Login error:', error);
            const errorMessage = error?.error?.message || error?.message || 'Login failed. Please check your credentials.';
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ user, token }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // Navigate based on user role
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      })
    ), { dispatch: false }
  );

  loginFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      })
    ), { dispatch: false }
  );

  checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      switchMap(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          return of(AuthActions.loginSuccess({ 
            user: JSON.parse(user), 
            token 
          }));
        } else {
          return of(AuthActions.logout());
        }
      })
    )
  );

  updatePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updatePassword),
      switchMap(({ currentPassword, newPassword }) =>
        this.authService.updatePassword({ currentPassword, newPassword }).pipe(
          map((response) => AuthActions.updatePasswordSuccess({ message: response.message })),
          catchError((error) => of(AuthActions.updatePasswordFailure({ error: error.message })))
        )
      )
    )
  );

  updatePasswordSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updatePasswordSuccess),
      tap(() => {
        // Show success message
        alert('Password updated successfully!');
      }),
      map(() => UiActions.clearError())
    )
  );

  updatePasswordFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updatePasswordFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  reAuthenticate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.reAuthenticate),
      switchMap(({ password }) =>
        this.authService.reAuthenticate(password).pipe(
          map(() => AuthActions.reAuthenticateSuccess()),
          catchError((error) => of(AuthActions.reAuthenticateFailure({ error: error.message })))
        )
      )
    )
  );

  reAuthenticateFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.reAuthenticateFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );
}
