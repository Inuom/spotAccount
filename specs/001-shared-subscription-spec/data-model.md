# Data Model: Shared Subscription Debt Manager

**Date**: 2025-01-22  
**Feature**: 001-shared-subscription-spec  
**Database**: PostgreSQL with Prisma ORM

## Entity Overview

The system manages shared subscription debts through five core entities with clear relationships and state management:

- **User**: System participants (administrators and users)
- **Subscription**: Recurring shared expense configurations  
- **SubscriptionParticipant**: Links users to subscriptions with share rules
- **Charge**: Monthly billing instances generated from subscriptions
- **ChargeShare**: Individual participant portions of each charge
- **Payment**: User payments with verification workflow

## Entity Definitions

### User

System users who can be administrators or regular users, with authentication and authorization capabilities.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` (UUID) | Primary Key | Unique user identifier |
| `email` | `String` | Unique, Required | User login identifier |
| `name` | `String` | Required | Display name for user |
| `password_hash` | `String` | Required | Bcrypt hashed password |
| `role` | `Role` enum | Default: USER | ADMIN or USER role |
| `is_active` | `Boolean` | Default: true | Account status flag |
| `created_at` | `DateTime` | Auto-generated | Account creation timestamp |
| `updated_at` | `DateTime` | Auto-updated | Last modification timestamp |

**Relationships**:
- One-to-many `owned_subscriptions` (User owns Subscription)
- One-to-many `subscription_participants` (User participates in Subscriptions)
- One-to-many `charge_shares` (User has ChargeShares)
- One-to-many `payments_made` (User makes Payments)
- One-to-many `payments_created` (User creates Payments)
- One-to-many `payments_verified` (User verifies Payments)

### Subscription

Recurring shared expense configurations with billing schedule and participant management.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` (UUID) | Primary Key | Unique subscription identifier |
| `title` | `String` | Required | Human-readable subscription name |
| `total_amount` | `Decimal` | Required, > 0 | Monthly billing amount |
| `billing_day` | `Int` | Required, Range: 1-31 | Day of month for billing |
| `frequency` | `String` | Default: "monthly" | Billing frequency pattern |
| `owner_id` | `String` (UUID) | Foreign Key → User.id | Administrative owner |
| `start_date` | `DateTime` | Required | When billing begins |
| `end_date` | `DateTime` | Optional | When billing ends (null = indefinite) |
| `is_active` | `Boolean` | Default: true | Subscription status flag |
| `created_at` | `DateTime` | Auto-generated | Subscription creation timestamp |
| `updated_at` | `DateTime` | Auto-updated | Last modification timestamp |

**Relationships**:
- Many-to-one `owner` (User owns Subscription)
- One-to-many `participants` (SubscriptionParticipant belongs to Subscription)
- One-to-many `charges` (Charge generated from Subscription)

### SubscriptionParticipant

Links users to subscriptions with configurable share calculation rules.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` (UUID) | Primary Key | Unique participant record identifier |
| `subscription_id` | `String` (UUID) | Foreign Key → Subscription.id | Associated subscription |
| `user_id` | `String` (UUID) | Foreign Key → User.id | Participating user |
| `share_type` | `ShareType` enum | Default: EQUAL | How share is calculated |
| `share_value` | `Decimal` | Optional* | Custom share amount/percentage |
| `is_active` | `Boolean` | Default: true | Participation status flag |
| `created_at` | `DateTime` | Auto-generated | Participation creation timestamp |
| `updated_at` | `DateTime` | Auto-updated | Last modification timestamp |

**Constraints**:
- Unique constraint on `(subscription_id, user_id)`
- `share_value` required when `share_type = CUSTOM`

**Relationships**:
- Many-to-one `subscription` (SubscriptionParticipant belongs to Subscription)
- Many-to-one `user` (SubscriptionParticipant belongs to User)

### Charge

Monthly billing instances generated from active subscriptions according to their schedule.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` (UUID) | Primary Key | Unique charge identifier |
| `subscription_id` | `String` (UUID) | Foreign Key → Subscription.id | Source subscription |
| `period_start` | `DateTime` | Required | Billing period start date |
| `period_end` | `DateTime` | Required | Billing period end date |
| `amount_total` | `Decimal` | Required, > 0 | Total charge amount for period |
| `status` | `ChargeStatus` enum | Default: PENDING | Charge processing status |
| `created_at` | `DateTime` | Auto-generated | Charge creation timestamp |
| `updated_at` | `DateTime` | Auto-updated | Last modification timestamp |

**Relationships**:
- Many-to-one `subscription` (Charge belongs to Subscription)
- One-to-many `shares` (ChargeShare belongs to Charge)
- One-to-many `payments` (Payment references Charge)

### ChargeShare

