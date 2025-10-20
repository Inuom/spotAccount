import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Payment, UserPaymentStats, SuggestedSchedule } from '../../models/payment.model';
import * as UserPaymentActions from './user-payment.actions';

export interface UserPaymentsState extends EntityState<Payment> {
  selectedPaymentId: string | null;
  loading: boolean;
  error: string | null;
  paymentStats: UserPaymentStats | null;
  statsLoading: boolean;
  statsError: string | null;
  suggestedSchedule: SuggestedSchedule | null;
  filter: string;
}

export const userPaymentsAdapter: EntityAdapter<Payment> = createEntityAdapter<Payment>({
  selectId: (payment: Payment) => payment.id,
  sortComparer: (a: Payment, b: Payment) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
});

export const initialState: UserPaymentsState = userPaymentsAdapter.getInitialState({
  selectedPaymentId: null,
  loading: false,
  error: null,
  paymentStats: null,
  statsLoading: false,
  statsError: null,
  suggestedSchedule: null,
  filter: 'all',
});

export const userPaymentsReducer = createReducer(
  initialState,

  // Load User Payments
  on(UserPaymentActions.loadUserPayments, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserPaymentActions.loadUserPaymentsSuccess, (state, { payments }) =>
    userPaymentsAdapter.setAll(payments, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(UserPaymentActions.loadUserPaymentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load User Payment Stats
  on(UserPaymentActions.loadUserPaymentStats, (state) => ({
    ...state,
    statsLoading: true,
    statsError: null,
  })),
  on(UserPaymentActions.loadUserPaymentStatsSuccess, (state, { stats }) => ({
    ...state,
    paymentStats: stats,
    statsLoading: false,
    statsError: null,
  })),
  on(UserPaymentActions.loadUserPaymentStatsFailure, (state, { error }) => ({
    ...state,
    statsLoading: false,
    statsError: error,
  })),

  // Load Payment History
  on(UserPaymentActions.loadUserPaymentHistory, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserPaymentActions.loadUserPaymentHistorySuccess, (state, { payments }) =>
    userPaymentsAdapter.setAll(payments, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(UserPaymentActions.loadUserPaymentHistoryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load Pending Payments
  on(UserPaymentActions.loadPendingUserPayments, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserPaymentActions.loadPendingUserPaymentsSuccess, (state, { payments }) =>
    userPaymentsAdapter.setAll(payments, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(UserPaymentActions.loadPendingUserPaymentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create User Payment
  on(UserPaymentActions.createUserPayment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserPaymentActions.createUserPaymentSuccess, (state, { payment }) =>
    userPaymentsAdapter.addOne(payment, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(UserPaymentActions.createUserPaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update User Payment
  on(UserPaymentActions.updateUserPayment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserPaymentActions.updateUserPaymentSuccess, (state, { payment }) =>
    userPaymentsAdapter.updateOne(
      { id: payment.id, changes: payment },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),
  on(UserPaymentActions.updateUserPaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Cancel User Payment
  on(UserPaymentActions.cancelUserPayment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserPaymentActions.cancelUserPaymentSuccess, (state, { payment }) =>
    userPaymentsAdapter.updateOne(
      { id: payment.id, changes: payment },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),
  on(UserPaymentActions.cancelUserPaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete User Payment
  on(UserPaymentActions.deleteUserPayment, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserPaymentActions.deleteUserPaymentSuccess, (state, { id }) =>
    userPaymentsAdapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(UserPaymentActions.deleteUserPaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Get Suggested Schedule
  on(UserPaymentActions.getSuggestedSchedule, (state) => ({
    ...state,
  })),
  on(UserPaymentActions.getSuggestedScheduleSuccess, (state, { schedule }) => ({
    ...state,
    suggestedSchedule: schedule,
  })),
  on(UserPaymentActions.getSuggestedScheduleFailure, (state) => ({
    ...state,
    suggestedSchedule: null,
  })),

  // Set Filter
  on(UserPaymentActions.setPaymentFilter, (state, { filter }) => ({
    ...state,
    filter,
  })),

  // Clear Errors
  on(UserPaymentActions.clearUserPaymentsError, (state) => ({
    ...state,
    error: null,
    statsError: null,
  }))
);

export const {
  selectIds: selectUserPaymentIds,
  selectEntities: selectUserPaymentEntities,
  selectAll: selectAllUserPayments,
  selectTotal: selectUserPaymentsTotal,
} = userPaymentsAdapter.getSelectors();
