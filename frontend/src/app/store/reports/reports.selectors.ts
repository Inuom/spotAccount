import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReportsState } from './reports.reducer';

export const selectReportsState = createFeatureSelector<ReportsState>('reports');

export const selectCurrentReport = createSelector(
  selectReportsState,
  (state) => state.currentReport
);

export const selectMyBalance = createSelector(
  selectReportsState,
  (state) => state.myBalance
);

export const selectAsOfDate = createSelector(
  selectReportsState,
  (state) => state.asOfDate
);

export const selectReportsLoading = createSelector(
  selectReportsState,
  (state) => state.loading
);

export const selectReportsError = createSelector(
  selectReportsState,
  (state) => state.error
);

export const selectUserBalance = createSelector(
  selectCurrentReport,
  (report) => {
    if (report && report.report_type === 'user_balance') {
      return report.data;
    }
    return null;
  }
);

export const selectSubscriptionBalance = createSelector(
  selectCurrentReport,
  (report) => {
    if (report && report.report_type === 'subscription_balance') {
      return report.data;
    }
    return null;
  }
);

export const selectAllBalances = createSelector(
  selectCurrentReport,
  (report) => {
    if (report && report.report_type === 'all_balances') {
      return report.data;
    }
    return null;
  }
);

