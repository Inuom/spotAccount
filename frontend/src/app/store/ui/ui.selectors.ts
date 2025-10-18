import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.reducer';

export const selectUiState = createFeatureSelector<UiState>('ui');

export const selectLoading = createSelector(
  selectUiState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectUiState,
  (state) => state.error
);

export const selectSuccessMessage = createSelector(
  selectUiState,
  (state) => state.successMessage
);

