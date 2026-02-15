# Change: Add Public Subscription Balance Page

## Why
Administrators need to share subscription balance information with participants without requiring them to log in. Currently, users must authenticate to view their balances, creating friction for participants who only need occasional access to their debt status.

## What Changes
- Add shareable token generation for subscriptions (UUID-based, secure)
- Create public API endpoint to fetch subscription balance via share token (no authentication required)
- Add public frontend route to display subscription participant balances
- Provide UI for admins to generate and copy shareable links
- Display participant names, charges, payments, and current balance due

## Impact
- Affected specs: subscription-sharing (new capability)
- Affected code:
  - Backend: `prisma/schema.prisma` (add share_token to Subscription model)
  - Backend: `subscriptions/` module (add token generation endpoint)
  - Backend: New public controller for unauthenticated balance access
  - Frontend: New public route and component for balance display
  - Frontend: Update subscription detail page with share link UI
