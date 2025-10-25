# Data Model: CICD and AWS Hosting with Terraform

**Date**: 2025-01-22  
**Feature**: 002-cicd-aws-terraform  
**Purpose**: Define data entities and relationships for infrastructure and CI/CD pipeline

## Core Entities

### 1. CI/CD Pipeline

**Description**: Automated workflow that builds, tests, and deploys application changes

**Attributes**:
- `id`: string (unique identifier)
- `name`: string (pipeline name, e.g., "production-deploy")
- `status`: enum (pending, running, success, failed, cancelled)
- `trigger`: enum (push, manual, schedule)
- `branch`: string (source branch)
- `commit_sha`: string (git commit hash)
- `started_at`: timestamp
- `completed_at`: timestamp
- `duration_seconds`: number
- `artifacts`: array of strings (build artifacts)

**State Transitions**:
```
pending → running → success
pending → running → failed
pending → cancelled
```

**Validation Rules**:
- `name` must be unique per repository
- `commit_sha` must be valid git hash
- `started_at` must be before `completed_at`
- `duration_seconds` must be positive

### 2. Infrastructure Resource

**Description**: AWS resource managed by Terraform

**Attributes**:
- `id`: string (Terraform resource ID)
- `type`: string (AWS resource type, e.g., "aws_ecs_service")
- `name`: string (resource name)
- `status`: enum (pending, created, updated, destroyed, failed)
- `region`: string (AWS region)
- `tags`: object (key-value pairs)
- `created_at`: timestamp
- `updated_at`: timestamp
- `terraform_state`: string (current state)

**State Transitions**:
```
pending → created
pending → failed
created → updated
created → destroyed
updated → updated
```

**Validation Rules**:
- `type` must be valid AWS resource type
- `region` must be valid AWS region
- `tags` must contain required tags (Environment, Project, etc.)

### 3. Application Deployment

**Description**: Application deployment to AWS infrastructure

**Attributes**:
- `id`: string (unique identifier)
- `application_name`: string (e.g., "backend", "frontend")
- `version`: string (application version)
- `environment`: string (deployment environment)
- `infrastructure_id`: string (reference to infrastructure)
- `status`: enum (pending, deploying, deployed, failed, rolled_back)
- `deployed_at`: timestamp
- `health_check_url`: string (health check endpoint)
- `public_url`: string (public access URL)

**State Transitions**:
```
pending → deploying → deployed
pending → deploying → failed
deployed → rolled_back
```

**Validation Rules**:
- `version` must follow semantic versioning
- `environment` must be valid environment name
- `health_check_url` must be valid URL
- `public_url` must be valid URL

### 4. Terraform State

**Description**: Terraform state information for infrastructure tracking

**Attributes**:
- `id`: string (state identifier)
- `workspace`: string (Terraform workspace)
- `backend`: string (backend type, e.g., "s3")
- `backend_config`: object (backend configuration)
- `resources_count`: number (number of managed resources)
- `last_updated`: timestamp
- `terraform_version`: string (Terraform version)
- `state_file_hash`: string (state file checksum)

**Validation Rules**:
- `workspace` must be valid Terraform workspace name
- `backend` must be supported backend type
- `resources_count` must be non-negative
- `terraform_version` must be valid version string

## Relationships

### CI/CD Pipeline → Application Deployment
- **Type**: One-to-Many
- **Description**: One pipeline can create multiple deployments
- **Foreign Key**: `pipeline_id` in Application Deployment

### Infrastructure Resource → Application Deployment
- **Type**: One-to-Many
- **Description**: One infrastructure resource can host multiple deployments
- **Foreign Key**: `infrastructure_id` in Application Deployment

### Terraform State → Infrastructure Resource
- **Type**: One-to-Many
- **Description**: One state manages multiple resources
- **Foreign Key**: `state_id` in Infrastructure Resource

## Data Flow

### 1. Pipeline Execution Flow
```
Code Push → Pipeline Trigger → Test → Build → Terraform Plan → Terraform Apply → Deploy → Health Check
```

### 2. Infrastructure Provisioning Flow
```
Terraform Init → Terraform Plan → Resource Creation → State Update → Resource Validation
```

### 3. Application Deployment Flow
```
Container Build → ECR Push → ECS Update → Health Check → Public Access
```

## State Management

### Terraform State
- **Storage**: S3 bucket with versioning
- **Locking**: DynamoDB table for concurrent access control
- **Backup**: S3 versioning for state history
- **Access**: IAM roles with least privilege

### Application State
- **Storage**: ECS service state in AWS
- **Monitoring**: CloudWatch logs and basic metrics
- **Health**: Application health endpoints
- **Rollback**: Previous container version restoration

## Validation Rules

### Global Rules
- All timestamps must be in UTC
- All IDs must be UUIDs or valid AWS resource identifiers
- All URLs must be valid HTTP/HTTPS URLs
- All status enums must be from predefined lists

### Business Rules
- Only one deployment per environment at a time
- Infrastructure changes must be reviewed before application
- Failed deployments must trigger automatic rollback
- All resources must have required tags

## Data Retention

### Pipeline Data
- **Retention**: 90 days for successful runs
- **Retention**: 1 year for failed runs (for debugging)
- **Archive**: S3 for long-term storage

### Infrastructure Data
- **Retention**: Indefinite (managed by Terraform)
- **Backup**: S3 versioning and RDS snapshots
- **Cleanup**: Manual cleanup of unused resources

### Application Data
- **Retention**: 30 days for deployment logs
- **Retention**: 7 days for health check data
- **Archive**: CloudWatch logs for long-term storage
