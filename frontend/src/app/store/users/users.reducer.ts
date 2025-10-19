import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { User } from '../../models/user.model';
import * as UsersActions from './users.actions';

export interface UsersState extends EntityState<User> {
  selectedUserId: string | null;
  loading: boolean;
  error: string | null;
  invitationLink: string | null;
  invitationExpiresAt: string | null;
  invitationUserId: string | null;
}

export const usersAdapter: EntityAdapter<User> = createEntityAdapter<User>({
  selectId: (user: User) => user.id,
  sortComparer: (a: User, b: User) => b.created_at.localeCompare(a.created_at),
});

export const initialState: UsersState = usersAdapter.getInitialState({
  selectedUserId: null,
  loading: false,
  error: null,
  invitationLink: null,
  invitationExpiresAt: null,
  invitationUserId: null,
});

export const usersReducer = createReducer(
  initialState,
  
  // Load Users
  on(UsersActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UsersActions.loadUsersSuccess, (state, { users }) =>
    usersAdapter.setAll(users, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(UsersActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Load User
  on(UsersActions.loadUser, (state, { id }) => ({
    ...state,
    selectedUserId: id,
    loading: true,
    error: null,
  })),
  on(UsersActions.loadUserSuccess, (state, { user }) =>
    usersAdapter.upsertOne(user, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(UsersActions.loadUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Create User
  on(UsersActions.createUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UsersActions.createUserSuccess, (state, { user }) =>
    usersAdapter.addOne(user, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(UsersActions.createUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Update User
  on(UsersActions.updateUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UsersActions.updateUserSuccess, (state, { user }) =>
    usersAdapter.updateOne(
      { id: user.id, changes: user },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),
  on(UsersActions.updateUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Delete User
  on(UsersActions.deleteUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UsersActions.deleteUserSuccess, (state, { id }) =>
    usersAdapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(UsersActions.deleteUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Create User with Invitation
  on(UsersActions.createUserWithInvitation, (state) => ({
    ...state,
    loading: true,
    error: null,
    invitationLink: null,
    invitationExpiresAt: null,
    invitationUserId: null,
  })),
  on(UsersActions.createUserWithInvitationSuccess, (state, { response }) =>
    usersAdapter.addOne(response.user, {
      ...state,
      loading: false,
      error: null,
      invitationLink: response.setup_link,
      invitationExpiresAt: response.expires_at,
      invitationUserId: response.user.id,
    })
  ),
  on(UsersActions.createUserWithInvitationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    invitationLink: null,
    invitationExpiresAt: null,
    invitationUserId: null,
  })),
  
  // Regenerate Invitation
  on(UsersActions.regenerateInvitation, (state) => ({
    ...state,
    loading: true,
    error: null,
    invitationLink: null,
    invitationExpiresAt: null,
  })),
  on(UsersActions.regenerateInvitationSuccess, (state, { userId, response }) => ({
    ...state,
    loading: false,
    error: null,
    invitationLink: response.setup_link,
    invitationExpiresAt: response.expires_at,
    invitationUserId: userId,
  })),
  on(UsersActions.regenerateInvitationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    invitationLink: null,
    invitationExpiresAt: null,
  })),
  
  // Clear Invitation Link
  on(UsersActions.clearInvitationLink, (state) => ({
    ...state,
    invitationLink: null,
    invitationExpiresAt: null,
    invitationUserId: null,
  })),
  
  // Clear Error
  on(UsersActions.clearUsersError, (state) => ({
    ...state,
    error: null,
  }))
);

export const {
  selectIds: selectUserIds,
  selectEntities: selectUserEntities,
  selectAll: selectAllUsers,
  selectTotal: selectUsersTotal,
} = usersAdapter.getSelectors();

