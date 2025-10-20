import { createReducer, on } from '@ngrx/store';
import * as ReportsActions from './reports.actions';
import { UserBalance, SubscriptionBalance, BalanceReport } from '../../models/report.model';

export interface ReportsState {
  currentReport: BalanceReport | null;
  myBalance: UserBalance | null;
  asOfDate: Date | null;
  loading: boolean;
  error: string | null;
}

export const initialState: ReportsState = {
  currentReport: null,
  myBalance: null,
  asOfDate: null,
  loading: false,
  error: null,
};

export const reportsReducer = createReducer(
  initialState,
  
  // Load User Balance
  on(ReportsActions.loadUserBalance, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ReportsActions.loadUserBalanceSuccess, (state, { report }) => ({
    ...state,
    currentReport: report,
    loading: false,
    error: null,
  })),
  on(ReportsActions.loadUserBalanceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Load Subscription Balance
  on(ReportsActions.loadSubscriptionBalance, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ReportsActions.loadSubscriptionBalanceSuccess, (state, { report }) => ({
    ...state,
    currentReport: report,
    loading: false,
    error: null,
  })),
  on(ReportsActions.loadSubscriptionBalanceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Load All Balances
  on(ReportsActions.loadAllBalances, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ReportsActions.loadAllBalancesSuccess, (state, { report }) => ({
    ...state,
    currentReport: report,
    loading: false,
    error: null,
  })),
  on(ReportsActions.loadAllBalancesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Load My Balance
  on(ReportsActions.loadMyBalance, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ReportsActions.loadMyBalanceSuccess, (state, { balance }) => ({
    ...state,
    myBalance: balance,
    loading: false,
    error: null,
  })),
  on(ReportsActions.loadMyBalanceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Clear Reports
  on(ReportsActions.clearReports, () => initialState),
  
  // Set As Of Date
  on(ReportsActions.setAsOfDate, (state, { asOfDate }) => ({
    ...state,
    asOfDate,
  })),
);

