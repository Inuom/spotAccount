# Feature: Admin Creates Users (Priority)

## Overview
As an administrator, I want to create new user accounts so that I can onboard teammates/participants quickly and manage access to the system.

## Goals
- Enable admins to create user accounts with required attributes.
- Enforce data validation (unique email, password policy if applicable).
- Provide clear feedback on success/failure and next steps for the new user.
- Ensure the action is auditable and secure.

## Non-Goals / Out of Scope
- Self-service user registration by non-admins.
- Bulk CSV imports (single-user creation only in this story).
- Password reset flows (covered by separate stories).

## Actors
- Admin: can create users.
- System: validates inputs, persists data, sends notifications if configured.

## Assumptions
- Admins are authenticated and authorized before accessing user management.
- Emails are unique identifiers for users.
- Default role for new users is USER unless admin explicitly selects ADMIN.
- Account becomes active after the invited user sets their password via the setup link; admin may also set initial Active = false.
- System generates a one-time setup link (no email is sent). Admin copies and shares the link externally. Token has a configurable expiry.

## Decisions
- Provisioning: Admin generates a one-time setup link; no email is sent by the system. Admin shares the link as needed.
- Profile: Admin provides all profile fields (email, name, role, status). The invited user sets only their password via the link.
- Name is required at creation time.
- Email verification is not required for activation; activation occurs upon successful password setup.

## User Scenarios & Testing
1) Admin creates a standard user successfully
   - Admin navigates to User Management > Create User
   - Admin fills in Email (unique), Name, Role (default USER), Status (default Active)
   - Admin submits; system validates and creates the user
   - System displays success confirmation and the new user appears in the list

2) Duplicate email
   - Admin enters an email that already exists
   - System blocks submission and shows a clear error explaining the email is already in use

3) Invalid inputs
   - Missing required fields (e.g., email), or invalid email format
   - System shows inline validation errors and disables submission until valid

4) Invitation link generation (no email)
   - After creation, system generates a one-time password setup link
   - The link is shown to the admin with a convenient Copy action and expiry info

5) Password setup by invited user
   - Invited user opens the setup link and sets a compliant password
   - System activates the account upon successful password setup

6) Authorization enforcement
   - Non-admin attempts to access Create User view/API
   - System denies access with appropriate message

7) Audit trail
   - Creating a user writes an audit entry containing actor, timestamp, target user id, and outcome

## Functional Requirements
- FR1: Only admins can access user creation capability (UI and API) and non-admins are blocked.
- FR2: System must validate and enforce unique email addresses; creation fails on duplicates with a clear error.
- FR3: System must validate email format and required fields before submission.
- FR4: Admin can set role at creation time; default role is USER if none selected.
- FR5: Admin can set active/inactive status; default is Active.
- FR6: On success, system returns the created user’s basic profile (id, email, name, role, is_active, created_at).
- FR7: System must record an audit event for user creation including actor id, target user id, timestamp, and status (success/failure).
- FR8: Error messages must be human-readable and not expose sensitive internals.
- FR9: System generates a one-time password setup link with configurable expiry and displays it to the admin for copying (no email sending).
- FR10: Upon password setup via the link, the system enforces password policy and activates the account.

## Success Criteria
- SC1: Admins can create a user end-to-end in under 30 seconds (median) once on the Create User screen.
- SC2: 100% of duplicate-email attempts are blocked with clear guidance.
- SC3: 95% of form validation errors are understood by admins without needing support (measured via UX review/feedback).
- SC4: 100% of create-user actions are captured in audit records with actor, target, timestamp, and outcome.
- SC5: Zero successful creations by non-admin users in access tests.

## Key Entities
- User: { id, email, name, role, is_active, created_at, updated_at }
- AuditEvent: { id, actor_id, action, target_id, timestamp, status, metadata }
- Invitation (optional): { id, user_id, token, expires_at, redeemed_at }

## Dependencies
- Authentication and role-based authorization in place.
- Secure token generation and storage for invitation links (no outbound email dependency).

## Risks
- Link sharing risks if an admin shares the link in insecure channels; mitigated by short expiry and one-time redemption.
- Admins accidentally assigning ADMIN role—mitigate with confirmation.

## Edge Cases
- Creating with leading/trailing spaces in email/name → inputs should be trimmed.
- Immediate deactivation after creation should be allowed and reflected in list.
- Rapid repeated submissions should not create duplicates (idempotency/disable button).

## Acceptance Criteria
- AC1: Admin-only access to Create User is enforced at both UI and API levels.
- AC2: Submitting a valid new user results in a success message and visible user in list.
- AC3: Duplicate email submission shows an inline error and no user is created.
- AC4: Audit entry exists for every create attempt (success or failure).
- AC5: System generates a one-time setup link, displays it to the admin with Copy action and expiry, and the user can activate the account by setting a password via the link.


