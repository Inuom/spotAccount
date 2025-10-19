# Research: Admin Creates Users (Priority)

## Decisions

1) Provisioning Mode: One-time setup link (no email)
- Decision: Generate a one-time password setup link; admin copies and shares externally.
- Rationale: Avoids dependency on email delivery infrastructure while enabling secure onboarding.
- Alternatives: Email invitations; admin-set temporary password (forces change). Rejected to reduce operational overhead and password handling risks.

2) Activation Policy
- Decision: Account activates when user sets a compliant password via the link.
- Rationale: Ensures only users who complete setup are active; supports manual admin inactive flag if needed.
- Alternatives: Immediate activation at creation time; email verification prereq. Rejected for this story scope.

3) Required Fields
- Decision: Require email and name at creation. Role defaults to USER; is_active defaults to true (admin can override).
- Rationale: Clean directories and consistent identity context from day one.

4) Token Expiry & Security
- Decision: Setup token expiry default 48 hours; one-time redeem; token stored hashed server-side; raw token only returned once.
- Rationale: Balance usability and security; prevent token leakage abuse.
- Alternatives: 24/72h windows; multi-use tokens. Rejected for security posture.

5) Password Policy
- Decision: Enforce existing password complexity service; reject weak passwords with clear guidance.
- Rationale: Aligns with existing system standards.

## Impacts / Best Practices
- Admin UI must surface the setup link and expiry; include copy button and regen action.
- Backend must invalidate prior tokens upon regeneration.
- Audit events for create user and invite link generation/regeneration.
- Rate-limit invite regeneration to prevent abuse.
- Trim inputs; normalize email (lowercase) for uniqueness.

## Open Questions (cleared)
- Email verification: Not required for this story.
- Bulk import: Out of scope.
