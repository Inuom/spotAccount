# Data Model: CICD and AWS Hosting with Terraform

**Feature**: 002-cicd-aws-terraform  
**Date**: 2025-01-22

## Infrastructure Entities

### CI/CD Pipeline
**Description**: Automated workflow that builds, tests, and deploys application changes

**Attributes**:
- `id`: Unique pipeline identifier (GitHub Actions workflow run ID)
- `name`: Pipeline name (e.g., "deploy-production")
- `status`: Current status (pending, running, succeeded, failed, cancelled)
- `trigger`: Trigger source (push, pull_request, manual)
- `branch`: Source branch name
- `started_at`: Pipeline execution start timestamp
- `completed_at`: Pipeline execution completion timestamp
- `duration`: Total execution time in seconds
- `commit_sha`: Git commit hash that triggered the pipeline
- `artifacts`: Built application artifacts (Docker images, static files)
- `environment`: Target deployment environment (production)

**State Transitions**:
- `pending` → `running` (when pipeline starts execution)
- `running` → `succeeded` (when all stages complete successfully)
- `running` → `failed` (when any stage fails)
- `running` → `cancelled` (when pipeline is manually cancelled)

**Validation Rules**:
- Duration must be ≤ 900 seconds (15 minutes) per SC-001
- Only one pipeline per environment can run concurrently (FR-016)

### Terraform Configuration
**Description**: Infrastructure as code definitions that provision AWS resources

**Attributes**:
- `version`: Terraform version (1.5+)
- `provider`: AWS provider version and region
- `state_location`: Remote state storage location (S3 bucket)
- `workspace`: Terraform workspace name (production)
- `resources`: List of AWS resources to be managed
- `variables`: Input variables and their values
- `outputs`: Resource outputs and their values
- `last_applied`: Timestamp of last successful terraform apply
- `plan_hash`: Hash of last terraform plan for change detection

**Resources Managed**:
- `aws_vpc`: Virtual Private Cloud for network isolation
- `aws_subnet`: Public and private subnets
- `aws_security_group`: Network access rules
- `aws_ecs_cluster`: ECS cluster for Fargate
- `aws_ecs_service`: ECS service configuration
- `aws_rds_instance`: PostgreSQL database instance
- `aws_s3_bucket`: Static website hosting
- `aws_cloudfront_distribution`: CDN configuration
- `aws_lb`: Application Load Balancer
- `aws_iam_role`: IAM roles and policies

**Validation Rules**:
- All resources must follow naming conventions for consistency
- State must be stored remotely in S3 with versioning and encryption
- Apply operations must complete within 600 seconds (10 minutes) per SC-002

### AWS Environment
**Description**: Production deployment target with specific configuration

**Attributes**:
- `name`: Environment identifier (production)
- `region`: AWS region (us-east-1)
- `vpc_id`: VPC identifier for network isolation
- `subnet_ids`: List of subnet IDs (public/private)
- `security_groups`: List of security group IDs
- `ecs_cluster_arn`: ECS cluster ARN for backend hosting
- `rds_endpoint`: RDS PostgreSQL database endpoint
- `s3_bucket_name`: S3 bucket name for frontend hosting
- `cloudfront_distribution_id`: CloudFront distribution ID
- `load_balancer_dns`: ALB DNS name for backend access
- `created_at`: Environment creation timestamp
- `last_deployment`: Last successful deployment timestamp

**Configuration**:
- `backend_image`: Docker image URI for backend service
- `frontend_bucket`: S3 bucket containing built frontend files
- `database_url`: Encrypted database connection string
- `environment_variables`: Application-specific environment variables

**Validation Rules**:
- Environment must be in single region for consistency
- All resources must be tagged with environment name
- Database must have automated backups and Multi-AZ enabled

### Application Artifacts
**Description**: Built and packaged application components ready for deployment

**Attributes**:
- `type`: Artifact type (backend_image, frontend_files)
- `name`: Artifact name/identifier
- `version`: Version tag or commit hash
- `size`: Artifact size in bytes
- `checksum`: SHA256 checksum for integrity verification
- `created_at`: Build creation timestamp
- `registry_location`: Storage location (ECR for images, S3 for files)
- `build_pipeline_id`: CI/CD pipeline ID that created the artifact

**Backend Artifact**:
- `docker_image_uri`: ECR repository URI with tag
- `docker_image_size`: Container image size
- `environment_variables`: Runtime environment configuration
- `health_check_path`: Health check endpoint path (/healthz)

**Frontend Artifact**:
- `s3_bucket`: S3 bucket containing built files
- `s3_key_prefix`: S3 key prefix for the build
- `file_count`: Number of static files
- `index_file`: Main index.html file location

**Validation Rules**:
- Backend artifacts must include health check endpoint
- Frontend artifacts must include index.html in root directory
- All artifacts must pass security scanning before deployment

## Configuration Management

### Environment Variables
**Backend Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string (encrypted)
- `JWT_SECRET`: JWT signing secret (encrypted)
- `NODE_ENV`: Environment mode (production)
- `PORT`: Application port (3000)

**Frontend Environment Variables**:
- `API_BASE_URL`: Backend API base URL
- `ENVIRONMENT`: Environment identifier

### Secrets Management
**Secret Sources**: GitHub Actions encrypted secrets
**Secret Types**:
- `AWS_ACCESS_KEY_ID`: AWS access key for deployment
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for deployment
- `DATABASE_URL`: Encrypted database connection string
- `JWT_SECRET`: Encrypted JWT signing secret
- `ECR_REGISTRY`: ECR repository URL for Docker images

## State Management

### Terraform State
- **Location**: S3 bucket with versioning and encryption
- **Locking**: DynamoDB table for state lock management
- **Access**: IAM roles with least privilege access to state

### CI/CD State
- **Artifacts**: GitHub Actions artifacts with 90-day retention
- **Logs**: GitHub Actions logs with standard retention policies
- **Cache**: GitHub Actions cache for build dependencies

## Deployment Flow

1. **Code Commit** → Triggers CI/CD pipeline
2. **Build Stage** → Creates application artifacts
3. **Test Stage** → Validates application functionality
4. **Infrastructure Stage** → Terraform plan and apply
5. **Deploy Stage** → Blue-green deployment to AWS
6. **Validation Stage** → Health checks and rollback if needed