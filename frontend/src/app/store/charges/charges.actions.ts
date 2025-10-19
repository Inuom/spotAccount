import { createAction, props } from '@ngrx/store';
import { Charge, ChargeShare, CreateChargeDto } from '../../models/charge.model';

// Load Charges
export const loadCharges = createAction(
  '[Charges] Load Charges',
  props<{ subscriptionId?: string; date?: string }>()
);

export const loadChargesSuccess = createAction(
  '[Charges] Load Charges Success',
  props<{ charges: Charge[] }>()
);

export const loadChargesFailure = createAction(
  '[Charges] Load Charges Failure',
  props<{ error: string }>()
);

// Load Charge by ID
export const loadCharge = createAction(
  '[Charges] Load Charge',
  props<{ id: string }>()
);

export const loadChargeSuccess = createAction(
  '[Charges] Load Charge Success',
  props<{ charge: Charge }>()
);

export const loadChargeFailure = createAction(
  '[Charges] Load Charge Failure',
  props<{ error: string }>()
);

// Load Charge Shares
export const loadChargeShares = createAction(
  '[Charges] Load Charge Shares',
  props<{ chargeId: string }>()
);

export const loadChargeSharesSuccess = createAction(
  '[Charges] Load Charge Shares Success',
  props<{ chargeId: string; shares: ChargeShare[] }>()
);

export const loadChargeSharesFailure = createAction(
  '[Charges] Load Charge Shares Failure',
  props<{ error: string }>()
);

// Create Charge
export const createCharge = createAction(
  '[Charges] Create Charge',
  props<{ charge: CreateChargeDto }>()
);

export const createChargeSuccess = createAction(
  '[Charges] Create Charge Success',
  props<{ charge: Charge }>()
);

export const createChargeFailure = createAction(
  '[Charges] Create Charge Failure',
  props<{ error: string }>()
);

// Clear Errors
export const clearChargesError = createAction('[Charges] Clear Error');

