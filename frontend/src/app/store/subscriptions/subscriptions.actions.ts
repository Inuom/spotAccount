import { createAction, props } from '@ngrx/store';
import { Subscription, CreateSubscriptionDto, UpdateSubscriptionDto } from '../../models/subscription.model';
import { Charge } from '../../models/charge.model';

// Load Subscriptions
export const loadSubscriptions = createAction('[Subscriptions] Load Subscriptions');

export const loadSubscriptionsSuccess = createAction(
  '[Subscriptions] Load Subscriptions Success',
  props<{ subscriptions: Subscription[] }>()
);

export const loadSubscriptionsFailure = createAction(
  '[Subscriptions] Load Subscriptions Failure',
  props<{ error: string }>()
);

// Load My Subscriptions
export const loadMySubscriptions = createAction('[Subscriptions] Load My Subscriptions');

export const loadMySubscriptionsSuccess = createAction(
  '[Subscriptions] Load My Subscriptions Success',
  props<{ subscriptions: Subscription[] }>()
);

export const loadMySubscriptionsFailure = createAction(
  '[Subscriptions] Load My Subscriptions Failure',
  props<{ error: string }>()
);

// Load Subscription by ID
export const loadSubscription = createAction(
  '[Subscriptions] Load Subscription',
  props<{ id: string }>()
);

export const loadSubscriptionSuccess = createAction(
  '[Subscriptions] Load Subscription Success',
  props<{ subscription: Subscription }>()
);

export const loadSubscriptionFailure = createAction(
  '[Subscriptions] Load Subscription Failure',
  props<{ error: string }>()
);

// Create Subscription
export const createSubscription = createAction(
  '[Subscriptions] Create Subscription',
  props<{ subscription: CreateSubscriptionDto }>()
);

export const createSubscriptionSuccess = createAction(
  '[Subscriptions] Create Subscription Success',
  props<{ subscription: Subscription }>()
);

export const createSubscriptionFailure = createAction(
  '[Subscriptions] Create Subscription Failure',
  props<{ error: string }>()
);

// Update Subscription
export const updateSubscription = createAction(
  '[Subscriptions] Update Subscription',
  props<{ id: string; subscription: UpdateSubscriptionDto }>()
);

export const updateSubscriptionSuccess = createAction(
  '[Subscriptions] Update Subscription Success',
  props<{ subscription: Subscription }>()
);

export const updateSubscriptionFailure = createAction(
  '[Subscriptions] Update Subscription Failure',
  props<{ error: string }>()
);

// Delete Subscription
export const deleteSubscription = createAction(
  '[Subscriptions] Delete Subscription',
  props<{ id: string }>()
);

export const deleteSubscriptionSuccess = createAction(
  '[Subscriptions] Delete Subscription Success',
  props<{ id: string }>()
);

export const deleteSubscriptionFailure = createAction(
  '[Subscriptions] Delete Subscription Failure',
  props<{ error: string }>()
);

// Generate Charges
export const generateCharges = createAction(
  '[Subscriptions] Generate Charges',
  props<{ subscriptionId: string; until: string }>()
);

export const generateChargesSuccess = createAction(
  '[Subscriptions] Generate Charges Success',
  props<{ charges: Charge[] }>()
);

export const generateChargesFailure = createAction(
  '[Subscriptions] Generate Charges Failure',
  props<{ error: string }>()
);

// Clear Errors
export const clearSubscriptionsError = createAction('[Subscriptions] Clear Error');

