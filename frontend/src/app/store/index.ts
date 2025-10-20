import { ActionReducerMap } from '@ngrx/store';
import * as fromAuth from './auth/auth.reducer';
import * as fromUi from './ui/ui.reducer';
import * as fromUsers from './users/users.reducer';
import * as fromSubscriptions from './subscriptions/subscriptions.reducer';
import * as fromCharges from './charges/charges.reducer';
import * as fromPayments from './payments/payment.reducer';
import * as fromUserPayments from './user-payments/user-payment.reducer';
import * as fromReports from './reports/reports.reducer';

export interface AppState {
  auth: fromAuth.AuthState;
  ui: fromUi.UiState;
  users: fromUsers.UsersState;
  subscriptions: fromSubscriptions.SubscriptionsState;
  charges: fromCharges.ChargesState;
  payments: fromPayments.PaymentsState;
  userPayments: fromUserPayments.UserPaymentsState;
  reports: fromReports.ReportsState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
  ui: fromUi.uiReducer,
  users: fromUsers.usersReducer,
  subscriptions: fromSubscriptions.subscriptionsReducer,
  charges: fromCharges.chargesReducer,
  payments: fromPayments.paymentsReducer,
  userPayments: fromUserPayments.userPaymentsReducer,
  reports: fromReports.reportsReducer,
};

