# Implementation Plan: Shared Subscription Debt Manager

**Branch**: `001-shared-subscription-spec` | **Date**: 2025-01-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-shared-subscription-spec/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Shared Subscription Debt Manager enables administrators to create recurring shared expense subscriptions, automatically calculate participant shares, and manage payment verification workflows. The system supports adding existing users to existing subscriptions with proper share recalculation and future charge management.

## Technical Context

**Language/Version**: TypeScript 5.0+, Node.js 18+ (LTS), Angular 17+  
**Primary Dependencies**: NestJS, Prisma ORM, PostgreSQL, NgRx, Angular Material  
**Storage**: PostgreSQL with Prisma ORM for data persistence and migrations  
**Testing**: Jest (backend), Jasmine/Karma (frontend), Cypress (E2E)  
**Target Platform**: Web application (backend API + frontend SPA)  
**Project Type**: Web application with frontend/backend separation  
**Performance Goals**: <2 second response times for all user actions, 99% uptime during business hours  
**Constraints**: <100 total users, <20 users per subscription, 80% test coverage minimum  
**Scale/Scope**: Small group scale (5-20 users per subscription), financial data integrity, audit compliance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Security & Access Control
- ✅ HTTPS enforced in all environments via CloudFront/ALB
- ✅ Password hashing with bcrypt implemented
- ✅ RBAC with roles `admin` and `user` with least privilege default
- ✅ Rate limiting on API endpoints configured
- ✅ Input validation on frontend and backend implemented
- ✅ Audit logs for critical actions (payment verification, user/admin changes)

### Testing & Quality
- ✅ Unit test coverage ≥ 80% across backend and frontend
- ✅ Integration tests for auth, subscriptions/charges, payments endpoints
- ✅ E2E tests for login, subscription creation, payment creation & verification
- ✅ All tests and linters run in CI with failing pipelines blocking merges

### Infrastructure & Observability
- ✅ Terraform for AWS infrastructure provisioning
- ✅ Structured JSON logs shipped to CloudWatch
- ✅ `/healthz` endpoint exposed for liveness checks
- ✅ PostgreSQL automated backups with AWS RDS snapshots

### Documentation & Governance
- ✅ API docs and spec updated for behavior changes
- ✅ All changes via PR with approval required
- ✅ Constitution compliance verified in planning phase

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── auth/                    # Authentication and authorization
│   ├── users/                   # User management and invitations
│   ├── subscriptions/           # Subscription and participant management
│   ├── charges/                 # Charge generation and share calculation
│   ├── payments/                # Payment verification and workflow
│   ├── reports/                 # Balance and reporting services
│   ├── database/                # Prisma service and database module
│   ├── health/                  # Health check endpoints
│   └── common/                  # Shared middleware and utilities
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── migrations/             # Database migration files
│   └── seed.ts                 # Database seeding script
└── tests/                      # Backend test suites

frontend/
├── src/app/
│   ├── store/                  # NgRx state management
│   │   ├── auth/              # Authentication state
│   │   ├── users/             # User management state
│   │   ├── subscriptions/     # Subscription state
│   │   ├── charges/           # Charge state
│   │   ├── payments/          # Payment state
│   │   └── ui/                # Global UI state
│   ├── pages/                 # Route-based page components
│   │   ├── admin/             # Administrative interfaces
│   │   ├── user/              # User-focused interfaces
│   │   └── auth/              # Authentication pages
│   ├── components/            # Reusable UI components
│   ├── services/              # API service layer
│   └── interceptors/          # HTTP interceptors
└── tests/                     # Frontend test suites
```

**Structure Decision**: Web application with clear separation between backend API (NestJS) and frontend SPA (Angular). Backend organized by feature modules (auth, users, subscriptions, payments, reports) with shared infrastructure. Frontend uses NgRx for state management with feature-based store modules aligned with business domain.

## User Story 7 - Admin Add Existing User to Subscription (Priority: P2)

### Goal
Enable administrators to add existing users as participants to existing subscriptions with proper share configuration and future charge recalculation.

### Independent Test
Admin adds existing user to subscription via details view; verify equal shares recalculate, future charges include new participant, historical charges remain unchanged.

### Acceptance Scenarios
1. Given an admin is viewing subscription details, when they add an existing user not already in the subscription, then the user becomes a participant with specified share type and the system recalculates equal shares for all participants.
2. Given an admin attempts to add a user already in the subscription, when they submit the form, then the system prevents the addition and displays a clear error message.
3. Given a new participant is added mid-cycle, when future charges are generated, then the new participant receives their share but historical charges remain unchanged.

### Implementation Tasks

#### Backend Implementation
- **T148**: Implement add participant endpoint in `backend/src/subscriptions/subscriptions.controller.ts`
- **T149**: Create add participant DTOs and validation in `backend/src/subscriptions/dto/add-participant.dto.ts`
- **T150**: Implement participant addition service logic in `backend/src/subscriptions/subscriptions.service.ts`
- **T151**: Implement share recalculation logic for existing participants in `backend/src/subscriptions/share-calculation.service.ts`
- **T152**: Add duplicate participant validation in `backend/src/subscriptions/participant-validation.service.ts`
- **T153**: Update SubscriptionParticipant repository for participant management in `backend/src/subscriptions/subscriptions.repository.ts`
- **T154**: Implement audit logging for participant additions in `backend/src/subscriptions/subscription-audit.service.ts`

#### Frontend Implementation  
- **T155**: Update subscription details page to show add participant button in `frontend/src/app/pages/admin/subscriptions/subscription-details/`
- **T156**: Create add participant component with user selection in `frontend/src/app/components/add-participant/`
- **T157**: Add participant selection service and user search in `frontend/src/app/services/subscription.service.ts`
- **T158**: Update subscription NgRx store for participant management in `frontend/src/app/store/subscriptions/`
- **T159**: Create participant management actions and effects in `frontend/src/app/store/subscriptions/subscription.effects.ts`
- **T160**: Add validation and error handling for duplicate participants in `frontend/src/app/components/add-participant/add-participant.component.ts`

### Technical Requirements
- **FR-018**: The system MUST allow administrators to add existing users as participants to existing subscriptions with proper share type and value configuration.
- **FR-018.1**: When adding new participants to existing subscriptions, the system MUST recalculate all equal shares to distribute evenly among all participants (existing and new).
- **FR-018.2**: When adding new participants to existing subscriptions, the system MUST only affect future charges; historical charges and their participant shares remain unchanged.
- **FR-018.3**: The system MUST prevent adding duplicate participants to the same subscription and provide clear error messages when attempting to add a user who is already a participant.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | All requirements align with established patterns | Constitution compliance maintained |