Individual participant portions automatically calculated when charges are generated.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` (UUID) | Primary Key | Unique share identifier |
| `charge_id` | `String` (UUID) | Foreign Key → Charge.id | Associated charge |
| `user_id` | `String` (UUID) | Foreign Key → User.id | Share owner |
| `amount_due` | `Decimal` | Required, ≥ 0 | Calculated share amount |
| `amount_paid` | `Decimal` | Default: 0, ≥ 0 | Total payments applied |
| `status` | `ShareStatus` enum | Default: OPEN | Share settlement status |
| `created_at` | `DateTime` | Auto-generated | Share creation timestamp |
| `updated_at` | `DateTime` | Auto-updated | Last modification timestamp |

**Business Rules**:
- `amount_due` calculated based on SubscriptionParticipant share rules
- `status` automatically computed: OPEN if `amount_due > amount_paid`, SETTLED otherwise
- Share calculations must ensure sum of shares equals `Charge.amount_total`

**Relationships**:
- Many-to-one `charge` (ChargeShare belongs to Charge)
- Many-to-one `user` (ChargeShare belongs to User)

### Payment

User payment records with verification workflow managed by administrators.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `String` (UUID) | Primary Key | Unique payment identifier |
| `user_id` | `String` (UUID) | Foreign Key → User.id | Payment maker |
| `charge_id` | `String` (UUID) | Foreign Key → Charge.id | Optional charge reference |
| `amount` | `Decimal` | Required, > 0 | Payment amount |
| `currency` | `String` | Default: "EUR" | Currency code |
| `scheduled_date` | `DateTime` | Required | When payment is scheduled |
| `created_by` | `String` (UUID) | Foreign Key → User.id | Who created this payment |
| `status` | `PaymentStatus` enum | Default: PENDING | Payment verification status |
| `verification_reference` | `String` | Optional | Admin verification note |
| `verified_at` | `DateTime` | Optional | Verification timestamp |
| `verified_by` | `String` (UUID) | Foreign Key → User.id | Who verified payment |
| `created_at` | `DateTime` | Auto-generated | Payment creation timestamp |
| `updated_at` | `DateTime` | Auto-updated | Last modification timestamp |

**Business Rules**:
- `created_by` can be the same as `user_id` (user creates own payment)
- `verified_by` must be different from `user_id` (admin verification)
- Once `status = VERIFIED`, record becomes immutable (no updates allowed)

**Relationships**:
- Many-to-one `user` (Payment made by User)
- Many-to-one `charge` (Payment references Charge - optional)
- Many-to-one `creator` (Payment created by User)
- Many-to-one `verifier` (Payment verified by User)

## Enumerations

### Role
- `ADMIN`: Full system access, payment verification, user management
- `USER`: Limited access, own payments and balances only

### ShareType  
- `EQUAL`: Equal division based on active participants count
- `CUSTOM`: Custom amount specified in `SubscriptionParticipant.share_value`

### ChargeStatus
- `PENDING`: Charge created but shares not yet calculated
- `GENERATED`: Charge with calculated shares ready for payments
- `CANCELLED`: Charge cancelled, no payments accepted

### ShareStatus
- `OPEN`: Amount due exceeds amount paid
- `SETTLED`: Amount due equals or is less than amount paid

### PaymentStatus
- `PENDING`: Payment created but not yet verified by administrator
- `VERIFIED`: Payment verified, immutable, affects charge share balances
- `CANCELLED`: Payment cancelled, does not affect balances

## Business Rules & Validation

### Data Integrity
1. **Monetary Amounts**: All monetary fields must be positive decimals with appropriate precision
2. **Date Validation**: `period_start < period_end`, `scheduled_date` can be future dates
3. **Share Calculation**: Sum of all `ChargeShare.amount_due` must equal `Charge.amount_total`
4. **User Access**: Users can only modify their own pending payments; admins can verify any payment

### State Transitions
1. **Payment Status**: `PENDING` → `VERIFIED` or `CANCELLED` (one-way transition)
2. **Charge Status**: `PENDING` → `GENERATED` → `CANCELLED` (can skip to cancelled)
3. **Share Status**: Automatically computed based on payment verification

### Security Constraints
1. **Password Storage**: Must use bcrypt with configurable salt rounds
2. **Financial Data**: All monetary operations must be logged with user context
3. **Data Retention**: Financial records retained minimum 1 year per requirements

## Indexes & Performance

### Required Indexes
- `users.email` - Unique index for authentication
- `subscription_participants(subscription_id, user_id)` - Composite unique index
- `charges.subscription_id` - Foreign key index for charge queries
- `charge_shares.user_id` - Index for user balance calculations
- `payments.user_id` - Index for user payment history
- `payments.status` - Index for admin verification queue

### Query Patterns
- User balance calculations: Join `charge_shares` with verified `payments`
- Subscription management: Query `subscriptions` with `participants`
- Admin dashboard: Aggregate queries across all entities with date filtering