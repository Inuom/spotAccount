# Feature Specification: Shared Subscription Debt Manager Spec

**Feature Branch**: `001-shared-subscription-spec`  
**Created**: 2025-10-17  
**Status**: Draft  
**Input**: User description: "all the spec is in @spec-ai-powered.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure shared subscription and generate monthly charges (Priority: P1)

An administrator sets up a shared subscription with a title, total monthly amount, billing day,
and participants. The system calculates each participant's share and generates monthly charges
on schedule or on demand.

**Why this priority**: Without the subscription and charges, no balances or payments exist.

**Independent Test**: Configure a subscription with 4 participants; generate charges for the
current month; verify the sum of participant shares equals the configured total.

**Acceptance Scenarios**:

1. Given no subscription exists, when the administrator creates one with a total amount and
   a billing day, then the system records the subscription and displays upcoming charge dates.
2. Given a subscription exists, when charges are generated for a period, then participant
   shares are created and the sum of shares equals the subscription total.

---

### User Story 2 - Verify a user's payment to settle a share (Priority: P1)

An administrator reviews a user's submitted payment and marks it as verified to settle the
corresponding share for the period.

**Why this priority**: Verification settles debts and produces accurate balances.

**Independent Test**: Create a pending payment for a known share; mark it verified; confirm the
user's balance decreases accordingly and the payment becomes immutable.

**Acceptance Scenarios**:

1. Given a pending payment exists, when the administrator marks it verified with a reference,
   then the payment status becomes verified and the related share shows reduced or zero due.
2. Given a payment is verified, when anyone attempts to edit or delete it, then the system
   prevents the change and informs the requester.

---

### User Story 3 - User manages own pending payments (Priority: P2)

A user can create, modify, or delete their own pending payments until they are verified.

**Why this priority**: Users need agency to plan and correct their reimbursements.

**Independent Test**: As a user, create a pending payment; update the amount/date; delete it;
confirm no verified records are affected.

**Acceptance Scenarios**:

1. Given no payment exists for the user, when the user creates a pending payment, then it
   appears in their list with status pending.
2. Given a pending payment exists, when the user edits or deletes it, then changes are saved
   and historical verified records remain unchanged.

---

### User Story 4 - View balances and reports as of a date (Priority: P3)

An administrator or user views current and forecasted balances at a chosen date.

**Why this priority**: Transparency drives timely reimbursements and trust.

**Independent Test**: Select a date; confirm displayed totals reflect generated charges and
verified payments up to that date.

**Acceptance Scenarios**:

1. Given a date is selected, when the viewer loads the summary, then amounts due reflect all
   charges up to that date minus verified payments (and optionally include pending amounts if
   configured).

### Edge Cases

- Participants added/removed mid-cycle: only future charges are impacted; prior charges remain.
- Rounding of shares: fractions are distributed fairly so totals equal the configured amount.
- Cancellations/refunds: verified payments can be counteracted via a new reversing entry; the
  original record remains immutable.
- Unmatched payments: payments without a share reference are flagged for review and assignment.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow administrators to create a shared subscription with title,
  total amount, billing day, and participant list.
- **FR-002**: The system MUST generate periodic charges according to the subscription schedule
  and/or an explicit on-demand action for a specified range.
- **FR-003**: The system MUST compute participant shares for each charge; default equal split and
  support custom share rules per participant.
- **FR-004**: The system MUST allow creation of payment records by users (for themselves) and by
  administrators (on behalf of a user).
- **FR-005**: The system MUST support payment status lifecycle: pending → verified → (optional)
  cancelled, where verified records are immutable.
- **FR-006**: The system MUST let administrators verify a payment and record a verification
  timestamp and optional reference.
- **FR-007**: The system MUST prevent users from modifying or deleting verified payments; users
  MAY modify/delete their own pending payments.
- **FR-008**: The system MUST present balances and summary reports as of a selected date,
  reflecting generated charges and verified payments (optionally including pending in forecast).
- **FR-009**: The system MUST enforce role-based access: administrators manage subscriptions,
  charges, users, and verification; users manage only their own pending payments and balances.
- **FR-011**: The system MUST authenticate users via username/password credentials with secure
  password requirements (minimum 8 characters, complexity rules).
- **FR-010**: The system MUST validate data: positive monetary amounts, valid dates, active
  participants, and consistent share totals.
- **FR-012**: The system MUST provide user-friendly error messages for all user actions and
  prevent invalid data entry through client-side and server-side validation.
- **FR-013**: The system MUST handle system failures gracefully by preserving data integrity
  and providing clear feedback to users about the current system state.
- **FR-014**: The system MUST retain financial data for a minimum of 1 year and provide
  secure data deletion capabilities for users who leave the system.
- **FR-015**: The system MUST encrypt sensitive data (passwords, payment amounts) and implement
  access controls to protect user privacy.
