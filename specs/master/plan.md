# Implementation Plan: CICD and AWS Hosting with Terraform

**Branch**: `002-cicd-aws-terraform` | **Date**: 2025-01-22 | **Spec**: `/specs/002-cicd-aws-terraform/spec.md`
**Input**: Feature specification from `/specs/002-cicd-aws-terraform/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Implement automated CI/CD pipeline with AWS infrastructure provisioning using Terraform for a simple, cost-effective deployment solution.

**Technical Approach**: 
- Simple ECS with public IP (no ALB) for direct access
- Public RDS access for maximum simplicity
- Basic security groups with HTTPS only
- Minimal monitoring with application-level logging
- Stop-and-start deployments with brief downtime acceptable

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript/Node.js (backend), TypeScript/Angular (frontend)  
**Primary Dependencies**: NestJS, Angular, Terraform, AWS SDK, Docker  
**Storage**: PostgreSQL (RDS), S3 (static assets)  
**Testing**: Jest (backend), Jasmine/Karma (frontend), Terraform testing  
**Target Platform**: AWS (ECS Fargate, CloudFront, RDS)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: <15 min CI/CD pipeline, <10 min infrastructure provisioning  
**Constraints**: Simple infrastructure, minimal monitoring, brief downtime acceptable  
**Scale/Scope**: Single production environment, low traffic expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gates ✅
- **Infrastructure as Code**: ✅ Terraform for AWS provisioning
- **Security by Default**: ✅ HTTPS enforcement via CloudFront, basic security groups
- **Simplicity First**: ✅ Simple ECS with public IP, minimal monitoring
- **Testability & CI**: ✅ Automated testing in CI/CD pipeline
- **Observability**: ✅ Minimal application-level logging
- **Least Privilege**: ✅ IAM roles with minimal permissions
- **Documentation**: ✅ Terraform documentation and CI/CD pipeline docs

### Post-Design Gates ✅
- **Lint/type checks**: ✅ Configured in CI/CD pipeline
- **Unit test coverage ≥80%**: ✅ Jest/Jasmine testing framework configured
- **Integration tests**: ✅ E2E tests for critical flows
- **E2E tests**: ✅ Cypress configured for frontend, Jest for backend
- **Security**: ✅ HTTPS enforced via CloudFront, basic security groups, IAM roles
- **Observability**: ✅ `/healthz` endpoint, CloudWatch logs, basic monitoring
- **Documentation**: ✅ API contracts, quickstart guide, Terraform docs

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
backend/
├── src/
│   ├── auth/
│   ├── charges/
│   ├── payments/
│   ├── subscriptions/
│   ├── users/
│   └── common/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── Dockerfile

frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── shared/
│   └── assets/
├── tests/
│   ├── unit/
│   └── e2e/
└── Dockerfile

infrastructure/
└── terraform/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    ├── ecs.tf
    ├── rds.tf
    ├── s3.tf
    ├── cloudfront.tf
    ├── iam.tf
    └── vpc.tf

.github/
└── workflows/
    ├── ci.yml
    └── deploy.yml
```

**Structure Decision**: Web application structure selected based on frontend + backend detection. Existing structure maintained with infrastructure/terraform directory for IaC and .github/workflows for CI/CD pipeline.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

