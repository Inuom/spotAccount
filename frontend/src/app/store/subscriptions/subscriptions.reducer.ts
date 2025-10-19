import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Subscription } from '../../models/subscription.model';
import * as SubscriptionsActions from './subscriptions.actions';

export interface SubscriptionsState extends EntityState<Subscription> {
  selectedSubscriptionId: string | null;
  loading: boolean;
  error: string | null;
}

export const subscriptionsAdapter: EntityAdapter<Subscription> = createEntityAdapter<Subscription>({
  selectId: (subscription: Subscription) => subscription.id,
  sortComparer: (a: Subscription, b: Subscription) => b.created_at.localeCompare(a.created_at),
});

export const initialState: SubscriptionsState = subscriptionsAdapter.getInitialState({
  selectedSubscriptionId: null,
  loading: false,
  error: null,
});

export const subscriptionsReducer = createReducer(
  initialState,
  
  // Load Subscriptions
  on(SubscriptionsActions.loadSubscriptions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SubscriptionsActions.loadSubscriptionsSuccess, (state, { subscriptions }) =>
    subscriptionsAdapter.setAll(subscriptions, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(SubscriptionsActions.loadSubscriptionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Load My Subscriptions
  on(SubscriptionsActions.loadMySubscriptions, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SubscriptionsActions.loadMySubscriptionsSuccess, (state, { subscriptions }) =>
    subscriptionsAdapter.setAll(subscriptions, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(SubscriptionsActions.loadMySubscriptionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Load Subscription
  on(SubscriptionsActions.loadSubscription, (state, { id }) => ({
    ...state,
    selectedSubscriptionId: id,
    loading: true,
    error: null,
  })),
  on(SubscriptionsActions.loadSubscriptionSuccess, (state, { subscription }) =>
    subscriptionsAdapter.upsertOne(subscription, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(SubscriptionsActions.loadSubscriptionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Create Subscription
  on(SubscriptionsActions.createSubscription, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SubscriptionsActions.createSubscriptionSuccess, (state, { subscription }) =>
    subscriptionsAdapter.addOne(subscription, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(SubscriptionsActions.createSubscriptionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Update Subscription
  on(SubscriptionsActions.updateSubscription, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SubscriptionsActions.updateSubscriptionSuccess, (state, { subscription }) =>
    subscriptionsAdapter.updateOne(
      { id: subscription.id, changes: subscription },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),
  on(SubscriptionsActions.updateSubscriptionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Delete Subscription
  on(SubscriptionsActions.deleteSubscription, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SubscriptionsActions.deleteSubscriptionSuccess, (state, { id }) =>
    subscriptionsAdapter.removeOne(id, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(SubscriptionsActions.deleteSubscriptionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Generate Charges
  on(SubscriptionsActions.generateCharges, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SubscriptionsActions.generateChargesSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(SubscriptionsActions.generateChargesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Add Participant
  on(SubscriptionsActions.addParticipant, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SubscriptionsActions.addParticipantSuccess, (state, { subscription }) =>
    subscriptionsAdapter.updateOne(
      { id: subscription.id, changes: subscription },
      {
        ...state,
        loading: false,
        error: null,
      }
    )
  ),
  on(SubscriptionsActions.addParticipantFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  
  // Clear Error
  on(SubscriptionsActions.clearSubscriptionsError, (state) => ({
    ...state,
    error: null,
  }))
);

export const {
  selectIds: selectSubscriptionIds,
  selectEntities: selectSubscriptionEntities,
  selectAll: selectAllSubscriptions,
  selectTotal: selectSubscriptionsTotal,
} = subscriptionsAdapter.getSelectors();

