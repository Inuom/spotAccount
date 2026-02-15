# Change: Add Charges Display to Subscription Details

## Why
Administrators need visibility into all charges generated for a subscription directly from the subscription details page. Currently, they must navigate to a separate charges page and filter by subscription. This adds friction to subscription management and makes it harder to understand the billing history at a glance.

## What Changes
- Add a charges section to the subscription details component displaying all charges for that subscription
- Load charges when subscription details are viewed (using existing charge service and store)
- Display charge information: period dates, amount, status, number of shares
- Provide quick navigation to full charge details if needed

## Impact
- Affected specs: `subscription-management` (new capability)
- Affected code:
  - `frontend/src/app/pages/admin/subscriptions/subscription-details/subscription-details.component.ts` - Add charges display section
  - `frontend/src/app/store/effects/subscription.effects.ts` - Load charges when loading subscription details
  - `frontend/src/app/store/charges/charges.actions.ts` - Use existing loadCharges action
  - `frontend/src/app/store/charges/charges.selectors.ts` - Create selector to filter charges by subscription_id
