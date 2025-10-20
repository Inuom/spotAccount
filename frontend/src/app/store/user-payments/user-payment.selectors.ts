import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Payment } from '../../models/payment.model';
import { UserPaymentsState, userPaymentsAdapter } from './user-payment.reducer';

const {
  selectIds,
  selectEntities,
  selectAll: selectAllUserPayments,
  selectTotal: selectUserPaymentsTotal,
} = userPaymentsAdapter.getSelectors();

export const selectUserPaymentsState = createFeatureSelector<UserPaymentsState>('userPayments');

export const selectAllUserPaymentsSelector = createSelector(
  selectUserPaymentsState,
  selectAllUserPayments
);

export const selectUserPaymentsLoading = createSelector(
  selectUserPaymentsState,
  (state) => state.loading
);

export const selectUserPaymentsError = createSelector(
  selectUserPaymentsState,
  (state) => state.error
);

export const selectUserPaymentStats = createSelector(
  selectUserPaymentsState,
  (state) => state.paymentStats
);

export const selectUserPaymentStatsLoading = createSelector(
  selectUserPaymentsState,
  (state) => state.statsLoading
);

export const selectUserPaymentStatsError = createSelector(
  selectUserPaymentsState,
  (state) => state.statsError
);

export const selectUserPaymentFilter = createSelector(
  selectUserPaymentsState,
  (state) => state.filter
);

export const selectFilteredUserPayments = createSelector(
  selectAllUserPaymentsSelector,
  selectUserPaymentFilter,
  (payments, filter) => {
    if (filter === 'all') {
      return payments;
    }
    return payments.filter(payment => payment.status === filter);
  }
);

export const selectPendingUserPayments = createSelector(
  selectAllUserPaymentsSelector,
  (payments) => payments.filter(payment => payment.status === 'PENDING')
);

export const selectVerifiedUserPayments = createSelector(
  selectAllUserPaymentsSelector,
  (payments) => payments.filter(payment => payment.status === 'VERIFIED')
);

export const selectCancelledUserPayments = createSelector(
  selectAllUserPaymentsSelector,
  (payments) => payments.filter(payment => payment.status === 'CANCELLED')
);

export const selectUserPaymentTotal = createSelector(
  selectAllUserPaymentsSelector,
  (payments) => payments.reduce((total, payment) => total + payment.amount, 0)
);

export const selectSuggestedSchedule = createSelector(
  selectUserPaymentsState,
  (state) => state.suggestedSchedule
);

export const selectUserPaymentById = (id: string) =>
  createSelector(
    selectUserPaymentsState,
    (state) => state.entities[id] || null
  );
