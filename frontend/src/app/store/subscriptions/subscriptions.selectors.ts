import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SubscriptionsState, selectAllSubscriptions, selectSubscriptionEntities } from './subscriptions.reducer';

export const selectSubscriptionsState = createFeatureSelector<SubscriptionsState>('subscriptions');

export const selectSubscriptions = createSelector(
  selectSubscriptionsState,
  selectAllSubscriptions
);

export const selectSubscriptionById = (id: string) => createSelector(
  selectSubscriptionsState,
  (state) => selectSubscriptionEntities(state)[id]
);

export const selectSubscriptionsLoading = createSelector(
  selectSubscriptionsState,
  (state) => state.loading
);

export const selectSubscriptionsError = createSelector(
  selectSubscriptionsState,
  (state) => state.error
);

export const selectSelectedSubscriptionId = createSelector(
  selectSubscriptionsState,
  (state) => state.selectedSubscriptionId
);

export const selectSelectedSubscription = createSelector(
  selectSubscriptionsState,
  selectSelectedSubscriptionId,
  (state, id) => id ? selectSubscriptionEntities(state)[id] : null
);

export const selectActiveSubscriptions = createSelector(
  selectSubscriptions,
  (subscriptions) => subscriptions.filter(sub => sub.is_active)
);

export const selectInactiveSubscriptions = createSelector(
  selectSubscriptions,
  (subscriptions) => subscriptions.filter(sub => !sub.is_active)
);

