import { createAction, props } from '@ngrx/store';
import { Payment, CreateUserPaymentDto, UpdateUserPaymentDto, UserPaymentStats, SuggestedSchedule } from '../../models/payment.model';

// Load User Payments
export const loadUserPayments = createAction(
  '[User Payments] Load User Payments',
  props<{ status?: string }>()
);

export const loadUserPaymentsSuccess = createAction(
  '[User Payments] Load User Payments Success',
  props<{ payments: Payment[] }>()
);

export const loadUserPaymentsFailure = createAction(
  '[User Payments] Load User Payments Failure',
  props<{ error: string }>()
);

// Load User Payment Stats
export const loadUserPaymentStats = createAction('[User Payments] Load User Payment Stats');

export const loadUserPaymentStatsSuccess = createAction(
  '[User Payments] Load User Payment Stats Success',
  props<{ stats: UserPaymentStats }>()
);

export const loadUserPaymentStatsFailure = createAction(
  '[User Payments] Load User Payment Stats Failure',
  props<{ error: string }>()
);

// Load User Payment History
export const loadUserPaymentHistory = createAction('[User Payments] Load User Payment History');

export const loadUserPaymentHistorySuccess = createAction(
  '[User Payments] Load User Payment History Success',
  props<{ payments: Payment[] }>()
);

export const loadUserPaymentHistoryFailure = createAction(
  '[User Payments] Load User Payment History Failure',
  props<{ error: string }>()
);

// Load Pending User Payments
export const loadPendingUserPayments = createAction('[User Payments] Load Pending User Payments');

export const loadPendingUserPaymentsSuccess = createAction(
  '[User Payments] Load Pending User Payments Success',
  props<{ payments: Payment[] }>()
);

export const loadPendingUserPaymentsFailure = createAction(
  '[User Payments] Load Pending User Payments Failure',
  props<{ error: string }>()
);

// Get Suggested Schedule
export const getSuggestedSchedule = createAction(
  '[User Payments] Get Suggested Schedule',
  props<{ amount: number }>()
);

export const getSuggestedScheduleSuccess = createAction(
  '[User Payments] Get Suggested Schedule Success',
  props<{ schedule: SuggestedSchedule }>()
);

export const getSuggestedScheduleFailure = createAction(
  '[User Payments] Get Suggested Schedule Failure',
  props<{ error: string }>()
);

// Create User Payment
export const createUserPayment = createAction(
  '[User Payments] Create User Payment',
  props<{ payment: CreateUserPaymentDto }>()
);

export const createUserPaymentSuccess = createAction(
  '[User Payments] Create User Payment Success',
  props<{ payment: Payment }>()
);

export const createUserPaymentFailure = createAction(
  '[User Payments] Create User Payment Failure',
  props<{ error: string }>()
);

// Update User Payment
export const updateUserPayment = createAction(
  '[User Payments] Update User Payment',
  props<{ id: string; payment: UpdateUserPaymentDto }>()
);

export const updateUserPaymentSuccess = createAction(
  '[User Payments] Update User Payment Success',
  props<{ payment: Payment }>()
);

export const updateUserPaymentFailure = createAction(
  '[User Payments] Update User Payment Failure',
  props<{ error: string }>()
);

// Cancel User Payment
export const cancelUserPayment = createAction(
  '[User Payments] Cancel User Payment',
  props<{ id: string }>()
);

export const cancelUserPaymentSuccess = createAction(
  '[User Payments] Cancel User Payment Success',
  props<{ payment: Payment }>()
);

export const cancelUserPaymentFailure = createAction(
  '[User Payments] Cancel User Payment Failure',
  props<{ error: string }>()
);

// Delete User Payment
export const deleteUserPayment = createAction(
  '[User Payments] Delete User Payment',
  props<{ id: string }>()
);

export const deleteUserPaymentSuccess = createAction(
  '[User Payments] Delete User Payment Success',
  props<{ id: string }>()
);

export const deleteUserPaymentFailure = createAction(
  '[User Payments] Delete User Payment Failure',
  props<{ error: string }>()
);

// Set Filter
export const setPaymentFilter = createAction(
  '[User Payments] Set Payment Filter',
  props<{ filter: string }>()
);

// Clear Errors
export const clearUserPaymentsError = createAction('[User Payments] Clear Error');
