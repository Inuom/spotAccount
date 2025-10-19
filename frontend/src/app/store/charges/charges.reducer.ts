import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Charge, ChargeShare } from '../../models/charge.model';
import * as ChargesActions from './charges.actions';

export interface ChargesState extends EntityState<Charge> {
  selectedChargeId: string | null;
  chargeShares: { [chargeId: string]: ChargeShare[] };
  loading: boolean;
  error: string | null;
}

export const chargesAdapter: EntityAdapter<Charge> = createEntityAdapter<Charge>({
  selectId: (charge: Charge) => charge.id,
  sortComparer: (a: Charge, b: Charge) => b.period_start.localeCompare(a.period_start),
});

export const initialState: ChargesState = chargesAdapter.getInitialState({
  selectedChargeId: null,
  chargeShares: {},
  loading: false,
  error: null,
});

export const chargesReducer = createReducer(
  initialState,
  
  // Load Charges
  on(ChargesActions.loadCharges, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ChargesActions.loadChargesSuccess, (state, { charges }) =>
    chargesAdapter.setAll(charges, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(ChargesActions.loadChargesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Load Charge
  on(ChargesActions.loadCharge, (state, { id }) => ({
    ...state,
    selectedChargeId: id,
    loading: true,
    error: null,
  })),
  on(ChargesActions.loadChargeSuccess, (state, { charge }) =>
    chargesAdapter.upsertOne(charge, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(ChargesActions.loadChargeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Load Charge Shares
  on(ChargesActions.loadChargeShares, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ChargesActions.loadChargeSharesSuccess, (state, { chargeId, shares }) => ({
    ...state,
    chargeShares: {
      ...state.chargeShares,
      [chargeId]: shares,
    },
    loading: false,
    error: null,
  })),
  on(ChargesActions.loadChargeSharesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Create Charge
  on(ChargesActions.createCharge, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ChargesActions.createChargeSuccess, (state, { charge }) =>
    chargesAdapter.addOne(charge, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(ChargesActions.createChargeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Clear Error
  on(ChargesActions.clearChargesError, (state) => ({
    ...state,
    error: null,
  }))
);

export const {
  selectIds: selectChargeIds,
  selectEntities: selectChargeEntities,
  selectAll: selectAllCharges,
  selectTotal: selectChargesTotal,
} = chargesAdapter.getSelectors();

