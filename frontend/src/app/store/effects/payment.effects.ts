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
      switchMap(() =>
        this.paymentService.getPayments().pipe(
          map((payments) => PaymentActions.loadPaymentsSuccess({ payments })),
          catchError((error) => of(PaymentActions.loadPaymentsFailure({ error: error.message })))
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
}
