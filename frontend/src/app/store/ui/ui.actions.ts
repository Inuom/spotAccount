import { createAction, props } from '@ngrx/store';

export const setLoading = createAction(
  '[UI] Set Loading',
  props<{ loading: boolean }>()
);

export const setError = createAction(
  '[UI] Set Error',
  props<{ error: string }>()
);

export const setSuccess = createAction(
  '[UI] Set Success',
  props<{ message: string }>()
);

export const clearMessages = createAction('[UI] Clear Messages');

export const clearError = createAction('[UI] Clear Error');

