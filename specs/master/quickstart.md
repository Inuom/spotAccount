# Quick Start: CICD and AWS Hosting with Terraform

**Date**: 2025-01-22  
**Feature**: 002-cicd-aws-terraform  
**Purpose**: Get the CI/CD pipeline and AWS infrastructure up and running quickly

## Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform >= 1.0 installed
- Docker installed
- GitHub repository with GitHub Actions enabled
- AWS account with required services enabled (ECS, RDS, S3, CloudFront)

## Quick Setup (15 minutes)

### 1. Infrastructure Setup (5 minutes)

```bash
# Navigate to infrastructure directory
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply infrastructure (this will take ~10 minutes)
terraform apply
```

**Expected Output**: 
- ECS cluster with Fargate service
- RDS PostgreSQL database
- S3 buckets for frontend and state
- CloudFront distribution
- VPC with public subnets
- Security groups configured

### 2. CI/CD Pipeline Setup (5 minutes)

```bash
# The GitHub Actions workflow is already configured
# Just push to main branch to trigger the pipeline

git add .
git commit -m "feat: add CI/CD pipeline"
git push origin main
```

**Expected Output**:
- Pipeline triggers automatically
- Tests run and pass
- Application builds successfully
- Infrastructure provisions
- Application deploys to ECS

### 3. Verify Deployment (5 minutes)

```bash
# Get the public IP of your ECS service
aws ecs describe-services --cluster spotaccount-cluster --services spotaccount-service

# Check application health
curl https://your-ecs-public-ip:3000/health

# Check CloudFront distribution
curl https://your-cloudfront-domain.com
```

**Expected Output**:
- ECS service running with public IP
- Application responding on health endpoint
- Frontend accessible via CloudFront

## Configuration

### Environment Variables

Set these in your GitHub repository secrets:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-west-1

# Database Configuration
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/database
DATABASE_PASSWORD=your-db-password

# Application Configuration
NODE_ENV=production
PORT=3000
```

### Terraform Variables

Create `production.tfvars`:

```hcl
# Project Configuration
project_name = "spotaccount"
environment = "production"
aws_region = "eu-west-1"

# Application Configuration
app_port = 3000
app_health_check_path = "/health"

# Database Configuration
db_instance_class = "db.t3.micro"
db_allocated_storage = 20

# ECS Configuration
ecs_desired_count = 1
ecs_cpu = 256
ecs_memory = 512
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   AWS ECS       │    │   AWS RDS       │
│   Actions       │───▶│   Fargate       │───▶│   PostgreSQL    │
│   CI/CD         │    │   (Public IP)   │    │   (Public)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   AWS S3        │    │   CloudFront    │
│   Frontend      │◀───│   Distribution  │
│   Hosting       │    │   (Global CDN)  │
└─────────────────┘    └─────────────────┘
```

## Key Components

### 1. ECS Service (Backend)
- **Type**: Fargate with public IP
- **Port**: 3000 (HTTP/HTTPS)
- **Access**: Direct public IP access
- **Scaling**: Manual (1 instance)

### 2. RDS Database
- **Type**: PostgreSQL 15.7
- **Access**: Public with security groups
- **Backup**: Automated daily backups
- **Storage**: 20GB with auto-scaling

### 3. S3 + CloudFront (Frontend)
- **Storage**: S3 bucket for static assets
- **CDN**: CloudFront for global distribution
- **HTTPS**: Enforced via CloudFront
- **Caching**: Optimized for static content

### 4. CI/CD Pipeline
- **Trigger**: Push to main branch
- **Stages**: Test → Build → Deploy
- **Duration**: <15 minutes
- **Rollback**: Automatic on failure

## Common Tasks

### Deploy New Version

```bash
# Make changes to your code
git add .
git commit -m "feat: new feature"
git push origin main

# Pipeline runs automatically
# Check status in GitHub Actions tab
```

### Update Infrastructure

```bash
# Modify Terraform files
cd infrastructure/terraform
terraform plan
terraform apply

# Changes are applied automatically
```

### Check Application Logs

```bash
# View ECS service logs
aws logs describe-log-groups --log-group-name-prefix /aws/ecs/spotaccount

# View specific log stream
aws logs get-log-events --log-group-name /aws/ecs/spotaccount-production --log-stream-name your-stream-name
```

### Scale Application

```bash
# Update desired count in Terraform
# Or use AWS CLI
aws ecs update-service --cluster spotaccount-cluster --service spotaccount-service --desired-count 2
```

## Troubleshooting

### Pipeline Fails

1. **Check GitHub Actions logs**
2. **Verify AWS credentials**
3. **Check Terraform state**
4. **Review resource limits**

### Application Not Accessible

1. **Check ECS service status**
2. **Verify security groups**
3. **Check public IP assignment**
4. **Review application logs**

### Database Connection Issues

1. **Verify RDS endpoint**
2. **Check security groups**
3. **Confirm database credentials**
4. **Test connection from ECS**

### Frontend Not Loading

1. **Check S3 bucket configuration**
2. **Verify CloudFront distribution**
3. **Check SSL certificate**
4. **Review caching settings**

## Security Considerations

- **HTTPS**: Enforced via CloudFront
- **Security Groups**: Restrict access to necessary ports
- **IAM Roles**: Least privilege access
- **Secrets**: Stored in GitHub Secrets
- **Database**: SSL encryption in transit

## Cost Optimization

- **ECS Fargate**: Pay-per-use pricing
- **RDS**: Single-AZ deployment
- **S3**: Standard storage class
- **CloudFront**: Pay-per-request
- **No ALB**: Direct ECS access saves ~$16/month

## Next Steps

1. **Monitor**: Set up basic CloudWatch monitoring
2. **Backup**: Configure automated RDS backups
3. **Security**: Review and tighten security groups
4. **Performance**: Optimize application and database
5. **Scaling**: Implement auto-scaling if needed

## Support

- **Documentation**: Check project README
- **Issues**: Create GitHub issue
- **Logs**: Check CloudWatch logs
- **Status**: Monitor GitHub Actions and AWS console
