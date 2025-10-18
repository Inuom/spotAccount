import { createReducer, on } from '@ngrx/store';
import * as UiActions from './ui.actions';

export interface UiState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export const initialState: UiState = {
  loading: false,
  error: null,
  successMessage: null,
};

export const uiReducer = createReducer(
  initialState,
  on(UiActions.setLoading, (state, { loading }) => ({
    ...state,
    loading,
  })),
  on(UiActions.setError, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(UiActions.setSuccess, (state, { message }) => ({
    ...state,
    successMessage: message,
    loading: false,
  })),
  on(UiActions.clearMessages, (state) => ({
    ...state,
    error: null,
    successMessage: null,
  })),
);

