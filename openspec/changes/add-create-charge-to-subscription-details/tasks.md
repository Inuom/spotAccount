# Implementation Tasks

## 1. Add Charge Form
- [x] 1.1 Add "Add Charge" button to charges card header on subscription details page
- [x] 1.2 Add collapsible form section (showAddChargeForm flag, similar to Add Participant)
- [x] 1.3 Create form with period_start, period_end, amount_total (default: subscription.total_amount), status (default: GENERATED)
- [x] 1.4 Use ReactiveFormsModule and FormBuilder for validation
- [x] 1.5 Add date inputs (type date or compatible format for ISO strings)
- [x] 1.6 Validate period_start < period_end and amount_total > 0
- [x] 1.7 Add Cancel and Submit buttons
- [x] 1.8 Style form to match Add Participant section

## 2. Store Integration
- [x] 2.1 Dispatch createCharge action on form submit with CreateChargeDto (subscription_id from context)
- [x] 2.2 Handle createChargeSuccess: close form, reload charges for subscription (or rely on store update)
- [x] 2.3 Handle createChargeFailure: display error message
- [x] 2.4 Disable form submit while createCharge is in progress (use charges loading or create-specific state)

## 3. UX
- [x] 3.1 Update empty state hint: mention "Add a charge" in addition to generating from list
- [x] 3.2 Clear form or reset after successful creation
- [x] 3.3 Ensure new charge appears in list after creation (createChargeSuccess adds to store; charges filtered by subscription_id)

## 4. Testing
- [x] 4.1 Verify form displays when clicking "Add Charge"
- [x] 4.2 Verify charge is created and appears in list
- [x] 4.3 Verify validation prevents invalid submissions (overlapping periods, negative amount)
- [x] 4.4 Verify cancel hides form without submitting
