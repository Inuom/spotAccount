# Implementation Plan: CICD and AWS Hosting with Terraform

**Branch**: `002-cicd-aws-terraform` | **Date**: 2025-01-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-cicd-aws-terraform/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement automated CI/CD pipeline using GitHub Actions and AWS infrastructure provisioning using Terraform for the Shared Subscription Debt Manager application. The system will automatically build, test, and deploy the application to AWS Fargate (backend) and S3+CloudFront (frontend) with PostgreSQL RDS database, ensuring zero-downtime deployments with proper rollback capabilities.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Node.js 18+, TypeScript, Terraform 1.5+, YAML (GitHub Actions)  
**Primary Dependencies**: GitHub Actions, AWS CLI, Docker, Terraform, AWS ECS/Fargate, AWS RDS PostgreSQL, AWS S3, AWS CloudFront  
**Storage**: AWS RDS PostgreSQL with automated backups and point-in-time recovery  
**Testing**: Jest (backend), Karma/Jasmine (frontend), Cypress (E2E), Trivy (security scanning)  
**Target Platform**: AWS (Fargate for backend, S3+CloudFront for frontend, RDS for database)  
**Project Type**: Web application (frontend + backend + infrastructure)  
**Performance Goals**: CI/CD pipeline completion < 15 minutes, infrastructure provisioning < 10 minutes, 99% pipeline success rate  
**Constraints**: Production-only environment, encrypted environment variables for secrets, automatic rollback on failures, concurrent deployment blocking  
**Scale/Scope**: Small group application (< 100 total users, 5-20 per subscription)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Infrastructure as Code Compliance
- ✅ **Terraform for AWS provisioning**: All AWS resources (ECS/Fargate, CloudFront, S3, RDS) defined using Terraform
- ✅ **No manual environment changes**: All infrastructure changes flow via PR-reviewed Terraform
- ✅ **Reproducible environments**: Terraform configuration ensures production environment reproducibility

### Security by Default Compliance  
- ✅ **HTTPS enforcement**: CloudFront and ALB provide SSL termination
- ✅ **Secret management**: Encrypted environment variables in CI/CD (simplified approach chosen)
- ✅ **Least privilege**: IAM roles and policies following least privilege principles
- ✅ **Network security**: VPC with public/private subnets and proper security groups

### Testability & CI Discipline Compliance
- ✅ **CI/CD pipeline**: GitHub Actions with automated testing, linting, security scanning
- ✅ **Test coverage target**: Maintains ≥ 80% coverage requirement through existing test suite
- ✅ **Pipeline gates**: All tests and linters run in CI with blocking on failures

### Observability Compliance
- ✅ **Structured logging**: JSON logs to CloudWatch with retention policies  
- ✅ **Health checks**: `/healthz` endpoint for application monitoring
- ✅ **Database backups**: Automated RDS snapshots and point-in-time recovery

### Change Management Compliance
- ✅ **PR-based changes**: All infrastructure changes via PR review process
- ✅ **Documentation**: Clear specification and implementation plan maintained

## Project Structure

### Documentation (this feature)

```
specs/002-cicd-aws-terraform/
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
backend/                 # Existing NestJS backend
├── src/                 # Source code (existing)
├── tests/               # Test files (existing)
├── Dockerfile           # Container for Fargate deployment
└── dist/                # Built application

frontend/                # Existing Angular frontend  
├── src/                 # Source code (existing)
├── tests/               # Test files (existing)
├── dist/                # Built static files for S3
└── Dockerfile           # Optional build container

infrastructure/          # NEW: Infrastructure as Code
└── terraform/
    ├── main.tf          # Main Terraform configuration
    ├── variables.tf     # Input variables
    ├── outputs.tf       # Resource outputs
    ├── vpc.tf           # VPC and networking
    ├── ecs.tf           # ECS/Fargate resources
    ├── rds.tf           # RDS PostgreSQL
    ├── s3.tf            # S3 buckets for frontend
    ├── cloudfront.tf    # CloudFront distribution
    └── production.tfvars # Production environment variables

.github/workflows/       # EXISTING: CI/CD pipelines
├── ci.yml              # Testing, linting, security scanning
└── deploy.yml          # AWS deployment (to be enhanced)
```

**Structure Decision**: Web application structure with existing backend and frontend directories, plus new infrastructure directory for Terraform configurations. The CI/CD workflows will be enhanced in the existing .github/workflows directory. This maintains separation of concerns while adding the missing infrastructure and deployment automation layer.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

