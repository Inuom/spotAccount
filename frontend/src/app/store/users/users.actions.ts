import { createAction, props } from '@ngrx/store';
import { User, CreateUserDto, UpdateUserDto } from '../../models/user.model';

// Load Users
export const loadUsers = createAction(
  '[Users] Load Users',
  props<{ role?: 'ADMIN' | 'USER'; is_active?: boolean }>()
);

export const loadUsersSuccess = createAction(
  '[Users] Load Users Success',
  props<{ users: User[] }>()
);

export const loadUsersFailure = createAction(
  '[Users] Load Users Failure',
  props<{ error: string }>()
);

// Load User by ID
export const loadUser = createAction(
  '[Users] Load User',
  props<{ id: string }>()
);

export const loadUserSuccess = createAction(
  '[Users] Load User Success',
  props<{ user: User }>()
);

export const loadUserFailure = createAction(
  '[Users] Load User Failure',
  props<{ error: string }>()
);

// Create User
export const createUser = createAction(
  '[Users] Create User',
  props<{ user: CreateUserDto }>()
);

export const createUserSuccess = createAction(
  '[Users] Create User Success',
  props<{ user: User }>()
);

export const createUserFailure = createAction(
  '[Users] Create User Failure',
  props<{ error: string }>()
);

// Update User
export const updateUser = createAction(
  '[Users] Update User',
  props<{ id: string; user: UpdateUserDto }>()
);

export const updateUserSuccess = createAction(
  '[Users] Update User Success',
  props<{ user: User }>()
);

export const updateUserFailure = createAction(
  '[Users] Update User Failure',
  props<{ error: string }>()
);

// Delete User
export const deleteUser = createAction(
  '[Users] Delete User',
  props<{ id: string }>()
);

export const deleteUserSuccess = createAction(
  '[Users] Delete User Success',
  props<{ id: string }>()
);

export const deleteUserFailure = createAction(
  '[Users] Delete User Failure',
  props<{ error: string }>()
);

// Clear Errors
export const clearUsersError = createAction('[Users] Clear Error');

