# Quickstart: CICD and AWS Hosting with Terraform

**Feature**: 002-cicd-aws-terraform  
**Date**: 2025-01-22

## Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform 1.5+ installed
- Docker installed for container builds
- GitHub repository with Actions enabled
- Node.js 18+ for local development

## Infrastructure Setup

### 1. Clone and Setup Repository

```bash
git clone <repository-url>
cd spotAccount
git checkout 002-cicd-aws-terraform
```

### 2. Configure AWS Credentials

Set up AWS credentials for Terraform and GitHub Actions:

```bash
# For local development
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region (us-east-1)
```

For GitHub Actions, add the following secrets to your repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DATABASE_URL` (encrypted PostgreSQL connection string)
- `JWT_SECRET` (encrypted JWT signing secret)
- `ECR_REGISTRY` (ECR repository URL)

### 3. Initialize Terraform

```bash
cd infrastructure/terraform
terraform init
```

This will:
- Download AWS provider plugins
- Initialize remote state storage (S3 bucket)
- Set up state locking (DynamoDB table)

### 4. Review Infrastructure Plan

```bash
terraform plan -var-file="production.tfvars"
```

Review the plan to ensure all AWS resources will be created correctly:
- VPC with public/private subnets
- ECS cluster for Fargate
- RDS PostgreSQL database
- S3 bucket for frontend hosting
- CloudFront distribution
- Application Load Balancer

### 5. Apply Infrastructure

```bash
terraform apply -var-file="production.tfvars"
```

This will create all AWS resources. The process should complete within 10 minutes.

### 6. Configure CI/CD Pipeline

The GitHub Actions workflows are already configured in `.github/workflows/`. The pipeline will:

1. **CI Pipeline** (`ci.yml`):
   - Run tests and linting on code changes
   - Build and test backend and frontend
   - Perform security scanning with Trivy

2. **Deploy Pipeline** (`deploy.yml`):
   - Build Docker images for backend
   - Build frontend static files
   - Update Terraform infrastructure if needed
   - Deploy to AWS Fargate and S3
   - Run database migrations
   - Perform health checks

## Deployment Workflow

### Automatic Deployment

1. **Push to main branch**: Triggers automatic deployment
2. **Pipeline stages**:
   - Build and test applications
   - Build Docker containers
   - Run Terraform plan to check infrastructure changes
   - Deploy new version using blue-green strategy
   - Run health checks and rollback if needed

### Manual Deployment

If you need to trigger a deployment manually:

1. Go to GitHub Actions tab in your repository
2. Select "Deploy to AWS" workflow
3. Click "Run workflow" button
4. Monitor the pipeline execution

### Infrastructure Updates

To update infrastructure:

1. Modify Terraform files in `infrastructure/terraform/`
2. Test locally: `terraform plan -var-file="production.tfvars"`
3. Commit and push changes to main branch
4. CI/CD pipeline will automatically apply infrastructure changes

## Monitoring and Troubleshooting

### Health Checks

- **Application Health**: `https://your-domain.com/api/health`
- **Infrastructure**: Check AWS CloudWatch metrics
- **CI/CD**: Monitor GitHub Actions dashboard

### Common Issues

**Deployment Failures**:
1. Check GitHub Actions logs for error details
2. Verify AWS credentials and permissions
3. Ensure all required secrets are configured
4. Check AWS resource limits and quotas

**Infrastructure Issues**:
1. Run `terraform plan` to detect configuration drift
2. Check AWS CloudWatch logs for service issues
3. Verify security group and VPC configuration
4. Ensure RDS database is accessible from ECS tasks

**Rollback Procedure**:
1. Automatic rollback occurs if health checks fail
2. Manual rollback: Revert to previous commit and push to trigger redeployment
3. Database rollbacks: Use RDS point-in-time recovery if needed

## Configuration Files

### Terraform Variables (`production.tfvars`)

```hcl
aws_region = "us-east-1"
environment = "production"
app_name = "spotaccount"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.20.0/24"]

# ECS Configuration
backend_cpu = "512"
backend_memory = "1024"
backend_desired_count = 2

# RDS Configuration
db_instance_class = "db.t3.micro"
db_allocated_storage = 20
```

### Environment Variables

Backend environment variables (set in GitHub Actions secrets):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: production

Frontend environment variables:
- `API_BASE_URL`: Backend API URL (automatically set during deployment)

## Security Considerations

- All secrets stored as encrypted environment variables in GitHub Actions
- IAM roles follow least privilege principle
- VPC security groups restrict network access
- HTTPS enforced at CloudFront and ALB level
- Database connections encrypted in transit
- Regular security scanning in CI/CD pipeline

## Cost Optimization

- ECS Fargate scales to zero when not in use
- RDS uses db.t3.micro instance for development scale
- S3 and CloudFront have built-in cost optimization
- CloudWatch logs have retention policies set
- ECR image lifecycle policies clean up old images

## Next Steps

After infrastructure is deployed:

1. **Verify Deployment**: Test application functionality
2. **Monitor Metrics**: Set up CloudWatch alarms for key metrics
3. **Documentation**: Update team documentation with deployment URLs
4. **Backup Testing**: Verify RDS automated backups work correctly

For troubleshooting and advanced configuration, refer to the main specification document and AWS documentation.
