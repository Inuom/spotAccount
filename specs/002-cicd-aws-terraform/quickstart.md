# Quickstart: CICD and AWS Hosting with Terraform

**Feature**: 002-cicd-aws-terraform  
**Date**: 2025-01-22

## Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform 1.5+ installed
- GitHub repository with Actions enabled
- Docker installed for local testing

## Quick Setup

### 1. Infrastructure Provisioning

```bash
# Navigate to infrastructure directory
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review planned changes
terraform plan -var-file="production.tfvars"

# Apply infrastructure (requires approval)
terraform apply -var-file="production.tfvars"
```

### 2. CI/CD Pipeline Setup

```bash
# Configure GitHub secrets
# Add the following secrets in GitHub repository settings:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - DATABASE_URL
# - JWT_SECRET
# - ECR_REGISTRY
```

### 3. Test Deployment

```bash
# Push changes to main branch to trigger pipeline
git add .
git commit -m "feat: add CI/CD pipeline configuration"
git push origin main

# Monitor pipeline execution
# Check GitHub Actions tab for pipeline status
```

## Verification Steps

### Infrastructure Verification

1. **Check AWS Console**:
   - ECS Cluster: Verify Fargate cluster is running
   - RDS Database: Confirm PostgreSQL instance is available
   - S3 Buckets: Verify frontend hosting bucket exists
   - CloudFront: Check distribution is active

2. **Test Application Access**:
   - Frontend: Visit CloudFront distribution URL
   - Backend: Test API endpoints via ALB
   - Health Check: Verify `/healthz` endpoint responds

### CI/CD Pipeline Verification

1. **Pipeline Execution**:
   - Check GitHub Actions for successful runs
   - Verify all stages complete within 15 minutes
   - Confirm zero-downtime deployments

2. **Artifact Verification**:
   - ECR: Verify Docker images are pushed
   - S3: Check frontend files are deployed
   - Logs: Review CloudWatch logs for errors

## Troubleshooting

### Common Issues

**Pipeline Timeout**:
- Check AWS resource limits
- Verify IAM permissions
- Review Terraform state conflicts

**Deployment Failures**:
- Check health check endpoints
- Verify environment variables
- Review application logs in CloudWatch

**Infrastructure Issues**:
- Run `terraform plan` to check for drift
- Verify AWS service limits
- Check VPC and security group configurations

### Debug Commands

```bash
# Check Terraform state
terraform show

# View pipeline logs
gh run list --limit 10
gh run view [run-id]

# Test infrastructure connectivity
aws ecs list-clusters
aws rds describe-db-instances
aws s3 ls
```

## Next Steps

1. **Monitor Performance**: Set up CloudWatch alarms for key metrics
2. **Security Review**: Regular security scanning and updates
3. **Backup Testing**: Verify RDS backup and recovery procedures
4. **Documentation**: Update operational runbooks

## Support

- **Issues**: Create GitHub issues for bugs or feature requests
- **Documentation**: Refer to spec.md and plan.md for detailed requirements
- **Monitoring**: Check CloudWatch dashboards for system health