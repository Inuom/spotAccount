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
        this.authService.login(email, password).pipe(
          map((response) => AuthActions.loginSuccess({ user: response.user, token: response.token })),
          catchError((error) => of(AuthActions.loginFailure({ error: error.message })))
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
        this.router.navigate(['/dashboard']);
      }),
      map(() => UiActions.clearError())
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
      }),
      map(() => UiActions.clearError())
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
}
