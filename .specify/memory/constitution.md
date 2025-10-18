<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: none (initial adoption)
- Added sections: Principles (8), Governance, Gates
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ aligned (no changes required)
  - .specify/templates/spec-template.md: ⚠ pending (file missing)
  - .specify/templates/tasks-template.md: ⚠ pending (file missing)
  - .specify/templates/commands/*: ⚠ pending (no command templates present)
- Follow-up TODOs:
  - Create spec-template.md and tasks-template.md to reference constitution gates
  - Add command templates under .specify/templates/commands if needed
-->

# Project Constitution

Project Name: Shared Subscription Debt Manager

Constitution Version: 1.0.0

Ratification Date: 2025-10-17

Last Amended Date: 2025-10-17

## Principles

### 1. Simplicity First

- Prefer built-in capabilities of Angular, NestJS, and PostgreSQL over custom frameworks.
- Minimize surface area: keep modules cohesive and avoid unnecessary abstractions.
- Deliver in small, reviewable increments with clear scope and rationale.

Rationale: Simple designs reduce defects, speed onboarding, and ease maintenance.

### 2. Security by Default

- Enforce HTTPS in all environments; terminate via CloudFront/ALB.
- Hash passwords with bcrypt; never store plaintext secrets in code.
- Apply RBAC with roles `admin` and `user`; default to least privilege.
- Rate limit API endpoints; validate inputs on frontend and backend.
- Record audit logs for critical actions (payment verification, user/admin changes).
- Enable CSRF protections if cookies are used for auth.

Rationale: Protecting user data and financial actions is non-negotiable.

### 3. Testability & CI Discipline

- Unit test coverage target: ≥ 80% for backend and frontend modules.
- Integration tests for auth, subscriptions/charges, and payments flows.
- E2E tests for critical scenarios: login, subscription creation, payment creation, verification.
- All tests and linters run in CI; failing pipelines MUST block merges.

Rationale: Confidence in changes requires automated checks at multiple layers.

### 4. Infrastructure as Code

- Use Terraform for provisioning AWS (ECS/Fargate, CloudFront, S3, etc.).
- No manual changes in long-lived environments; changes flow via PR-reviewed IaC.
- Environments MUST be reproducible from code and documented variables.

Rationale: IaC ensures repeatability, reviewability, and reduces drift.

### 5. Least Privilege & Data Protection

- Scope credentials and permissions to the minimum needed per service.
- Store secrets in a managed secrets store; rotate on a defined cadence.
- Limit PII collection; sanitize logs; avoid sensitive data in traces.

Rationale: Reduces blast radius and compliance risk.

### 6. Observability

- Emit structured JSON logs; ship to CloudWatch with retention policies.
- Capture frontend and backend errors with Sentry (or equivalent).
- Expose `/healthz` for liveness; add readiness if applicable.
- Configure alerts for error rates, latency, and job failures.
- Schedule automated PostgreSQL database backups with retention and recovery procedures using AWS RDS snapshots.

Rationale: Issues must be detectable, diagnosable, and recoverable.

### 7. Documentation & Traceability

- Each PR includes a problem statement, approach, and acceptance criteria.
- Update API docs and user-facing docs with behavior changes.
- Link issues/tasks and record decisions in the spec or PR description.

Rationale: Clear documentation enables shared understanding and long-term continuity.

### 8. Change Management

- All changes via PR; require at least one approval (Product Owner or Tech Lead).
- Include spec deltas and rationale for governance-impacting changes.
- When this constitution changes, update version and dates per Governance.

Rationale: Structured review improves quality and accountability.

## Governance

### Versioning Policy (SemVer)

- MAJOR: Backward-incompatible governance or principle removal/redefinition.
- MINOR: New principle/section added or materially expanded guidance.
- PATCH: Clarifications, wording, or non-semantic refinements.

### Amendment Procedure

1. Open a PR proposing constitution changes with a diff summary and rationale.
2. Update `Constitution Version`, `Last Amended Date` (YYYY-MM-DD), and Sync Impact Report.
3. Obtain approval from Product Owner or Tech Lead.
4. After merge, align referenced templates and docs per the Sync Impact Report.

### Compliance Review

- CI gates MUST enforce lint, tests, and coverage thresholds.
- Releases require verification that Gates are satisfied in the feature plan.
- Periodic review (e.g., quarterly) to ensure principles remain appropriate.

## Gates (Constitution Check)

- Lint/type checks passing in CI for all changed packages.
- Unit test coverage ≥ 80% across backend and frontend changed areas.
- Integration tests for: auth, subscriptions/charges, payments endpoints.
- E2E tests for: login, subscription creation, payment creation & verification.
- Security: HTTPS enforced; RBAC in place; rate limiting configured; audit logs enabled.
- Observability: `/healthz` exposed; structured logs; Sentry configured; alerts defined.
- Documentation: API docs and spec updated for behavior/config changes.

# [PROJECT_NAME] Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
[PRINCIPLE_3_DESCRIPTION]
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### [PRINCIPLE_4_NAME]
<!-- Example: IV. Integration Testing -->
[PRINCIPLE_4_DESCRIPTION]
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### [PRINCIPLE_5_NAME]
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
[PRINCIPLE_5_DESCRIPTION]
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
