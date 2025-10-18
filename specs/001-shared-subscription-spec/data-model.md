# Data Model: Shared Subscription Debt Manager

**Date**: 2025-10-18  
**Feature**: 001-shared-subscription-spec  
**Database**: SQLite with Prisma ORM

## Entity Definitions

### User
**Purpose**: Represents system users (administrators and participants)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier |
| email | String | Unique, Not Null | User's email address |
| name | String | Not Null | User's display name |
| password_hash | String | Not Null | Bcrypt hashed password |
| role | Enum | Not Null | 'admin' or 'user' |
| is_active | Boolean | Not Null, Default: true | Account status |
| created_at | DateTime | Not Null | Account creation timestamp |
| updated_at | DateTime | Not Null | Last update timestamp |

**Validation Rules**:
- Email must be valid format
- Password must be minimum 8 characters with complexity
- Role must be either 'admin' or 'user'
- Name must be non-empty

**State Transitions**:
- New → Active (account creation)
- Active → Inactive (account deactivation)
- Inactive → Active (account reactivation)

### Subscription
**Purpose**: Represents recurring shared expense configurations

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier |
| title | String | Not Null | Subscription name |
| total_amount | Decimal | Not Null, > 0 | Monthly total amount |
| billing_day | Integer | Not Null, 1-31 | Day of month for billing |
| frequency | String | Not Null, Default: 'monthly' | Billing frequency |
| owner_id | UUID | Foreign Key → User.id | Administrator who created |
| start_date | Date | Not Null | Subscription start date |
| end_date | Date | Nullable | Subscription end date |
| is_active | Boolean | Not Null, Default: true | Subscription status |
| created_at | DateTime | Not Null | Creation timestamp |
| updated_at | DateTime | Not Null | Last update timestamp |

**Validation Rules**:
- Title must be non-empty
- Total amount must be positive
- Billing day must be 1-31
- Start date must be valid
- End date must be after start date (if provided)

**State Transitions**:
- Draft → Active (subscription activation)
- Active → Inactive (subscription deactivation)
- Inactive → Active (subscription reactivation)

### SubscriptionParticipant
**Purpose**: Links users to subscriptions with their share configuration

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier |
| subscription_id | UUID | Foreign Key → Subscription.id | Associated subscription |
| user_id | UUID | Foreign Key → User.id | Participant user |
| share_type | Enum | Not Null | 'equal' or 'custom' |
| share_value | Decimal | Nullable | Custom share amount (if share_type = 'custom') |
| is_active | Boolean | Not Null, Default: true | Participation status |
| created_at | DateTime | Not Null | Creation timestamp |
| updated_at | DateTime | Not Null | Last update timestamp |

**Validation Rules**:
- User must be active
- Subscription must be active
- Share value must be positive (if custom)
- Share values must sum to subscription total

**State Transitions**:
- Pending → Active (participation confirmed)
- Active → Inactive (participation ended)
- Inactive → Active (participation resumed)

### Charge
**Purpose**: Represents monthly instances of subscription billing

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier |
| subscription_id | UUID | Foreign Key → Subscription.id | Associated subscription |
| period_start | Date | Not Null | Billing period start |
| period_end | Date | Not Null | Billing period end |
| amount_total | Decimal | Not Null, > 0 | Total charge amount |
| status | Enum | Not Null, Default: 'pending' | 'pending', 'generated', 'cancelled' |
| created_at | DateTime | Not Null | Creation timestamp |
| updated_at | DateTime | Not Null | Last update timestamp |

**Validation Rules**:
- Period start must be before period end
- Amount must be positive
- Must not overlap with existing charges for same subscription

**State Transitions**:
- Pending → Generated (charge generation)
- Generated → Cancelled (charge cancellation)
- Cancelled → Generated (charge reactivation)

### ChargeShare
**Purpose**: Represents individual participant's portion of a charge

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier |
| charge_id | UUID | Foreign Key → Charge.id | Associated charge |
| user_id | UUID | Foreign Key → User.id | Participant user |
| amount_due | Decimal | Not Null, ≥ 0 | Amount owed by participant |
| amount_paid | Decimal | Not Null, Default: 0, ≥ 0 | Amount paid by participant |
| status | Enum | Not Null, Default: 'open' | 'open', 'settled' |
| created_at | DateTime | Not Null | Creation timestamp |
| updated_at | DateTime | Not Null | Last update timestamp |

**Validation Rules**:
- Amount due must be non-negative
- Amount paid must be non-negative
- Amount paid cannot exceed amount due
- Sum of shares must equal charge total

