# Design: Public Subscription Balance Sharing

## Context
Users need a way to share subscription balance information with participants without requiring authentication. This enables transparency and reduces friction for participants who only need occasional access to debt status.

## Goals / Non-Goals

**Goals:**
- Provide secure, shareable links for subscription balances
- Allow participants to view their debt status without logging in
- Enable admins to revoke sharing at any time
- Prevent enumeration attacks on public endpoints

**Non-Goals:**
- Allowing public users to modify data (read-only access)
- Providing historical balance data (only current balance)
- Supporting expiration dates on share tokens (admin revokes manually)
- Multi-subscription views in public page (one token = one subscription)

## Decisions

### Decision 1: UUID-based Share Tokens
**Choice:** Use cryptographically random UUIDs stored in database rather than signed JWTs.

**Rationale:**
- UUIDs are non-enumerable (128-bit random space prevents brute force)
- Database storage allows instant revocation (delete token)
- Simpler implementation than JWT signing/verification
- No expiration complexity (admin controls lifecycle)

**Alternatives considered:**
- Signed JWTs with expiration: More complex, harder to revoke
- Sequential IDs: Enumerable, security risk
- Short codes: Lower entropy, enumerable

### Decision 2: Single Public Endpoint
**Choice:** Create dedicated public controller with single endpoint `/api/public/subscription-balance/:shareToken`.

**Rationale:**
- Clear separation between authenticated and unauthenticated routes
- Easier to apply rate limiting and monitoring to public routes
- Reuses existing `BalanceService` logic (DRY)

**Alternatives considered:**
- Adding optional query param to existing authenticated endpoint: Confusing, harder to secure
- Creating separate balance calculation for public: Code duplication

### Decision 3: Rate Limiting on Public Endpoint
**Choice:** Apply aggressive rate limiting (e.g., 10 requests/minute per IP).

**Rationale:**
- Prevents token enumeration attempts
- Protects against DDoS on unauthenticated endpoint
- Public users don't need frequent refreshes

**Implementation:** Use NestJS throttler middleware with IP-based tracking.

### Decision 4: No Sensitive Data in Public View
**Choice:** Display participant names, charges, and balance due. Exclude email addresses and payment details.

**Rationale:**
- Participants expect name visibility (they know who shares the subscription)
- Email exposure could enable spam/phishing
- Payment verification references are internal admin data

**Displayed fields:**
- Subscription title, total amount, billing day
- Participant name (not email)
- Total charges, verified payments, pending payments
- Balance due (charges - verified payments)

### Decision 5: Manual Token Lifecycle
**Choice:** Admins manually generate and revoke tokens. No automatic expiration.

**Rationale:**
- Simplifies implementation (no expiration job needed)
- Admins control when sharing is appropriate
- Reduces support burden (no "link expired" complaints)

**Future consideration:** Add optional expiration dates if requested.

## Risks / Trade-offs

### Risk: Token Leakage
**Impact:** Anyone with token can view subscription balances.

**Mitigation:**
- Admins must treat links as sensitive
- Provide revoke functionality for compromised tokens
- Rate limiting prevents mass scraping
- Consider adding basic analytics (view count, last accessed)

### Risk: Privacy Concerns
**Impact:** Participants might not want their balances visible to others.

**Mitigation:**
- Document feature clearly (admins know it's public)
- Only show name and balance, not contact info
- Provide revoke option for sensitive situations

### Trade-off: No Authentication = No Audit Trail
**Impact:** Can't track who viewed the public page.

**Mitigation:**
- Log all public endpoint requests with IP and timestamp
- Admins can monitor access patterns via logs
- Future: Add optional view counter in UI

## Migration Plan

### Schema Migration
1. Add `share_token` column to `subscriptions` table (nullable, unique)
2. Run migration in dev → staging → production
3. Existing subscriptions have `null` token (sharing disabled by default)

### Rollout Strategy
1. Deploy backend with public endpoint
2. Deploy frontend with public page
3. Update admin UI to show share link generation
4. Communicate feature to admins via release notes

### Rollback Plan
If issues arise:
1. Disable public endpoint via feature flag
2. Remove share token UI from frontend
3. Leave schema intact (nullable column, no data loss)

## Open Questions
1. Should we add a "last accessed" timestamp to track token usage?
   - **Decision:** Defer to future iteration if analytics needed
2. Should participants be able to filter/hide their own balance from public view?
   - **Decision:** No, subscription is inherently shared. Admin controls overall visibility.
3. Should we support multiple share tokens per subscription (different audiences)?
   - **Decision:** No, single token per subscription keeps it simple. Revoke and regenerate if needed.
