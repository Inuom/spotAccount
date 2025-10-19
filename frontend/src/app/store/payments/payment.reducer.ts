import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Payment } from '../../models/payment.model';
import * as PaymentActions from './payment.actions';

export interface PaymentsState extends EntityState<Payment> {
  selectedPaymentId: string | null;
  loading: boolean;
  error: string | null;
}

export const paymentsAdapter: EntityAdapter<Payment> = createEntityAdapter<Payment>({
  selectId: (payment: Payment) => payment.id,
  sortComparer: (a: Payment, b: Payment) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
});

export const initialState: PaymentsState = paymentsAdapter.getInitialState({
  selectedPaymentId: null,
  loading: false,
  error: null,
});

export const paymentsReducer = createReducer(
  initialState,
  
  // Load Payments
  on(PaymentActions.loadPayments, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PaymentActions.loadPaymentsSuccess, (state, { payments }) =>
    paymentsAdapter.setAll(payments, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(PaymentActions.loadPaymentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Load Payment
  on(PaymentActions.loadPayment, (state, { id }) => ({
    ...state,
    selectedPaymentId: id,
    loading: true,
    error: null,
  })),
  on(PaymentActions.loadPaymentSuccess, (state, { payment }) =>
    paymentsAdapter.upsertOne(payment, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(PaymentActions.loadPaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load Pending Payments
  on(PaymentActions.loadPendingPayments, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PaymentActions.loadPendingPaymentsSuccess, (state, { payments }) =>
    paymentsAdapter.setAll(payments, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(PaymentActions.loadPendingPaymentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Create Payment
  on(PaymentActions.createPayment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PaymentActions.createPaymentSuccess, (state, { payment }) =>
    paymentsAdapter.addOne(payment, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(PaymentActions.createPaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Payment
  on(PaymentActions.updatePayment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PaymentActions.updatePaymentSuccess, (state, { payment }) =>
    paymentsAdapter.updateOne(
      { id: payment.id, changes: payment },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),
  on(PaymentActions.updatePaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Verify Payment
  on(PaymentActions.verifyPayment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PaymentActions.verifyPaymentSuccess, (state, { payment }) =>
    paymentsAdapter.updateOne(
      { id: payment.id, changes: payment },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),
  on(PaymentActions.verifyPaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Cancel Payment
  on(PaymentActions.cancelPayment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PaymentActions.cancelPaymentSuccess, (state, { payment }) =>
    paymentsAdapter.updateOne(
      { id: payment.id, changes: payment },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),
  on(PaymentActions.cancelPaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Delete Payment
  on(PaymentActions.deletePayment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PaymentActions.deletePaymentSuccess, (state, { id }) =>
    paymentsAdapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(PaymentActions.deletePaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Clear Error
  on(PaymentActions.clearPaymentsError, (state) => ({
    ...state,
    error: null,
  }))
);

export const {
  selectIds: selectPaymentIds,
  selectEntities: selectPaymentEntities,
  selectAll: selectAllPayments,
  selectTotal: selectPaymentsTotal,
} = paymentsAdapter.getSelectors();
