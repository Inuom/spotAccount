import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChargesState, selectAllCharges, selectChargeEntities } from './charges.reducer';

export const selectChargesState = createFeatureSelector<ChargesState>('charges');

export const selectCharges = createSelector(
  selectChargesState,
  selectAllCharges
);

export const selectChargeById = (id: string) => createSelector(
  selectChargesState,
  (state) => selectChargeEntities(state)[id]
);

export const selectChargesLoading = createSelector(
  selectChargesState,
  (state) => state.loading
);

export const selectChargesError = createSelector(
  selectChargesState,
  (state) => state.error
);

export const selectSelectedChargeId = createSelector(
  selectChargesState,
  (state) => state.selectedChargeId
);

export const selectSelectedCharge = createSelector(
  selectChargesState,
  selectSelectedChargeId,
  (state, id) => id ? selectChargeEntities(state)[id] : null
);

export const selectChargeShares = (chargeId: string) => createSelector(
  selectChargesState,
  (state) => state.chargeShares[chargeId] || []
);

export const selectPendingCharges = createSelector(
  selectCharges,
  (charges) => charges.filter(charge => charge.status === 'PENDING')
);

export const selectGeneratedCharges = createSelector(
  selectCharges,
  (charges) => charges.filter(charge => charge.status === 'GENERATED')
);

