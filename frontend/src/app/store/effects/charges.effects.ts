import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ChargeService } from '../../services/charge.service';
import * as ChargesActions from '../charges/charges.actions';
import * as UiActions from '../ui/ui.actions';

@Injectable()
export class ChargesEffects {
  constructor(
    private actions$: Actions,
    private chargeService: ChargeService
  ) {}

  loadCharges$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChargesActions.loadCharges),
      switchMap(({ subscriptionId, date }) =>
        this.chargeService.getCharges(subscriptionId, date).pipe(
          map((charges) => ChargesActions.loadChargesSuccess({ charges })),
          catchError((error) => of(ChargesActions.loadChargesFailure({ error: error.message || 'Failed to load charges' })))
        )
      )
    )
  );

  loadCharge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChargesActions.loadCharge),
      switchMap(({ id }) =>
        this.chargeService.getChargeById(id).pipe(
          map((charge) => ChargesActions.loadChargeSuccess({ charge })),
          catchError((error) => of(ChargesActions.loadChargeFailure({ error: error.message || 'Failed to load charge' })))
        )
      )
    )
  );

  loadChargeShares$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChargesActions.loadChargeShares),
      switchMap(({ chargeId }) =>
        this.chargeService.getChargeShares(chargeId).pipe(
          map((shares) => ChargesActions.loadChargeSharesSuccess({ chargeId, shares })),
          catchError((error) => of(ChargesActions.loadChargeSharesFailure({ error: error.message || 'Failed to load charge shares' })))
        )
      )
    )
  );

  createCharge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChargesActions.createCharge),
      switchMap(({ charge }) =>
        this.chargeService.createCharge(charge).pipe(
          map((createdCharge) => ChargesActions.createChargeSuccess({ charge: createdCharge })),
          catchError((error) => of(ChargesActions.createChargeFailure({ error: error.message || 'Failed to create charge' })))
        )
      )
    )
  );

  chargesFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ChargesActions.loadChargesFailure,
        ChargesActions.loadChargeFailure,
        ChargesActions.loadChargeSharesFailure,
        ChargesActions.createChargeFailure
      ),
      map(({ error }) => UiActions.setError({ error }))
    )
  );
}

