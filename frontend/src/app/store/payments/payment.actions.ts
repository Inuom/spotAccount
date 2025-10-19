import { createAction, props } from '@ngrx/store';
import { Payment, CreatePaymentDto, UpdatePaymentDto, VerifyPaymentDto } from '../../models/payment.model';

// Load Payments
export const loadPayments = createAction(
  '[Payments] Load Payments',
  props<{ status?: string; user_id?: string; charge_id?: string }>()
);

export const loadPaymentsSuccess = createAction(
  '[Payments] Load Payments Success',
  props<{ payments: Payment[] }>()
);

export const loadPaymentsFailure = createAction(
  '[Payments] Load Payments Failure',
  props<{ error: string }>()
);

// Load Payment by ID
export const loadPayment = createAction(
  '[Payments] Load Payment',
  props<{ id: string }>()
);

export const loadPaymentSuccess = createAction(
  '[Payments] Load Payment Success',
  props<{ payment: Payment }>()
);

export const loadPaymentFailure = createAction(
  '[Payments] Load Payment Failure',
  props<{ error: string }>()
);

// Load Pending Payments
export const loadPendingPayments = createAction('[Payments] Load Pending Payments');

export const loadPendingPaymentsSuccess = createAction(
  '[Payments] Load Pending Payments Success',
  props<{ payments: Payment[] }>()
);

export const loadPendingPaymentsFailure = createAction(
  '[Payments] Load Pending Payments Failure',
  props<{ error: string }>()
);

// Create Payment
export const createPayment = createAction(
  '[Payments] Create Payment',
  props<{ payment: CreatePaymentDto }>()
);

export const createPaymentSuccess = createAction(
  '[Payments] Create Payment Success',
  props<{ payment: Payment }>()
);

export const createPaymentFailure = createAction(
  '[Payments] Create Payment Failure',
  props<{ error: string }>()
);

// Update Payment
export const updatePayment = createAction(
  '[Payments] Update Payment',
  props<{ id: string; payment: UpdatePaymentDto }>()
);

export const updatePaymentSuccess = createAction(
  '[Payments] Update Payment Success',
  props<{ payment: Payment }>()
);

export const updatePaymentFailure = createAction(
  '[Payments] Update Payment Failure',
  props<{ error: string }>()
);

// Verify Payment
export const verifyPayment = createAction(
  '[Payments] Verify Payment',
  props<{ id: string; verificationData: VerifyPaymentDto }>()
);

export const verifyPaymentSuccess = createAction(
  '[Payments] Verify Payment Success',
  props<{ payment: Payment }>()
);

export const verifyPaymentFailure = createAction(
  '[Payments] Verify Payment Failure',
  props<{ error: string }>()
);

// Cancel Payment
export const cancelPayment = createAction(
  '[Payments] Cancel Payment',
  props<{ id: string }>()
);

export const cancelPaymentSuccess = createAction(
  '[Payments] Cancel Payment Success',
  props<{ payment: Payment }>()
);

export const cancelPaymentFailure = createAction(
  '[Payments] Cancel Payment Failure',
  props<{ error: string }>()
);

// Delete Payment
export const deletePayment = createAction(
  '[Payments] Delete Payment',
  props<{ id: string }>()
);

export const deletePaymentSuccess = createAction(
  '[Payments] Delete Payment Success',
  props<{ id: string }>()
);

export const deletePaymentFailure = createAction(
  '[Payments] Delete Payment Failure',
  props<{ error: string }>()
);

// Clear Errors
export const clearPaymentsError = createAction('[Payments] Clear Error');
