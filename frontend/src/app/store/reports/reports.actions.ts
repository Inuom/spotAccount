import { createAction, props } from '@ngrx/store';
import { UserBalance, SubscriptionBalance, BalanceReport } from '../../models/report.model';

// Load User Balance
export const loadUserBalance = createAction(
  '[Reports] Load User Balance',
  props<{ userId: string; asOfDate?: string }>()
);

export const loadUserBalanceSuccess = createAction(
  '[Reports] Load User Balance Success',
  props<{ report: BalanceReport }>()
);

export const loadUserBalanceFailure = createAction(
  '[Reports] Load User Balance Failure',
  props<{ error: string }>()
);

// Load Subscription Balance
export const loadSubscriptionBalance = createAction(
  '[Reports] Load Subscription Balance',
  props<{ subscriptionId: string; asOfDate?: string }>()
);

export const loadSubscriptionBalanceSuccess = createAction(
  '[Reports] Load Subscription Balance Success',
  props<{ report: BalanceReport }>()
);

export const loadSubscriptionBalanceFailure = createAction(
  '[Reports] Load Subscription Balance Failure',
  props<{ error: string }>()
);

// Load All Balances
export const loadAllBalances = createAction(
  '[Reports] Load All Balances',
  props<{ asOfDate?: string }>()
);

export const loadAllBalancesSuccess = createAction(
  '[Reports] Load All Balances Success',
  props<{ report: BalanceReport }>()
);

export const loadAllBalancesFailure = createAction(
  '[Reports] Load All Balances Failure',
  props<{ error: string }>()
);

// Load My Balance
export const loadMyBalance = createAction(
  '[Reports] Load My Balance',
  props<{ asOfDate?: string }>()
);

export const loadMyBalanceSuccess = createAction(
  '[Reports] Load My Balance Success',
  props<{ balance: UserBalance }>()
);

export const loadMyBalanceFailure = createAction(
  '[Reports] Load My Balance Failure',
  props<{ error: string }>()
);

// Clear Reports
export const clearReports = createAction('[Reports] Clear Reports');

// Set As Of Date
export const setAsOfDate = createAction(
  '[Reports] Set As Of Date',
  props<{ asOfDate: Date }>()
);

