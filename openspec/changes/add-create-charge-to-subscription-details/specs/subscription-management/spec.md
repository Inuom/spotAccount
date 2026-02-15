## ADDED Requirements

### Requirement: Add Charge from Subscription Details
Administrators SHALL create a single charge from the subscription details page without navigating away.

#### Scenario: Add charge form available
- **WHEN** an administrator views subscription details
- **THEN** an "Add Charge" control is visible in the charges section
- **AND** clicking it reveals a form to create a new charge

#### Scenario: Create charge with period and amount
- **WHEN** an administrator fills the form with period start, period end, and amount
- **AND** submits the form
- **THEN** a charge is created for the current subscription
- **AND** the new charge appears in the charges list
- **AND** the form is closed

#### Scenario: Form defaults
- **WHEN** the add charge form is opened
- **THEN** amount defaults to the subscription's total amount
- **AND** status defaults to GENERATED
- **AND** subscription is pre-filled from context (no user input required)

#### Scenario: Form validation
- **WHEN** an administrator enters invalid data (period_end before period_start, negative amount, overlapping period)
- **THEN** the form prevents submission or displays validation errors
- **AND** the user can correct the input

#### Scenario: Cancel add charge
- **WHEN** an administrator opens the add charge form
- **AND** clicks Cancel or closes the form
- **THEN** the form is hidden without creating a charge