**State Transitions**:
- Open → Settled (payment verification)
- Settled → Open (payment reversal)

### Payment
**Purpose**: Represents user payments and administrator-created payments

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier |
| user_id | UUID | Foreign Key → User.id | Paying user |
| charge_id | UUID | Foreign Key → Charge.id, Nullable | Associated charge (if applicable) |
| amount | Decimal | Not Null, > 0 | Payment amount |
| currency | String | Not Null, Default: 'EUR' | Payment currency |
| scheduled_date | Date | Not Null | Scheduled payment date |
| created_by | UUID | Foreign Key → User.id | User who created payment |
| status | Enum | Not Null, Default: 'pending' | 'pending', 'verified', 'cancelled' |
| verification_reference | String | Nullable | Bank reference or verification note |
| verified_at | DateTime | Nullable | Verification timestamp |
| verified_by | UUID | Foreign Key → User.id, Nullable | Administrator who verified |
| created_at | DateTime | Not Null | Creation timestamp |
| updated_at | DateTime | Not Null | Last update timestamp |

**Validation Rules**:
- Amount must be positive
- Currency must be valid ISO code
- Scheduled date cannot be in the past
- Verification reference required for verified payments
- Verified payments cannot be modified

**State Transitions**:
- Pending → Verified (payment verification)
- Pending → Cancelled (payment cancellation)
- Verified → Cancelled (payment reversal - creates new reversing entry)

## Relationships

### Primary Relationships
- **User** → **Subscription** (1:N) - Users can own multiple subscriptions
- **Subscription** → **SubscriptionParticipant** (1:N) - Subscriptions have multiple participants
- **User** → **SubscriptionParticipant** (1:N) - Users can participate in multiple subscriptions
- **Subscription** → **Charge** (1:N) - Subscriptions generate multiple charges
- **Charge** → **ChargeShare** (1:N) - Charges have multiple shares
- **User** → **ChargeShare** (1:N) - Users have multiple charge shares
- **User** → **Payment** (1:N) - Users can make multiple payments
- **Charge** → **Payment** (1:N) - Charges can have multiple payments
- **User** → **Payment** (created_by, verified_by) - Users create and verify payments

### Business Rules
1. **Subscription Ownership**: Only administrators can create subscriptions
2. **Participation**: Users can only participate in active subscriptions
3. **Charge Generation**: Charges are generated monthly based on subscription schedule
4. **Share Calculation**: Shares are calculated based on participant configuration
5. **Payment Verification**: Only administrators can verify payments
6. **Data Integrity**: Verified payments cannot be modified or deleted
7. **Concurrent Access**: Last-write-wins semantics for concurrent modifications

## Indexes

### Performance Indexes
- `idx_user_email` on User.email (unique)
- `idx_subscription_owner` on Subscription.owner_id
- `idx_subscription_participant_user` on SubscriptionParticipant.user_id
- `idx_subscription_participant_subscription` on SubscriptionParticipant.subscription_id
- `idx_charge_subscription` on Charge.subscription_id
- `idx_charge_share_user` on ChargeShare.user_id
- `idx_charge_share_charge` on ChargeShare.charge_id
- `idx_payment_user` on Payment.user_id
- `idx_payment_charge` on Payment.charge_id
- `idx_payment_status` on Payment.status

### Composite Indexes
- `idx_charge_period` on Charge(subscription_id, period_start, period_end)
- `idx_payment_user_status` on Payment(user_id, status)
- `idx_charge_share_user_status` on ChargeShare(user_id, status)

## Data Validation

### Application-Level Validation
- Email format validation
- Password complexity requirements
- Monetary amount precision (2 decimal places)
- Date range validation
- Enum value validation
- Foreign key constraint validation

### Database-Level Constraints
- Primary key constraints
- Foreign key constraints
- Unique constraints
- Check constraints for positive amounts
- Check constraints for valid date ranges
- Check constraints for enum values

## Audit Trail

### Audit Fields
All entities include:
- `created_at` - Record creation timestamp
- `updated_at` - Last modification timestamp

### Audit Logging
Critical actions are logged:
- User authentication attempts
- Payment verification actions
- Subscription modifications
- User role changes
- Data deletion attempts

## Data Migration Strategy

### Prisma Migrations
- Schema changes via Prisma migrations
- Version-controlled database evolution
- Rollback support for failed migrations
- Data transformation scripts for complex changes

### Backup and Recovery
- Daily SQLite database backups
- S3 storage for backup retention
- Point-in-time recovery capability
- Data export for compliance requirements