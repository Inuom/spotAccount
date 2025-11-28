# Archived Terraform Configuration Files

## Purpose

This directory contains Terraform configuration files from the previous infrastructure setup that are no longer used in the simplified EC2-based deployment.

## Archived Files (Manual Action Required)

The following files should be moved to this directory as they are no longer needed:

### Files to Archive:
- `../ecs.tf` - ECS Fargate cluster configuration (replaced by EC2 instance)
- `../rds.tf` - RDS PostgreSQL configuration (replaced by PostgreSQL container)
- `../cloudfront.tf` - CloudFront CDN configuration (replaced by nginx reverse proxy)
- `../logs.tf` - CloudWatch logs configuration (now managed in EC2)
- `../vpc.tf` - Custom VPC configuration (now using default VPC)
- `../vpc-module/` - VPC module (no longer needed)
- `../ecr.tf` - Can be kept if ECR is still used, or archived if moving to Docker Hub

### Files to Keep:
- `../main.tf` - Updated for EC2 deployment
- `../variables.tf` - Updated with EC2 variables
- `../outputs.tf` - Updated with EC2 outputs
- `../security-groups.tf` - Updated for EC2 security
- `../iam.tf` - Updated for EC2 IAM roles
- `../ec2.tf` - New EC2 instance configuration
- `../user-data.sh` - EC2 initialization script
- `../state.tf` - Terraform state backend (unchanged)
- `../production.tfvars` - May need updating for EC2 variables

## Migration Notes

**Date**: 2024-11-20  
**Change ID**: simplify-aws-to-ec2  
**Reason**: Cost optimization and infrastructure simplification

### Previous Architecture:
- ECS Fargate for container orchestration
- RDS PostgreSQL managed database
- CloudFront + S3 for frontend CDN
- Custom VPC with public/private subnets
- **Monthly Cost**: ~€70

### New Architecture:
- Single EC2 instance (t3.micro or t3.small)
- PostgreSQL in Docker container
- Nginx reverse proxy for frontend/backend
- Default VPC with public subnet
- **Monthly Cost**: ~€10-15 (80% reduction)

### Breaking Changes:
- No high availability (single instance)
- No auto-scaling
- Database backups require manual setup
- Manual DNS configuration required

## Rollback Instructions

If you need to restore the previous infrastructure:

1. Copy the archived files back to the `infrastructure/terraform/` directory
2. Restore the previous `variables.tf`, `outputs.tf`, and `main.tf`
3. Update `production.tfvars` with ECS/RDS values
4. Run `terraform init` and `terraform apply`

**Note**: The Terraform state in S3 should still contain the history if the previous infrastructure wasn't destroyed yet.

## Cleanup Checklist

After confirming the new EC2 infrastructure is stable:

- [ ] Move old .tf files to this archive directory
- [ ] Update production.tfvars with EC2-specific variables
- [ ] Remove old GitHub Actions workflows (if any reference ECS/RDS)
- [ ] Clean up old Docker build workflows
- [ ] Update project README with new architecture
- [ ] Document new deployment process
- [ ] Remove references to ECS/RDS from documentation

## Historical Reference

These files are preserved for:
- Historical reference
- Learning from previous architecture decisions
- Potential future scaling needs
- Disaster recovery planning

Do not delete these files immediately. Keep them for at least 3-6 months after confirming the new infrastructure is stable and meets all requirements.

