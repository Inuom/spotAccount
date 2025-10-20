import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserPaymentService } from '../../services/user-payment.service';
import * as UserPaymentActions from '../user-payments/user-payment.actions';

@Injectable()
export class UserPaymentEffects {
  constructor(
    private actions$: Actions,
    private userPaymentService: UserPaymentService,
  ) {}

  loadUserPayments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserPaymentActions.loadUserPayments),
      switchMap(({ status }) =>
        this.userPaymentService.getMyPayments(status).pipe(
          map((payments) => UserPaymentActions.loadUserPaymentsSuccess({ payments })),
          catchError((error) => of(UserPaymentActions.loadUserPaymentsFailure({ error: error.message })))
        )
      )
    )
  );

  loadUserPaymentStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserPaymentActions.loadUserPaymentStats),
      switchMap(() =>
        this.userPaymentService.getPaymentStats().pipe(
          map((stats) => UserPaymentActions.loadUserPaymentStatsSuccess({ stats })),
          catchError((error) => of(UserPaymentActions.loadUserPaymentStatsFailure({ error: error.message })))
        )
      )
    )
  );

  loadUserPaymentHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserPaymentActions.loadUserPaymentHistory),
      switchMap(() =>
        this.userPaymentService.getPaymentHistory().pipe(
          map((payments) => UserPaymentActions.loadUserPaymentHistorySuccess({ payments })),
          catchError((error) => of(UserPaymentActions.loadUserPaymentHistoryFailure({ error: error.message })))
        )
      )
    )
  );

  loadPendingUserPayments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserPaymentActions.loadPendingUserPayments),
      switchMap(() =>
        this.userPaymentService.getPendingPayments().pipe(
          map((payments) => UserPaymentActions.loadPendingUserPaymentsSuccess({ payments })),
          catchError((error) => of(UserPaymentActions.loadPendingUserPaymentsFailure({ error: error.message })))
        )
      )
    )
  );

  createUserPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserPaymentActions.createUserPayment),
      switchMap(({ payment }) =>
        this.userPaymentService.createPayment(payment).pipe(
          map((newPayment) => UserPaymentActions.createUserPaymentSuccess({ payment: newPayment })),
          catchError((error) => of(UserPaymentActions.createUserPaymentFailure({ error: error.message })))
        )
      )
    )
  );

  updateUserPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserPaymentActions.updateUserPayment),
      switchMap(({ id, payment }) =>
        this.userPaymentService.updatePayment(id, payment).pipe(
          map((updatedPayment) => UserPaymentActions.updateUserPaymentSuccess({ payment: updatedPayment })),
          catchError((error) => of(UserPaymentActions.updateUserPaymentFailure({ error: error.message })))
        )
      )
    )
  );

  cancelUserPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserPaymentActions.cancelUserPayment),
      switchMap(({ id }) =>
        this.userPaymentService.cancelPayment(id).pipe(
          map((payment) => UserPaymentActions.cancelUserPaymentSuccess({ payment })),
          catchError((error) => of(UserPaymentActions.cancelUserPaymentFailure({ error: error.message })))
        )
      )
    )
  );

  deleteUserPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserPaymentActions.deleteUserPayment),
      switchMap(({ id }) =>
        this.userPaymentService.deletePayment(id).pipe(
          map(() => UserPaymentActions.deleteUserPaymentSuccess({ id })),
          catchError((error) => of(UserPaymentActions.deleteUserPaymentFailure({ error: error.message })))
        )
      )
    )
  );

  getSuggestedSchedule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserPaymentActions.getSuggestedSchedule),
      switchMap(({ amount }) =>
        this.userPaymentService.getSuggestedSchedule(amount).pipe(
          map((schedule) => UserPaymentActions.getSuggestedScheduleSuccess({ schedule })),
          catchError((error) => of(UserPaymentActions.getSuggestedScheduleFailure({ error: error.message })))
        )
      )
    )
  );
}
