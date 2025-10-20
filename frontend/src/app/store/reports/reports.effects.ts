import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ReportService } from '../../services/report.service';
import * as ReportsActions from './reports.actions';

@Injectable()
export class ReportsEffects {
  constructor(
    private actions$: Actions,
    private reportService: ReportService
  ) {}

  loadUserBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.loadUserBalance),
      switchMap(({ userId, asOfDate }) =>
        this.reportService.getUserBalance(userId, asOfDate).pipe(
          map((report) => ReportsActions.loadUserBalanceSuccess({ report })),
          catchError((error) => of(ReportsActions.loadUserBalanceFailure({ 
            error: error.message || 'Failed to load user balance' 
          })))
        )
      )
    )
  );

  loadSubscriptionBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.loadSubscriptionBalance),
      switchMap(({ subscriptionId, asOfDate }) =>
        this.reportService.getSubscriptionBalance(subscriptionId, asOfDate).pipe(
          map((report) => ReportsActions.loadSubscriptionBalanceSuccess({ report })),
          catchError((error) => of(ReportsActions.loadSubscriptionBalanceFailure({ 
            error: error.message || 'Failed to load subscription balance' 
          })))
        )
      )
    )
  );

  loadAllBalances$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.loadAllBalances),
      switchMap(({ asOfDate }) =>
        this.reportService.getAllBalances(asOfDate).pipe(
          map((report) => ReportsActions.loadAllBalancesSuccess({ report })),
          catchError((error) => of(ReportsActions.loadAllBalancesFailure({ 
            error: error.message || 'Failed to load all balances' 
          })))
        )
      )
    )
  );

  loadMyBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportsActions.loadMyBalance),
      switchMap(({ asOfDate }) =>
        this.reportService.getMyBalance(asOfDate).pipe(
          map((report) => {
            // Extract user balance from the report
            const balance = report.data as any;
            return ReportsActions.loadMyBalanceSuccess({ balance });
          }),
          catchError((error) => of(ReportsActions.loadMyBalanceFailure({ 
            error: error.message || 'Failed to load my balance' 
          })))
        )
      )
    )
  );
}

