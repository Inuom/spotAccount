import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Payment } from '../../models/payment.model';
import { PaymentsState, paymentsAdapter } from './payment.reducer';

const {
  selectIds,
  selectEntities,
  selectAll: selectAllPayments,
  selectTotal: selectPaymentsTotal,
} = paymentsAdapter.getSelectors();

export const selectPaymentsState = createFeatureSelector<PaymentsState>('payments');

export const selectAllPaymentsSelector = createSelector(
  selectPaymentsState,
  selectAllPayments
);

export const selectPaymentEntitiesSelector = createSelector(
  selectPaymentsState,
  selectEntities
);

export const selectPaymentIdsSelector = createSelector(
  selectPaymentsState,
  selectIds
);

export const selectPaymentsTotalSelector = createSelector(
  selectPaymentsState,
  selectPaymentsTotal
);

export const selectPaymentsLoading = createSelector(
  selectPaymentsState,
  (state: PaymentsState) => state.loading
);

export const selectPaymentsError = createSelector(
  selectPaymentsState,
  (state: PaymentsState) => state.error
);

export const selectSelectedPaymentId = createSelector(
  selectPaymentsState,
  (state: PaymentsState) => state.selectedPaymentId
);

export const selectSelectedPayment = createSelector(
  selectPaymentEntitiesSelector,
  selectSelectedPaymentId,
  (paymentEntities, selectedId) => selectedId ? paymentEntities[selectedId] : null
);

export const selectPaymentsByStatus = createSelector(
  selectAllPaymentsSelector,
  (payments: Payment[], props: { status: string }) =>
    payments.filter(payment => payment.status === props.status)
);

export const selectPendingPayments = createSelector(
  selectAllPaymentsSelector,
  (payments: Payment[]) => payments.filter(payment => payment.status === 'PENDING')
);

export const selectVerifiedPayments = createSelector(
  selectAllPaymentsSelector,
  (payments: Payment[]) => payments.filter(payment => payment.status === 'VERIFIED')
);

export const selectCancelledPayments = createSelector(
  selectAllPaymentsSelector,
  (payments: Payment[]) => payments.filter(payment => payment.status === 'CANCELLED')
);

export const selectPaymentsByUser = createSelector(
  selectAllPaymentsSelector,
  (payments: Payment[], props: { userId: string }) =>
    payments.filter(payment => payment.user_id === props.userId)
);

export const selectPaymentsByCharge = createSelector(
  selectAllPaymentsSelector,
  (payments: Payment[], props: { chargeId: string }) =>
    payments.filter(payment => payment.charge_id === props.chargeId)
);
