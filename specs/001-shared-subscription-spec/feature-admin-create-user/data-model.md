# Data Model: Admin Creates Users (Priority)

## Entities

### User
- id: string (UUID)
- email: string (unique, lowercase)
- name: string (required)
- role: enum { ADMIN, USER } (default USER)
- is_active: boolean (default true; activation tied to password setup if invite pending)
- created_at: datetime
- updated_at: datetime

Validation:
- email required, valid format, unique (normalized lowercase)
- name required, trimmed

### Invitation
- id: string (UUID)
- user_id: string (FK → User.id)
- token_hash: string (hashed token; raw token only returned once)
- expires_at: datetime (default now + 48h)
- redeemed_at: datetime | null
- created_at: datetime

Invariants:
- Token is single-use; upon redemption set redeemed_at and invalidate token_hash
- Regeneration invalidates prior invitation tokens for the user

### AuditEvent
- id: string (UUID)
- actor_id: string (FK → User.id)
- action: string (e.g., "USER_CREATE", "INVITE_GENERATE")
- target_id: string (e.g., created user id)
- status: enum { SUCCESS, FAILURE }
- timestamp: datetime (default now)
- metadata: json (optional context)

## Relationships
- User 1 — 0..1 Invitation (pending invitation for password setup)
- User 1 — * AuditEvent (as actor and as target)

## State Transitions
- User.created → Invitation.created (optional) → User.activated on password setup
- Invitation.created → Invitation.redeemed | Invitation.expired

## Derived/Computed
- user.has_pending_invitation = invitation exists AND now < expires_at AND redeemed_at is null
