# Subscription Sharing Specification

## ADDED Requirements

### Requirement: Share Token Generation
Administrators SHALL be able to generate a secure, unique share token for a subscription to enable public access to its balance information.

#### Scenario: Admin generates share token
- **WHEN** an administrator requests share token generation for a subscription
- **THEN** the system generates a cryptographically random UUID
- **AND** stores it in the subscription's `share_token` field
- **AND** returns the full shareable URL to the administrator

#### Scenario: Share token uniqueness
- **WHEN** generating a share token
- **THEN** the system ensures the token is unique across all subscriptions
- **AND** regenerates if collision occurs (unlikely with UUIDs)

#### Scenario: Non-admin attempts token generation
- **WHEN** a non-administrator user attempts to generate a share token
- **THEN** the system returns a 403 Forbidden error
- **AND** does not modify the subscription

### Requirement: Share Token Revocation
Administrators SHALL be able to revoke a subscription's share token, disabling public access to its balance information.

#### Scenario: Admin revokes share token
- **WHEN** an administrator requests share token revocation for a subscription
- **THEN** the system sets the subscription's `share_token` field to null
- **AND** confirms revocation to the administrator

#### Scenario: Accessing revoked share token
- **WHEN** a user attempts to access a public balance page with a revoked token
- **THEN** the system returns a 404 Not Found error
- **AND** displays a "Link not found or expired" message

### Requirement: Public Balance Access
Unauthenticated users SHALL be able to view subscription balance information using a valid share token without logging in.

#### Scenario: Valid share token access
- **WHEN** a user navigates to `/public/subscription/:shareToken` with a valid token
- **THEN** the system displays the subscription's balance information
- **AND** shows subscription title, total amount, and billing day
- **AND** lists all active participants with their balance details

#### Scenario: Invalid share token access
- **WHEN** a user navigates to the public page with an invalid or non-existent token
- **THEN** the system returns a 404 Not Found error
- **AND** displays a "Link not found or expired" message

#### Scenario: Rate limiting on public endpoint
- **WHEN** a user exceeds the rate limit on the public endpoint (10 requests/minute per IP)
- **THEN** the system returns a 429 Too Many Requests error
- **AND** includes a `Retry-After` header indicating when to retry

### Requirement: Public Balance Data
The public balance page SHALL display subscription information and participant balances without revealing sensitive personal data.

#### Scenario: Displayed subscription information
- **WHEN** the public balance page loads
- **THEN** the system displays:
  - Subscription title
  - Total monthly amount
  - Billing day
  - Current balance snapshot date

#### Scenario: Displayed participant information
- **WHEN** the public balance page loads
- **THEN** for each active participant, the system displays:
  - Participant name (not email)
  - Total charges to date
  - Total verified payments
  - Total pending payments (awaiting verification)
  - Current balance due (charges - verified payments)

#### Scenario: Excluded sensitive data
- **WHEN** the public balance page loads
- **THEN** the system does NOT display:
  - Participant email addresses
  - Payment verification references
  - Internal user IDs
  - Historical transaction details beyond totals

### Requirement: Share Link UI
Administrators SHALL see share link management controls in the subscription detail page.

#### Scenario: Subscription without share token
- **WHEN** an administrator views a subscription that has no share token
- **THEN** the system displays a "Generate Share Link" button
- **AND** indicates that sharing is currently disabled

#### Scenario: Subscription with active share token
- **WHEN** an administrator views a subscription that has an active share token
- **THEN** the system displays the full shareable URL
- **AND** provides a "Copy Link" button to copy the URL to clipboard
- **AND** provides a "Revoke Link" button to disable sharing
- **AND** indicates that sharing is active

#### Scenario: Copy share link to clipboard
- **WHEN** an administrator clicks the "Copy Link" button
- **THEN** the system copies the full shareable URL to the clipboard
- **AND** displays a confirmation message ("Link copied!")

### Requirement: Public Page Responsiveness
The public balance page SHALL be responsive and accessible on mobile devices.

#### Scenario: Mobile viewing
- **WHEN** a user views the public balance page on a mobile device
- **THEN** the participant table adapts to small screen sizes
- **AND** maintains readability without horizontal scrolling
- **AND** uses appropriate font sizes and spacing

### Requirement: Public Balance Calculation
The public balance endpoint SHALL use the same calculation logic as the authenticated balance reports to ensure consistency.

#### Scenario: Balance consistency
- **WHEN** a public user views the subscription balance via share token
- **AND** an authenticated user views the same subscription's balance report
- **THEN** both views display identical balance figures for all participants
- **AND** use the same calculation logic from `BalanceService.calculateSubscriptionBalance()`

### Requirement: Security Logging
The system SHALL log all access attempts to the public balance endpoint for security monitoring.

#### Scenario: Successful public access logged
- **WHEN** a user successfully accesses the public balance endpoint
- **THEN** the system logs the request with:
  - Timestamp
  - Share token used
  - IP address
  - User agent
  - Success status

#### Scenario: Failed access attempts logged
- **WHEN** a user attempts to access an invalid or revoked share token
- **THEN** the system logs the request with:
  - Timestamp
  - Invalid token attempted
  - IP address
  - User agent
  - Failure reason (not found, revoked, rate limited)
