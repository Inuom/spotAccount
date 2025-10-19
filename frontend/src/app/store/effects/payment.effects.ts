import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { PaymentService } from '../../services/payment.service';
import * as PaymentActions from '../payments/payment.actions';
import * as UiActions from '../ui/ui.actions';

@Injectable()
export class PaymentEffects {
  constructor(
    private actions$: Actions,
    private paymentService: PaymentService
  ) {}

  loadPayments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.loadPayments),
      switchMap(({ status, user_id, charge_id }) =>
        this.paymentService.getPayments({ status, user_id, charge_id }).pipe(
          map((payments) => PaymentActions.loadPaymentsSuccess({ payments })),
          catchError((error) => of(PaymentActions.loadPaymentsFailure({ error: error.message })))
        )
      )
    )
  );

  loadPendingPayments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.loadPendingPayments),
      switchMap(() =>
        this.paymentService.getPendingPayments().pipe(
          map((payments) => PaymentActions.loadPendingPaymentsSuccess({ payments })),
          catchError((error) => of(PaymentActions.loadPendingPaymentsFailure({ error: error.message })))
        )
      )
    )
  );

  loadPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.loadPayment),
      switchMap(({ id }) =>
        this.paymentService.getPayment(id).pipe(
          map((payment) => PaymentActions.loadPaymentSuccess({ payment })),
          catchError((error) => of(PaymentActions.loadPaymentFailure({ error: error.message })))
        )
      )
    )
  );

  createPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.createPayment),
      switchMap(({ payment }) =>
        this.paymentService.createPayment(payment).pipe(
          map((newPayment) => PaymentActions.createPaymentSuccess({ payment: newPayment })),
          catchError((error) => of(PaymentActions.createPaymentFailure({ error: error.message })))
        )
      )
    )
  );

  updatePayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.updatePayment),
      switchMap(({ id, payment }) =>
        this.paymentService.updatePayment(id, payment).pipe(
          map((updatedPayment) => PaymentActions.updatePaymentSuccess({ payment: updatedPayment })),
          catchError((error) => of(PaymentActions.updatePaymentFailure({ error: error.message })))
        )
      )
    )
  );

  verifyPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.verifyPayment),
      switchMap(({ id, verificationData }) =>
        this.paymentService.verifyPayment(id, verificationData).pipe(
          map((verifiedPayment) => PaymentActions.verifyPaymentSuccess({ payment: verifiedPayment })),
          catchError((error) => of(PaymentActions.verifyPaymentFailure({ error: error.message })))
        )
      )
    )
  );

  deletePayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.deletePayment),
      switchMap(({ id }) =>
        this.paymentService.deletePayment(id).pipe(
          map(() => PaymentActions.deletePaymentSuccess({ id })),
          catchError((error) => of(PaymentActions.deletePaymentFailure({ error: error.message })))
        )
      )
    )
  );

  loadPaymentsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.loadPaymentsFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  createPaymentFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.createPaymentFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  updatePaymentFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.updatePaymentFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  verifyPaymentFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.verifyPaymentFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  deletePaymentFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.deletePaymentFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  cancelPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.cancelPayment),
      switchMap(({ id }) =>
        this.paymentService.cancelPayment(id).pipe(
          map((payment) => PaymentActions.cancelPaymentSuccess({ payment })),
          catchError((error) => of(PaymentActions.cancelPaymentFailure({ error: error.message })))
        )
      )
    )
  );

  cancelPaymentFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.cancelPaymentFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  loadPendingPaymentsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.loadPendingPaymentsFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  loadPaymentFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PaymentActions.loadPaymentFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );
}
