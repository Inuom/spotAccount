import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { SubscriptionService } from '../../services/subscription.service';
import * as SubscriptionsActions from '../subscriptions/subscriptions.actions';
import * as UiActions from '../ui/ui.actions';

@Injectable()
export class SubscriptionEffects {
  constructor(
    private actions$: Actions,
    private subscriptionService: SubscriptionService
  ) {}

  loadSubscriptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.loadSubscriptions),
      switchMap(() =>
        this.subscriptionService.getSubscriptions().pipe(
          map((subscriptions) => SubscriptionsActions.loadSubscriptionsSuccess({ subscriptions })),
          catchError((error) => of(SubscriptionsActions.loadSubscriptionsFailure({ error: error.message || 'Failed to load subscriptions' })))
        )
      )
    )
  );

  loadMySubscriptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.loadMySubscriptions),
      switchMap(() =>
        this.subscriptionService.getMySubscriptions().pipe(
          map((subscriptions) => SubscriptionsActions.loadMySubscriptionsSuccess({ subscriptions })),
          catchError((error) => of(SubscriptionsActions.loadMySubscriptionsFailure({ error: error.message || 'Failed to load subscriptions' })))
        )
      )
    )
  );

  loadSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.loadSubscription),
      switchMap(({ id }) =>
        this.subscriptionService.getSubscriptionById(id).pipe(
          map((subscription) => SubscriptionsActions.loadSubscriptionSuccess({ subscription })),
          catchError((error) => of(SubscriptionsActions.loadSubscriptionFailure({ error: error.message || 'Failed to load subscription' })))
        )
      )
    )
  );

  createSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.createSubscription),
      switchMap(({ subscription }) =>
        this.subscriptionService.createSubscription(subscription).pipe(
          map((newSubscription) => SubscriptionsActions.createSubscriptionSuccess({ subscription: newSubscription })),
          catchError((error) => of(SubscriptionsActions.createSubscriptionFailure({ error: error.message || 'Failed to create subscription' })))
        )
      )
    )
  );

  updateSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.updateSubscription),
      switchMap(({ id, subscription }) =>
        this.subscriptionService.updateSubscription(id, subscription).pipe(
          map((updatedSubscription) => SubscriptionsActions.updateSubscriptionSuccess({ subscription: updatedSubscription })),
          catchError((error) => of(SubscriptionsActions.updateSubscriptionFailure({ error: error.message || 'Failed to update subscription' })))
        )
      )
    )
  );

  deleteSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.deleteSubscription),
      switchMap(({ id }) =>
        this.subscriptionService.deleteSubscription(id).pipe(
          map(() => SubscriptionsActions.deleteSubscriptionSuccess({ id })),
          catchError((error) => of(SubscriptionsActions.deleteSubscriptionFailure({ error: error.message || 'Failed to delete subscription' })))
        )
      )
    )
  );

  generateCharges$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.generateCharges),
      switchMap(({ subscriptionId, until }) =>
        this.subscriptionService.generateCharges(subscriptionId, until).pipe(
          map((charges) => SubscriptionsActions.generateChargesSuccess({ charges })),
          catchError((error) => of(SubscriptionsActions.generateChargesFailure({ error: error.message || 'Failed to generate charges' })))
        )
      )
    )
  );

  addParticipant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubscriptionsActions.addParticipant),
      switchMap(({ subscriptionId, participant }) =>
        this.subscriptionService.addParticipant(subscriptionId, participant).pipe(
          map((updatedSubscription) => SubscriptionsActions.addParticipantSuccess({ subscription: updatedSubscription })),
          catchError((error) => of(SubscriptionsActions.addParticipantFailure({ error: error.message || 'Failed to add participant' })))
        )
      )
    )
  );

  subscriptionsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        SubscriptionsActions.loadSubscriptionsFailure,
        SubscriptionsActions.loadMySubscriptionsFailure,
        SubscriptionsActions.loadSubscriptionFailure,
        SubscriptionsActions.createSubscriptionFailure,
        SubscriptionsActions.updateSubscriptionFailure,
        SubscriptionsActions.deleteSubscriptionFailure,
        SubscriptionsActions.generateChargesFailure,
        SubscriptionsActions.addParticipantFailure
      ),
      map(({ error }) => UiActions.setError({ error }))
    )
  );
}