- **FR-016**: The system MUST handle concurrent access using last-write-wins semantics without
  notifying users of conflicts, ensuring data consistency.

### Non-Functional Requirements

- **NFR-001**: The system MUST support up to 100 total users across all subscriptions.
- **NFR-002**: The system MUST support up to 20 users per individual subscription.
- **NFR-003**: The system MUST respond to user actions within 2 seconds under normal load.
- **NFR-004**: The system MUST maintain 99% uptime during business hours (8 AM - 8 PM local time).
- **NFR-005**: The system MUST use GitHub Actions for CI/CD with automated testing, linting, security scanning, and deployment pipelines.
- **NFR-006**: The system MUST achieve minimum 80% test coverage across unit, integration, and end-to-end tests.
(- **NFR-007**: The frontend MUST use NgRx for state management with feature-based modules and normalized state using @ngrx/entity.
- **NFR-008**: The frontend MUST implement smart/dumb component architecture where components only display and bind data, with all viewmodel logic in selectors.
- **NFR-009**: The frontend MUST use NgRx effects for all HTTP service calls with actions generated by selectors.
- **NFR-010**: The frontend MUST implement global error and loading state management in the NgRx store with selectors for UI state.
- **NFR-011**: The frontend MUST NOT persist NgRx state to maintain security for financial data.

### Infrastructure & Deployment Requirements

- **INF-001**: The system MUST be deployed on AWS using Fargate for backend hosting and S3+CloudFront for frontend hosting.
- **INF-002**: The system MUST use SQLite database with file storage for data persistence.
- **INF-003**: The system MUST use Terraform for infrastructure as code to provision and manage AWS resources.
- **INF-004**: The system MUST implement GitHub Actions CI/CD pipeline with automated testing, linting, security scanning, and deployment.
- **INF-005**: The system MUST achieve minimum 80% test coverage across unit, integration, and end-to-end tests in the CI/CD pipeline.
- **INF-006**: The system MUST implement basic logging for application monitoring and debugging.
- **INF-007**: The system MUST support automated deployment to staging and production environments.
- **INF-008**: The system MUST include infrastructure backup and recovery procedures for the SQLite database.

### Key Entities *(include if feature involves data)*

- **User**: A participant who either owes or manages shared expenses; has a role (administrator or user).
- **Subscription**: A recurring shared expense configuration with schedule, total amount, and participants.
- **Charge**: A monthly (or scheduled) instance of the subscription total for a given period.
- **Share**: A participant's portion of a charge, with due and paid amounts.
- **Payment**: A reimbursement record submitted by a user or created by an administrator, with a status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of generated charge share totals exactly match their parent charge totals in tests.
- **SC-002**: Administrators can configure a subscription and see correct shares in under 3 minutes.
- **SC-003**: 95% of verification actions complete without error on the first attempt in testing.
- **SC-004**: Users can view current balances and submit a payment in under 2 minutes end-to-end.
- **SC-005**: Support requests related to "who owes what" decrease by 50% after rollout.

## Clarifications

### Session 2025-10-17

- Q: How should users authenticate to access the system? → A: Username/password authentication
- Q: What are the expected performance and scale requirements for this system? → A: Small group scale (5-20 users per subscription, <100 total users) with sub-2-second response times
- Q: How should the system handle errors and system failures? → A: Graceful degradation with user-friendly error messages and data validation
- Q: What are the data retention and privacy requirements for this financial application? → A: Minimal retention (1 year) with basic privacy protections
- Q: How should the system handle concurrent access and data conflicts? → A: Last-write-wins without user notification of conflicts
- Q: What CI/CD pipeline should be used for automated testing and deployment? → A: GitHub Actions with comprehensive testing pipeline
- Q: What hosting infrastructure should be used for the application? → A: AWS with Fargate (backend), S3+CloudFront (frontend), database choice to be determined
- Q: What database technology should be used for data storage? → A: SQLite with file storage for simplicity and cost-effectiveness
- Q: What infrastructure as code tool should be used for AWS provisioning? → A: Terraform for infrastructure management and state tracking
- Q: What observability and monitoring strategy should be implemented? → A: Basic logging only for cost-effectiveness and simplicity
- Q: What NgRx store structure should be used for state management? → A: Feature-based modules with normalized state using @ngrx/entity
- Q: What NgRx architecture pattern should be used for effects, reducers, and selectors? → A: Effects handle HTTP calls, reducers manage business store, selectors provide business viewmodels
- Q: What state persistence strategy should be implemented for NgRx store? → A: No persistence - all state recreated on page refresh for security
- Q: What component architecture pattern should be used with NgRx? → A: Smart/dumb components with selectors for data binding, components only display and bind
- Q: What error handling and loading state strategy should be used with NgRx? → A: Global error/loading state in store with selectors for UI state management


