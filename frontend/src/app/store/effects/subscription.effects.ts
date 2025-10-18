import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { SubscriptionService } from '../../services/subscription.service';
import * as SubscriptionActions from '../subscriptions/subscription.actions';
import * as UiActions from '../ui/ui.actions';

@Injectable()
export class SubscriptionEffects {
  constructor(
    private actions$: Actions,
    private subscriptionService: SubscriptionService
  ) {}

  loadSubscriptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionActions.loadSubscriptions),
      switchMap(() =>
        this.subscriptionService.getSubscriptions().pipe(
          map((subscriptions) => SubscriptionActions.loadSubscriptionsSuccess({ subscriptions })),
          catchError((error) => of(SubscriptionActions.loadSubscriptionsFailure({ error: error.message })))
        )
      )
    )
  );

  createSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionActions.createSubscription),
      switchMap(({ subscription }) =>
        this.subscriptionService.createSubscription(subscription).pipe(
          map((newSubscription) => SubscriptionActions.createSubscriptionSuccess({ subscription: newSubscription })),
          catchError((error) => of(SubscriptionActions.createSubscriptionFailure({ error: error.message })))
        )
      )
    )
  );

  updateSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionActions.updateSubscription),
      switchMap(({ id, subscription }) =>
        this.subscriptionService.updateSubscription(id, subscription).pipe(
          map((updatedSubscription) => SubscriptionActions.updateSubscriptionSuccess({ subscription: updatedSubscription })),
          catchError((error) => of(SubscriptionActions.updateSubscriptionFailure({ error: error.message })))
        )
      )
    )
  );

  deleteSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionActions.deleteSubscription),
      switchMap(({ id }) =>
        this.subscriptionService.deleteSubscription(id).pipe(
          map(() => SubscriptionActions.deleteSubscriptionSuccess({ id })),
          catchError((error) => of(SubscriptionActions.deleteSubscriptionFailure({ error: error.message })))
        )
      )
    )
  );

  loadSubscriptionsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionActions.loadSubscriptionsFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  createSubscriptionFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionActions.createSubscriptionFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  updateSubscriptionFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionActions.updateSubscriptionFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );

  deleteSubscriptionFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionActions.deleteSubscriptionFailure),
      map(({ error }) => UiActions.setError({ error }))
    )
  );
}
