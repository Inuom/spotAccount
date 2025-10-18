import { ActionReducerMap } from '@ngrx/store';
import * as fromAuth from './auth/auth.reducer';
import * as fromUi from './ui/ui.reducer';

export interface AppState {
  auth: fromAuth.AuthState;
  ui: fromUi.UiState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
  ui: fromUi.uiReducer,
};

