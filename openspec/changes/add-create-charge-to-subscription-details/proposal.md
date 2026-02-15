# Change: Add Create Charge from Subscription Details

## Why
Administrators must currently leave the subscription details page to add or generate charges (via the Subscriptions list "Generate Charges" button). The ability to add a charge directly from the subscription details screen reduces context switching and streamlines the workflow when managing a single subscription's billing periods.

## What Changes
- Add an "Add Charge" button to the charges section on the subscription details page
- Add a collapsible form (similar to Add Participant) to create a single charge
- Form fields: period start, period end, amount (defaulting to subscription total_amount), status
- Subscription ID is pre-filled from the current context
- On successful creation, the new charge appears in the list and the form is closed

## Impact
- Affected specs: `subscription-management` (extends capability from add-charges-to-subscription-details)
- Affected code:
  - `frontend/src/app/pages/admin/subscriptions/subscription-details/subscription-details.component.ts` - Add charge form section and button
  - Optional: `frontend/src/app/components/add-charge/` - Reusable AddChargeComponent (or inline form for simplicity)
