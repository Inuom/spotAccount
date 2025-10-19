import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState, selectAllUsers, selectUserEntities } from './users.reducer';

export const selectUsersState = createFeatureSelector<UsersState>('users');

export const selectUsers = createSelector(
  selectUsersState,
  selectAllUsers
);

export const selectUserById = (id: string) => createSelector(
  selectUsersState,
  (state) => selectUserEntities(state)[id]
);

export const selectUsersLoading = createSelector(
  selectUsersState,
  (state) => state.loading
);

export const selectUsersError = createSelector(
  selectUsersState,
  (state) => state.error
);

export const selectSelectedUserId = createSelector(
  selectUsersState,
  (state) => state.selectedUserId
);

export const selectSelectedUser = createSelector(
  selectUsersState,
  selectSelectedUserId,
  (state, id) => id ? selectUserEntities(state)[id] : null
);

export const selectAdminUsers = createSelector(
  selectUsers,
  (users) => users.filter(user => user.role === 'ADMIN')
);

export const selectRegularUsers = createSelector(
  selectUsers,
  (users) => users.filter(user => user.role === 'USER')
);

export const selectActiveUsers = createSelector(
  selectUsers,
  (users) => users.filter(user => user.is_active)
);

