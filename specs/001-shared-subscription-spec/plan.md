# Implementation Plan: Shared Subscription Debt Manager

**Branch**: `001-shared-subscription-spec` | **Date**: 2025-10-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-shared-subscription-spec/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Build a shared subscription debt manager for small groups (5-20 users) to automate debt tracking, calculations, and reimbursements for shared subscriptions.

**Technical Approach**: 
- **Backend**: NestJS with TypeScript, PostgreSQL database, Prisma ORM
- **Frontend**: Angular 17+ SPA with NgRx state management, smart/dumb component architecture
- **State Management**: NgRx with feature-based modules, effects for HTTP calls, selectors for viewmodels
- **Infrastructure**: AWS Fargate + S3+CloudFront, AWS RDS PostgreSQL, Terraform IaC, GitHub Actions CI/CD
- **Architecture**: Modular web application with REST API, JWT authentication, RBAC, no state persistence
- **Testing**: 80% coverage with Jest (unit/integration) and Cypress (E2E)
- **Development**: Docker Compose with PostgreSQL for local development consistency

## Technical Context

**Language/Version**: Node.js 18+ (backend), TypeScript 5+ (frontend)  
**Primary Dependencies**: NestJS (backend), Angular 17+ (frontend), NgRx (state management), Prisma (ORM), PostgreSQL (database)  
**Storage**: PostgreSQL with AWS RDS for production, Docker Compose for development  
**Testing**: Jest (unit/integration), Cypress (E2E), 80% coverage requirement  
**Target Platform**: AWS Fargate (backend), S3+CloudFront (frontend), AWS RDS PostgreSQL (database)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 2-second response time, 99% uptime during business hours  
**Constraints**: 100 total users, 20 users per subscription, last-write-wins concurrency, no state persistence  
**Scale/Scope**: Small group financial application with shared subscription management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Compliance Status**: ✅ PASSED

**Gates Verified**:
- ✅ **Simplicity First**: Using built-in Angular, NestJS, and PostgreSQL capabilities
- ✅ **Security by Default**: HTTPS via CloudFront, bcrypt password hashing, RBAC with admin/user roles, rate limiting, audit logs, CSRF protection
- ✅ **Testability & CI Discipline**: 80% test coverage, integration tests for auth/subscriptions/payments, E2E tests for critical flows, CI pipeline with linting
- ✅ **Infrastructure as Code**: Terraform for AWS provisioning (ECS/Fargate, CloudFront, S3)
- ✅ **Least Privilege & Data Protection**: Minimal permissions, secrets management, PII protection
- ✅ **Observability**: Structured JSON logs, CloudWatch integration, Sentry error tracking, /healthz endpoint, automated PostgreSQL backups via AWS RDS
- ✅ **Documentation & Traceability**: PR requirements, API docs, spec updates
- ✅ **Change Management**: PR approval process, spec deltas for governance changes

**No Constitution Violations Detected**

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
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── subscriptions/  # Subscription management
│   ├── charges/        # Charge generation
│   ├── payments/       # Payment processing
│   ├── reports/        # Reporting
│   ├── common/         # Shared utilities
│   └── database/       # Database configuration
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
└── tests/              # Test files

frontend/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable components
│   │   │   ├── subscription-form/
│   │   │   ├── user-form/
│   │   │   ├── payment-form/
│   │   │   ├── balance-card/
│   │   │   └── pending-payments-table/
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── subscriptions/
│   │   │   │   ├── payments/
│   │   │   │   ├── users/
│   │   │   │   └── reports/
│   │   │   └── user/       # User pages
│   │   │       ├── login/
│   │   │       ├── account/
│   │   │       ├── payments/
│   │   │       └── history/
│   │   ├── store/          # NgRx state management
│   │   │   ├── auth/
│   │   │   ├── subscriptions/
│   │   │   ├── payments/
│   │   │   ├── reports/
│   │   │   └── ui/
│   │   ├── services/       # API services
│   │   ├── guards/         # Route guards
│   │   └── models/         # TypeScript models
│   ├── assets/             # Static assets
│   └── environments/       # Environment configs
├── tests/
│   ├── unit/
│   └── e2e/
└── package.json

infrastructure/
└── terraform/           # Infrastructure as Code
```

**Structure Decision**: Web application with separate backend (NestJS) and frontend (Angular) directories, plus infrastructure (Terraform) for AWS deployment. Backend follows NestJS module structure with feature-based organization. Frontend follows Angular best practices with NgRx state management, smart/dumb component architecture, and role-based page organization.

## Phase 1 Completion Summary

**Research Phase**: ✅ COMPLETED
- All technical decisions resolved in `research.md`
- Technology stack confirmed: NestJS + Angular + NgRx + PostgreSQL + Prisma
- Architecture patterns established: modular backend, component-based frontend
- Security, performance, and testing strategies defined

**Design Phase**: ✅ COMPLETED
- Data model defined in `data-model.md` with all entities and relationships
- API contracts generated in `contracts/openapi.yaml` with full REST API specification
- Quickstart guide created in `quickstart.md` with development setup instructions
- Agent context updated for Cursor IDE integration

**Constitution Check Re-evaluation**: ✅ PASSED
- All gates remain satisfied after design phase
- No new violations introduced
- Design decisions align with constitution principles
- Ready for task generation phase

## Complexity Tracking

*No constitution violations detected - all design decisions align with established principles*

