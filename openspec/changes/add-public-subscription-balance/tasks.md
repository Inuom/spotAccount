# Implementation Tasks

## 1. Database Schema
- [x] 1.1 Add `share_token` field to Subscription model (String, optional, unique, UUID)
- [x] 1.2 Create Prisma migration for schema change
- [x] 1.3 Run migration in development environment

## 2. Backend - Token Generation
- [x] 2.1 Create `GenerateShareTokenDto` (admin only)
- [x] 2.2 Add `generateShareToken()` method to SubscriptionsService
- [x] 2.3 Add `POST /api/subscriptions/:id/share-token` endpoint (admin only)
- [x] 2.4 Add `DELETE /api/subscriptions/:id/share-token` endpoint to revoke sharing (admin only)

## 3. Backend - Public Endpoint
- [x] 3.1 Create `PublicController` in new `public/` module
- [x] 3.2 Add `GET /api/public/subscription-balance/:shareToken` endpoint (no auth guard)
- [x] 3.3 Reuse existing `BalanceService.calculateSubscriptionBalance()` for data
- [x] 3.4 Return 404 for invalid/expired tokens
- [x] 3.5 Add rate limiting to public endpoint (prevent enumeration attacks)

## 4. Frontend - Public Page
- [x] 4.1 Create `PublicSubscriptionBalanceComponent` in new public module
- [x] 4.2 Create public route `/public/subscription/:shareToken` (no auth guard)
- [x] 4.3 Create service method to fetch public balance data
- [x] 4.4 Display subscription title, total amount, billing info
- [x] 4.5 Display participant table (name, total charges, verified payments, pending payments, balance due)
- [x] 4.6 Add responsive styling for mobile viewing
- [x] 4.7 Handle loading, error, and "not found" states

## 5. Frontend - Share Link UI
- [x] 5.1 Update subscription detail component with "Generate Share Link" button (admin only)
- [x] 5.2 Add NgRx actions for generating/revoking share tokens
- [x] 5.3 Add NgRx effects to call backend endpoints
- [x] 5.4 Display generated link with copy-to-clipboard functionality
- [x] 5.5 Add "Revoke Link" button to disable sharing
- [x] 5.6 Show link status (active/inactive) in subscription detail

## 6. Testing
- [x] 6.1 Backend unit tests: token generation, public endpoint, error cases
- [ ] 6.2 Backend integration tests: full flow (generate token → fetch balance)
- [ ] 6.3 Frontend unit tests: public component, service, NgRx actions/reducers/effects
- [ ] 6.4 E2E test: admin generates link → participant views balance without login

## 7. Documentation
- [x] 7.1 Update API documentation with new endpoints
- [x] 7.2 Add user guide section for sharing subscription balances
- [x] 7.3 Document security considerations (token revocation, rate limiting)
