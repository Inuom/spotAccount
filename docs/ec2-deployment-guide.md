# EC2 Deployment Guide

**Feature**: simplify-aws-to-ec2  
**Last Updated**: 2024-11-20

This guide provides step-by-step instructions for deploying the SpotAccount application to AWS EC2 using the simplified infrastructure.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment](#post-deployment)
6. [Maintenance](#maintenance)

---

## Overview

### Architecture

The simplified infrastructure consists of:
- **Single EC2 Instance** (t3.micro or t3.small)
- **Docker Containers**:
  - Backend (NestJS API)
  - Frontend (Angular + Nginx)
  - PostgreSQL (Database)
  - Nginx (Reverse Proxy)
  - Certbot (SSL Certificate Management)
- **Elastic IP** for static public IP
- **ECR** for Docker image storage
- **Security Groups** for network access control

### Cost Estimate

- t3.micro EC2: ~€8-10/month
- Elastic IP (attached): Free
- EBS Storage (30GB): ~€3/month
- Data Transfer: ~€1-2/month
- **Total**: ~€12-15/month (vs €70 with ECS/RDS)

---

## Prerequisites

Before starting, ensure you have completed:

1. ✅ AWS account setup
2. ✅ IAM user with appropriate permissions
3. ✅ ECR repositories created (backend and frontend)
4. ✅ Terraform state S3 bucket created
5. ✅ EC2 key pair generated
6. ✅ Domain name configured (optional but recommended)
7. ✅ GitHub secrets configured

If you haven't completed these steps, refer to [`docs/aws-manual-actions.md`](./aws-manual-actions.md) for detailed instructions.

---

## Initial Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/spotaccount.git
cd spotaccount
```

### Step 2: Configure Terraform Variables

Edit `infrastructure/terraform/production.tfvars`:

```hcl
project_name        = "spotaccount"
environment         = "production"
aws_region          = "eu-west-1"
ec2_instance_type   = "t3.micro"  # or "t3.small"
ec2_root_volume_size = 30
domain_name         = "yourdomain.com"  # optional

common_tags = {
  Owner       = "YourName"
  Application = "SpotAccount"
}
```

### Step 3: Initialize Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform with S3 backend
terraform init \
  -backend-config="bucket=spotaccount-terraform-state" \
  -backend-config="key=terraform.tfstate" \
  -backend-config="region=eu-west-1"
```

### Step 4: Review Infrastructure Plan

```bash
terraform plan -var-file="production.tfvars"
```

Review the output carefully. Terraform will create:
- EC2 instance
- Elastic IP
- Security group
- IAM role and instance profile

### Step 5: Apply Infrastructure

```bash
terraform apply -var-file="production.tfvars"
```

Type `yes` when prompted.

**Note the outputs**:
- `ec2_public_ip` - The Elastic IP address
- `ec2_instance_id` - The EC2 instance ID

---

## Deployment Process

### Option 1: Automated Deployment (GitHub Actions)

This is the recommended method for production.

#### 1. Push to Master Branch

```bash
git add .
git commit -m "Initial deployment"
git push origin master
```

#### 2. Monitor GitHub Actions

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Watch the "EC2 Production Deployment" workflow
4. The workflow will:
   - Build Docker images
   - Push to ECR
   - Deploy to EC2
   - Verify health checks

#### 3. Check Deployment Status

The workflow will show:
- ✅ Build and Push - Images built and pushed to ECR
- ✅ Deploy to EC2 - Application deployed and running
- ✅ Post-Deployment - Health checks passed

### Option 2: Manual Deployment

For initial setup or troubleshooting.

#### 1. Build and Push Docker Images Locally

```bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="eu-west-1"

# Login to ECR
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.eu-west-1.amazonaws.com

# Build and push backend
cd backend
docker build -t 123456789012.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-backend:latest .
docker push 123456789012.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-backend:latest

# Build and push frontend
cd ../frontend
docker build -t 123456789012.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-frontend:latest .
docker push 123456789012.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-frontend:latest
```

#### 2. SSH into EC2 Instance

```bash
# Get EC2 public IP from Terraform output
EC2_IP=$(terraform output -raw ec2_public_ip)

# SSH into instance
ssh -i spotaccount-production-key.pem ec2-user@$EC2_IP
```

#### 3. Setup Application Directory

```bash
# Create application directory
sudo mkdir -p /opt/spotaccount/{scripts,nginx}
sudo chown -R ec2-user:ec2-user /opt/spotaccount
cd /opt/spotaccount

# Create environment file
cat > .env.production << 'EOF'
# PostgreSQL Configuration
POSTGRES_DB=spotaccount
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# Backend Configuration
JWT_SECRET=YOUR_JWT_SECRET_HERE
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production

# Docker Images
BACKEND_IMAGE=123456789012.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-backend:latest
FRONTEND_IMAGE=123456789012.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-frontend:latest

# Domain Configuration
DOMAIN_NAME=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
EOF

# Edit with your actual values
nano .env.production
```

#### 4. Copy Deployment Files

From your local machine:

```bash
# Copy docker-compose configuration
scp -i spotaccount-production-key.pem \
  docker-compose.prod.yml \
  ec2-user@$EC2_IP:/opt/spotaccount/

# Copy nginx configuration
scp -i spotaccount-production-key.pem -r \
  nginx \
  ec2-user@$EC2_IP:/opt/spotaccount/

# Copy deployment scripts
scp -i spotaccount-production-key.pem -r \
  scripts \
  ec2-user@$EC2_IP:/opt/spotaccount/

# Make scripts executable
ssh -i spotaccount-production-key.pem ec2-user@$EC2_IP \
  "chmod +x /opt/spotaccount/scripts/*.sh"
```

#### 5. Deploy Application

On the EC2 instance:

```bash
cd /opt/spotaccount

# Run deployment script
bash scripts/deploy-ec2.sh
```

The script will:
- Authenticate with ECR
- Pull latest Docker images
- Stop old containers
- Start new containers
- Run database migrations
- Verify health checks

---

## Post-Deployment

### Step 1: Update DNS

Point your domain to the EC2 Elastic IP:

#### Using Route 53:
1. Go to Route 53 → Hosted zones → Your domain
2. Create A record:
   - Name: (leave empty for root) or subdomain
   - Type: A
   - Value: EC2 Elastic IP from Terraform output
   - TTL: 300

#### Using External DNS Provider:
1. Log in to your DNS provider
2. Create/update A record pointing to EC2 Elastic IP
3. Wait for DNS propagation (can take up to 48 hours)

### Step 2: Setup SSL Certificate

On the EC2 instance:

```bash
cd /opt/spotaccount

# Run SSL setup script
bash scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com
```

Wait for the script to complete. It will:
1. Verify DNS points to the server
2. Obtain Let's Encrypt SSL certificate
3. Configure nginx for HTTPS
4. Restart all services

### Step 3: Verify Deployment

```bash
# Check HTTPS access
curl -I https://yourdomain.com

# Should return HTTP/2 200

# Check health endpoint
curl https://yourdomain.com/healthz

# Should return { "status": "ok" }
```

### Step 4: Test Application

1. Open browser: `https://yourdomain.com`
2. Login with admin credentials
3. Verify all features work:
   - User management
   - Subscription creation
   - Payment tracking
   - Reports

---

## Maintenance

### Regular Maintenance Tasks

#### Weekly:
- Review CloudWatch metrics
- Check application logs
- Monitor disk space

```bash
# SSH into EC2
ssh -i key.pem ec2-user@your-ip

# Check disk space
df -h

# Check container status
docker ps

# View logs
docker logs spotaccount-backend
docker logs spotaccount-frontend
docker logs spotaccount-postgres
```

#### Monthly:
- Update system packages
- Clean up old Docker images
- Review AWS costs
- Check SSL certificate status

```bash
# Update system
sudo yum update -y

# Clean up Docker
docker image prune -a -f
docker volume prune -f

# Check SSL certificate
docker exec spotaccount-certbot certbot certificates
```

### Deploying Updates

#### Via GitHub Actions (Recommended):

```bash
# Make code changes
git add .
git commit -m "Your changes"
git push origin master
```

GitHub Actions will automatically deploy the changes.

#### Manual Update:

```bash
# SSH into EC2
ssh -i key.pem ec2-user@your-ec2-ip

# Run deployment script
cd /opt/spotaccount
bash scripts/deploy-ec2.sh
```

### Backup Procedures

#### Database Backup:

```bash
# SSH into EC2
ssh -i key.pem ec2-user@your-ec2-ip

# Backup PostgreSQL database
docker exec spotaccount-postgres pg_dump -U postgres spotaccount > backup-$(date +%Y%m%d).sql

# Copy backup to local machine
scp -i key.pem ec2-user@your-ec2-ip:/home/ec2-user/backup-*.sql ./backups/
```

#### Full System Backup:

Create EBS snapshot via AWS Console:
1. EC2 → Volumes → Select root volume
2. Actions → Create snapshot
3. Add description: "SpotAccount backup YYYY-MM-DD"
4. Create snapshot

### Monitoring

#### View Application Logs:

```bash
# Backend logs
docker logs -f spotaccount-backend

# Frontend logs
docker logs -f spotaccount-frontend

# Database logs
docker logs -f spotaccount-postgres

# Nginx logs
docker exec spotaccount-nginx tail -f /var/log/nginx/access.log
docker exec spotaccount-nginx tail -f /var/log/nginx/error.log
```

#### Check Resource Usage:

```bash
# Container stats
docker stats

# System resources
top
free -h
df -h
```

### Troubleshooting

For common issues and solutions, refer to the [Troubleshooting section in aws-manual-actions.md](./aws-manual-actions.md#troubleshooting).

---

## Scaling Considerations

### When to Upgrade Instance Type

Consider upgrading from t3.micro to t3.small if:
- CPU usage consistently > 70%
- Memory usage consistently > 80%
- Application response times increase
- User count exceeds 50 active users

### How to Upgrade:

1. **Prepare**:
   ```bash
   # SSH into EC2 and stop application
   cd /opt/spotaccount
   docker-compose -f docker-compose.prod.yml down
   ```

2. **Stop EC2 Instance**:
   - AWS Console: EC2 → Instances → Stop

3. **Change Instance Type**:
   - Actions → Instance Settings → Change Instance Type
   - Select new type (e.g., t3.small)

4. **Start Instance**:
   - Instance State → Start

5. **Restart Application**:
   ```bash
   ssh -i key.pem ec2-user@your-ec2-ip
   cd /opt/spotaccount
   docker-compose -f docker-compose.prod.yml up -d
   ```

### When to Consider Multi-Instance Architecture

If you need:
- High availability (99.9%+ uptime)
- Zero-downtime deployments
- >100 concurrent users
- Auto-scaling capabilities

Then consider migrating back to:
- ECS/EKS for container orchestration
- RDS for managed database
- Load balancer for traffic distribution
- Multi-AZ deployment

---

## Cost Optimization

### Stop Instance When Not Needed

For development/staging environments:

```bash
# Stop instance (only pay for EBS storage)
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Start when needed
aws ec2 start-instances --instance-ids i-1234567890abcdef0
```

### Monitor Costs

1. AWS Console → Billing Dashboard
2. Set up billing alerts
3. Review Cost Explorer monthly

### Reserved Instances

For 24/7 production use >1 year:
- 1-year Reserved Instance: ~30-40% savings
- 3-year Reserved Instance: ~50-60% savings

---

## Support

For issues or questions:
1. Check [Troubleshooting Guide](./aws-manual-actions.md#troubleshooting)
2. Review application logs
3. Check GitHub Issues
4. Consult AWS documentation

---

**Next Steps**:
- Read [AWS Manual Actions Guide](./aws-manual-actions.md) for detailed AWS setup
- Review [SSL Setup Guide](./aws-manual-actions.md#ssl-certificate-setup)
- Set up [Monitoring](./aws-manual-actions.md#monitoring-and-logging)

