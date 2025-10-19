import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { UserService } from '../../services/user.service';
import * as UsersActions from '../users/users.actions';
import * as UiActions from '../ui/ui.actions';

@Injectable()
export class UsersEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUsers),
      switchMap(({ role, is_active }) =>
        this.userService.getUsers(role, is_active).pipe(
          map((users) => UsersActions.loadUsersSuccess({ users })),
          catchError((error) => of(UsersActions.loadUsersFailure({ error: error.message || 'Failed to load users' })))
        )
      )
    )
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUser),
      switchMap(({ id }) =>
        this.userService.getUserById(id).pipe(
          map((user) => UsersActions.loadUserSuccess({ user })),
          catchError((error) => of(UsersActions.loadUserFailure({ error: error.message || 'Failed to load user' })))
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.createUser),
      switchMap(({ user }) =>
        this.userService.createUser(user).pipe(
          map((createdUser) => UsersActions.createUserSuccess({ user: createdUser })),
          catchError((error) => of(UsersActions.createUserFailure({ error: error.message || 'Failed to create user' })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.updateUser),
      switchMap(({ id, user }) =>
        this.userService.updateUser(id, user).pipe(
          map((updatedUser) => UsersActions.updateUserSuccess({ user: updatedUser })),
          catchError((error) => of(UsersActions.updateUserFailure({ error: error.message || 'Failed to update user' })))
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.deleteUser),
      switchMap(({ id }) =>
        this.userService.deleteUser(id).pipe(
          map(() => UsersActions.deleteUserSuccess({ id })),
          catchError((error) => of(UsersActions.deleteUserFailure({ error: error.message || 'Failed to delete user' })))
        )
      )
    )
  );

  usersSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UsersActions.createUserSuccess,
        UsersActions.updateUserSuccess,
        UsersActions.deleteUserSuccess
      ),
      map(() => UiActions.clearError())
    )
  );

  usersFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UsersActions.loadUsersFailure,
        UsersActions.loadUserFailure,
        UsersActions.createUserFailure,
        UsersActions.updateUserFailure,
        UsersActions.deleteUserFailure
      ),
      map(({ error }) => UiActions.setError({ error }))
    )
  );
}

