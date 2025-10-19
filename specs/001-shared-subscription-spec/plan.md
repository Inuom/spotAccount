# Implementation Plan: Shared Subscription Debt Manager

**Branch**: `001-shared-subscription-spec` | **Date**: 2025-01-22 | **Spec**: specs/001-shared-subscription-spec/spec.md
**Input**: Feature specification from `/specs/001-shared-subscription-spec/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

A shared subscription debt management system where administrators configure subscriptions with participants and billing schedules, the system generates automated charges and shares, and users can submit payments that administrators verify to settle debts. Technical approach uses NestJS backend with PostgreSQL, Angular frontend with NgRx state management, deployed on AWS with complete CI/CD pipeline targeting stable operation before future Angular signals migration.

## Technical Context

**Language/Version**: TypeScript/Node.js 18+, Angular 17+, NestJS 10+  
**Primary Dependencies**: NestJS, Angular, NgRx, Prisma ORM, PostgreSQL 14+  
**Storage**: PostgreSQL database with Prisma ORM for type-safe access  
**Testing**: Jest (backend), Jasmine/Karma (frontend), Cypress (E2E) targeting 80% coverage  
**Target Platform**: Web application (SPA + REST API) deployed on AWS infrastructure  
**Project Type**: Web application with separate frontend and backend components  
**Performance Goals**: 2-second response time for all user actions, 99% uptime during business hours  
**Constraints**: Support up to 100 total users, 20 users per subscription, last-write-wins concurrency  
**Scale/Scope**: Small group financial application with full-stack web architecture

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Lint/type checks**: TypeScript strict mode enabled for both frontend and backend  
✅ **Unit test coverage**: Target ≥80% implemented with Jest (backend) and Jasmine/Karma (frontend)  
✅ **Integration tests**: Planned for auth, subscriptions/charges, and payments endpoints  
✅ **E2E tests**: Planned for login, subscription creation, payment creation & verification flows  
✅ **Security**: HTTPS enforced via CloudFront/ALB, bcrypt password hashing, RBAC with admin/user roles  
✅ **Observability**: Structured JSON logs planned with CloudWatch, `/healthz` endpoint required  
✅ **Documentation**: API docs via OpenAPI, inline code documentation, spec updates

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
│   ├── app.module.ts
│   ├── main.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt.strategy.ts
│   │   ├── roles.guard.ts
│   │   └── decorators/
│   │       ├── public.decorator.ts
│   │       └── roles.decorator.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   ├── users.repository.ts
│   │   └── dto/
│   ├── subscriptions/
│   │   ├── subscriptions.module.ts
│   │   ├── subscriptions.service.ts
│   │   ├── subscriptions.controller.ts
│   │   ├── subscriptions.repository.ts
│   │   ├── subscription-participants.service.ts
│   │   └── dto/
│   ├── charges/
│   │   ├── charges.module.ts
│   │   ├── charges.service.ts
│   │   ├── charges.controller.ts
│   │   ├── charges.repository.ts
│   │   └── charge-shares.service.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   ├── health/
│   │   ├── health.module.ts
│   │   └── health.controller.ts
│   └── common/
│       ├── filters/
│       ├── interceptors/
│       └── middleware/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
│   ├── setup.ts
│   └── setupe2e.ts
└── tests/

frontend/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── models/
│   │   ├── store/
│   │   │   ├── users/
│   │   │   ├── subscriptions/
│   │   │   ├── charges/
│   │   │   └── effects/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── assets/
│   └── environments/
├── cypress/
├── tests/
│   ├── unit/
│   └── e2e/
└── karma.conf.js

infrastructure/
└── terraform/
```

**Structure Decision**: Web application with separate frontend and backend components. Backend uses NestJS with feature modules (auth, users, subscriptions, charges) following domain-driven design. Frontend uses Angular with NgRx state management organized by feature modules and smart/dumb component architecture.

## Implementation Status

### Phase 0: Research & Analysis ✅ COMPLETE
- **research.md**: Generated and updated with all technical decisions resolved
- **Database Decision**: Updated from SQLite to PostgreSQL with Docker containerization
- **Architecture Decisions**: NgRx state management, NestJS backend modules, Angular frontend components

### Phase 1: Design & Contracts ✅ COMPLETE  
- **data-model.md**: Generated with complete entity definitions for PostgreSQL schema
- **contracts/openapi.yaml**: Generated comprehensive API specification with all endpoints
- **quickstart.md**: Generated setup instructions for PostgreSQL development environment
- **Agent Context**: Updated Cursor IDE context with technical stack information

### Phase 2: Task Planning 🟡 NEXT
- **tasks.md**: Detailed implementation tasks to be generated via `/speckit.tasks` command
- **Sprint Planning**: Ready for task prioritization and parallel execution planning

## Feature Planning Addendum: Admin Creates Users (Priority)

This addendum updates the plan to include the new priority user story: Admin can create new users and share a one-time password setup link (no email sending).

Artifacts for this feature:
- Spec: `specs/001-shared-subscription-spec/feature-admin-create-user/spec.md`
- Research: `specs/001-shared-subscription-spec/feature-admin-create-user/research.md`
- Data model: `specs/001-shared-subscription-spec/feature-admin-create-user/data-model.md`
- Contracts (OpenAPI): `specs/001-shared-subscription-spec/feature-admin-create-user/contracts/openapi.yaml`
- Quickstart: `specs/001-shared-subscription-spec/feature-admin-create-user/quickstart.md`
- Checklist: `specs/001-shared-subscription-spec/feature-admin-create-user/checklists/requirements.md`

Key decisions (from spec/research):
- Provisioning uses a one-time setup link; no emails sent by the system
- Admin fills profile fields (email, name, role, status); user sets only password
- Name required; activation occurs on password set; token is single-use with expiry

Integration impacts:
- Backend: new endpoints for create user, regenerate setup link, setup-password; secure token issuance and audit events
- Frontend: Admin UI to create user and display/copy link; optional regenerate action; align with RBAC guards
- Ops/Security: token storage hashed, token expiry policy (default 48h), one-time redemption

Constitution re-check: No violations introduced. Requirements are technology-agnostic and testable; security posture preserved.

## Complexity Tracking

No violations identified. All constitution gates satisfied with proper justification for technology choices.

