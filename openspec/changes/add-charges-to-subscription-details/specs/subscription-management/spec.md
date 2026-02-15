## ADDED Requirements

### Requirement: Subscription Charges Display
Administrators SHALL view all generated charges for a subscription directly within the subscription details page.

#### Scenario: Charges displayed on subscription details
- **WHEN** an administrator views subscription details
- **THEN** all charges for that subscription are displayed below the participants section
- **AND** each charge shows period start date, period end date, total amount, status, and number of shares

#### Scenario: Empty charges state
- **WHEN** an administrator views subscription details for a subscription with no charges
- **THEN** an informative message is displayed indicating no charges have been generated
- **AND** the administrator can generate charges from the main subscriptions list page

#### Scenario: Charges loading state
- **WHEN** subscription details are loading
- **THEN** a loading indicator is displayed in the charges section
- **AND** charges are fetched in parallel with subscription data

#### Scenario: Charges filtered correctly
- **WHEN** viewing subscription details
- **THEN** only charges belonging to that specific subscription are displayed
- **AND** charges from other subscriptions are not shown
