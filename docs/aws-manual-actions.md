# AWS Manual Actions Guide

**Feature**: simplify-aws-to-ec2  
**Last Updated**: 2024-11-20

This document provides step-by-step instructions for all manual AWS console actions required to set up and maintain the simplified EC2-based infrastructure for the SpotAccount application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial AWS Account Setup](#initial-aws-account-setup)
3. [IAM Configuration](#iam-configuration)
4. [ECR Repository Setup](#ecr-repository-setup)
5. [Terraform State Backend](#terraform-state-backend)
6. [EC2 Key Pair Setup](#ec2-key-pair-setup)
7. [Route 53 (Optional)](#route-53-optional)
8. [GitHub Actions Secrets](#github-actions-secrets)
9. [Initial Deployment](#initial-deployment)
10. [SSL Certificate Setup](#ssl-certificate-setup)
11. [Monitoring and Logging](#monitoring-and-logging)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- An AWS account with administrator access
- A domain name (optional, but recommended for production)
- GitHub account with repository access
- SSH client installed on your local machine

**Estimated Time**: 45-60 minutes for complete setup

---

## Initial AWS Account Setup

### 1.1 Create AWS Account (if needed)
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the registration process
4. Add a payment method (required for EC2 usage)
5. Verify your phone number

### 1.2 Enable MFA for Root Account
1. Log in to AWS Console as root user
2. Go to IAM Dashboard → Security Recommendations
3. Click "Add MFA" for root account
4. Follow the setup wizard (recommended: virtual MFA device)

### 1.3 Set Billing Alerts
1. Go to AWS Billing Dashboard
2. Navigate to "Billing preferences"
3. Enable "Receive Free Tier Usage Alerts"
4. Enable "Receive Billing Alerts"
5. Enter your email address
6. Go to CloudWatch → Alarms → Billing
7. Create alarm for $20/month threshold

---

## IAM Configuration

### 2.1 Create IAM User for Terraform/Deployment

1. Navigate to IAM → Users → Create user
2. User name: `spotaccount-deploy`
3. Select "Provide user access to the AWS Management Console" (optional)
4. Select "I want to create an IAM user"
5. Click "Next"

### 2.2 Attach Policies to User

Attach the following AWS managed policies:
- `AmazonEC2FullAccess`
- `AmazonECRPublicFullAccess`
- `AmazonVPCFullAccess`
- `IAMFullAccess`
- `CloudWatchLogsFullAccess`

For production, create a custom policy with least privilege:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "ecr:*",
        "iam:CreateRole",
        "iam:CreatePolicy",
        "iam:AttachRolePolicy",
        "iam:PassRole",
        "iam:GetRole",
        "iam:GetPolicy",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::spotaccount-terraform-state",
        "arn:aws:s3:::spotaccount-terraform-state/*"
      ]
    }
  ]
}
```

### 2.3 Create Access Keys

1. Click on the user `spotaccount-deploy`
2. Go to "Security credentials" tab
3. Click "Create access key"
4. Select use case: "Command Line Interface (CLI)"
5. Acknowledge the recommendation
6. Click "Create access key"
7. **IMPORTANT**: Download the CSV file or copy both:
   - Access Key ID
   - Secret Access Key
8. Store these securely (you'll need them for GitHub Secrets)

---

## ECR Repository Setup

### 3.1 Create Backend Repository

1. Navigate to Amazon ECR → Repositories
2. Click "Create repository"
3. Visibility: **Private**
4. Repository name: `spotaccount-backend`
5. Tag immutability: **Disabled** (for flexibility)
6. Scan on push: **Enabled** (recommended for security)
7. Encryption: **AES-256** (default)
8. Click "Create repository"

### 3.2 Create Frontend Repository

Repeat the same process for frontend:
1. Click "Create repository"
2. Repository name: `spotaccount-frontend`
3. Same settings as backend
4. Click "Create repository"

### 3.3 Note the Repository URIs

After creating both repositories, note down the URIs. They will look like:
```
123456789012.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-backend
123456789012.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-frontend
```

You'll need these for the environment configuration.

---

## Terraform State Backend

### 4.1 Create S3 Bucket for Terraform State

1. Navigate to S3 → Buckets → Create bucket
2. Bucket name: `spotaccount-terraform-state` (must be globally unique)
3. AWS Region: Select your deployment region (e.g., `eu-west-1`)
4. Block all public access: **Enabled** (keep checked)
5. Bucket Versioning: **Enabled**
6. Default encryption: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**
7. Click "Create bucket"

### 4.2 Enable Versioning (if not done in creation)

1. Go to bucket properties
2. Find "Bucket Versioning"
3. Click "Edit"
4. Select "Enable"
5. Save changes

### 4.3 Create DynamoDB Table for State Locking (Optional)

1. Navigate to DynamoDB → Tables → Create table
2. Table name: `spotaccount-terraform-locks`
3. Partition key: `LockID` (String)
4. Table settings: **Default settings** (On-demand billing)
5. Click "Create table"

---

## EC2 Key Pair Setup

### 5.1 Create EC2 Key Pair

1. Navigate to EC2 → Network & Security → Key Pairs
2. Click "Create key pair"
3. Name: `spotaccount-production-key`
4. Key pair type: **RSA**
5. Private key file format: **.pem** (for SSH)
6. Click "Create key pair"
7. **IMPORTANT**: The .pem file will be automatically downloaded
8. Store this file securely - you'll need it to SSH into the EC2 instance

### 5.2 Set Correct Permissions (Linux/Mac)

```bash
chmod 400 spotaccount-production-key.pem
```

### 5.3 Store in GitHub Secrets

```bash
# Display the private key content
cat spotaccount-production-key.pem
```

Copy the entire content (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) and add it to GitHub Secrets as `EC2_SSH_PRIVATE_KEY`.

---

## Route 53 (Optional)

If you want to use a custom domain with Route 53:

### 6.1 Register Domain (if needed)

1. Navigate to Route 53 → Registered domains
2. Click "Register domain"
3. Search for your desired domain
4. Follow the registration process

### 6.2 Create Hosted Zone (if using external registrar)

1. Navigate to Route 53 → Hosted zones
2. Click "Create hosted zone"
3. Domain name: Enter your domain (e.g., `example.com`)
4. Type: **Public hosted zone**
5. Click "Create hosted zone"
6. Note the NS (Name Server) records
7. Update your domain registrar's nameservers to point to these NS records

### 6.3 Wait for DNS Propagation

DNS propagation can take 24-48 hours. You can check status at: https://www.whatsmydns.net

---

## GitHub Actions Secrets

### 7.1 Navigate to Repository Secrets

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret" for each of the following

### 7.2 Required Secrets

Add the following secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `EC2_SSH_PRIVATE_KEY` | Content of the .pem key pair file | `-----BEGIN RSA PRIVATE KEY-----\n...` |
| `TERRAFORM_BACKEND_BUCKET` | S3 bucket name for Terraform state | `spotaccount-terraform-state` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key-min-32-chars` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `strong-random-password` |
| `CORS_ORIGIN` | CORS allowed origin | `https://yourdomain.com` |

### 7.3 Generate Secure Secrets

For `JWT_SECRET` and `POSTGRES_PASSWORD`, generate strong random strings:

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate PostgreSQL password
openssl rand -base64 24
```

---

## Initial Deployment

### 8.1 Provision Infrastructure with Terraform

1. **Local Setup** (first time):

```bash
# Clone repository
git clone https://github.com/yourusername/spotaccount.git
cd spotaccount

# Navigate to Terraform directory
cd infrastructure/terraform

# Initialize Terraform
terraform init \
  -backend-config="bucket=spotaccount-terraform-state" \
  -backend-config="key=terraform.tfstate" \
  -backend-config="region=eu-west-1"

# Review the plan
terraform plan -var-file="production.tfvars"

# Apply the infrastructure
terraform apply -var-file="production.tfvars"
```

2. **Note the Outputs**:

After successful `terraform apply`, note down the outputs:
- `ec2_public_ip` - The Elastic IP of your EC2 instance
- `ec2_instance_id` - The EC2 instance ID

### 8.2 Update DNS Records

If using a custom domain:

1. Navigate to Route 53 → Hosted zones → Your domain
2. Click "Create record"
3. Record name: Leave empty (for root domain) or enter subdomain
4. Record type: **A**
5. Value: Enter the `ec2_public_ip` from Terraform output
6. TTL: **300** (5 minutes)
7. Click "Create records"

For wildcard subdomain support, create another A record:
- Record name: `*`
- Same values as above

### 8.3 SSH into EC2 Instance

```bash
# Replace with your actual values
EC2_PUBLIC_IP="1.2.3.4"
ssh -i spotaccount-production-key.pem ec2-user@$EC2_PUBLIC_IP
```

### 8.4 Initial Setup on EC2

Once connected via SSH:

```bash
# Verify Docker and Docker Compose are installed
docker --version
docker-compose --version

# Create application directory structure
sudo mkdir -p /opt/spotaccount/{scripts,nginx}
sudo chown -R ec2-user:ec2-user /opt/spotaccount

# Create environment file from template
cd /opt/spotaccount
cat > .env.production << 'EOF'
# PostgreSQL Configuration
POSTGRES_DB=spotaccount
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# Backend Configuration
JWT_SECRET=YOUR_JWT_SECRET_HERE
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production

# Docker Images (update with your ECR URIs)
BACKEND_IMAGE=123456789012.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-backend:latest
FRONTEND_IMAGE=123456789012.dkr.ecr.eu-west-1.amazonaws.com/spotaccount-frontend:latest

# Domain Configuration
DOMAIN_NAME=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
EOF

# Edit the file to add your actual values
nano .env.production
```

---

## SSL Certificate Setup

### 9.1 Wait for DNS Propagation

Before setting up SSL, ensure your domain points to the EC2 instance:

```bash
# Check if domain resolves to your EC2 IP
dig +short yourdomain.com
# Should return your EC2 Elastic IP
```

### 9.2 Run SSL Setup Script

On the EC2 instance:

```bash
cd /opt/spotaccount

# Make the SSL setup script executable (if not already)
chmod +x scripts/setup-ssl.sh

# Run the SSL setup script
bash scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com
```

The script will:
1. Verify DNS configuration
2. Temporarily start nginx for Let's Encrypt challenge
3. Obtain SSL certificate
4. Configure nginx with HTTPS
5. Restart all services

### 9.3 Verify SSL Certificate

```bash
# Check if HTTPS is working
curl -I https://yourdomain.com

# Should return HTTP/2 200 with SSL certificate info
```

### 9.4 Test Auto-Renewal

Let's Encrypt certificates expire every 90 days but auto-renew at 30 days. The certbot container handles this automatically.

To test renewal:

```bash
# Check certbot container logs
docker logs spotaccount-certbot

# Manually test renewal (dry run)
docker exec spotaccount-certbot certbot renew --dry-run
```

---

## Monitoring and Logging

### 10.1 View Application Logs

On the EC2 instance:

```bash
# View all container logs
cd /opt/spotaccount
docker-compose -f docker-compose.prod.yml logs

# View specific service logs
docker logs spotaccount-backend
docker logs spotaccount-frontend
docker logs spotaccount-postgres
docker logs spotaccount-nginx

# Follow logs in real-time
docker logs -f spotaccount-backend
```

### 10.2 View Deployment Logs

```bash
# View deployment history
cat /opt/spotaccount/deployment.log

# View nginx access logs
docker exec spotaccount-nginx tail -f /var/log/nginx/access.log

# View nginx error logs
docker exec spotaccount-nginx tail -f /var/log/nginx/error.log
```

### 10.3 CloudWatch Logs (Optional)

To send logs to CloudWatch:

1. Install CloudWatch agent on EC2:

```bash
# Download and install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Start the agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
```

2. View logs in AWS Console:
   - Navigate to CloudWatch → Log groups
   - Find `/aws/ec2/spotaccount-production`

### 10.4 Monitor EC2 Instance

1. Navigate to EC2 → Instances → Select your instance
2. Click "Monitoring" tab
3. View metrics:
   - CPU utilization
   - Network in/out
   - Disk read/write

### 10.5 Set Up CloudWatch Alarms

1. Navigate to CloudWatch → Alarms → Create alarm
2. Select metric: EC2 → Per-Instance Metrics → CPUUtilization
3. Select your instance
4. Set threshold: e.g., CPU > 80% for 5 minutes
5. Configure notification (SNS topic or email)
6. Create alarm

Recommended alarms:
- CPU Utilization > 80%
- StatusCheckFailed (instance or system)
- Disk space utilization > 80% (requires custom metric)

---

## Troubleshooting

### 11.1 Cannot SSH into EC2 Instance

**Problem**: Connection timeout or refused

**Solutions**:
1. Check security group allows SSH (port 22) from your IP:
   - EC2 → Security Groups → Find `spotaccount-production-ec2-sg`
   - Verify inbound rule for port 22
   - Update if needed to allow your current IP

2. Verify instance is running:
   - EC2 → Instances
   - Check instance state is "running"

3. Check correct key pair:
   - Verify you're using the correct .pem file
   - Ensure correct permissions: `chmod 400 key.pem`

4. Try using the public IP instead of DNS name

### 11.2 Deployment Fails - Cannot Pull Images

**Problem**: EC2 cannot pull Docker images from ECR

**Solutions**:
1. Verify IAM role has ECR permissions:
   - Check EC2 instance has `spotaccount-production-ec2-role` attached
   - Verify role has ECR read permissions

2. Manually test ECR login:
   ```bash
   aws ecr get-login-password --region eu-west-1 | \
     docker login --username AWS --password-stdin \
     123456789012.dkr.ecr.eu-west-1.amazonaws.com
   ```

3. Check image tags exist in ECR:
   - Navigate to ECR → Repositories
   - Verify images are present with `latest` tag

### 11.3 Application Not Accessible via HTTPS

**Problem**: Cannot access application via domain

**Solutions**:
1. Check DNS resolution:
   ```bash
   dig +short yourdomain.com
   # Should return EC2 Elastic IP
   ```

2. Verify nginx is running:
   ```bash
   docker ps | grep nginx
   docker logs spotaccount-nginx
   ```

3. Check security group allows HTTPS (port 443):
   - EC2 → Security Groups
   - Verify port 443 is open from 0.0.0.0/0

4. Verify SSL certificate is valid:
   ```bash
   docker exec spotaccount-certbot certbot certificates
   ```

5. Check nginx configuration:
   ```bash
   docker exec spotaccount-nginx nginx -t
   ```

### 11.4 Database Connection Issues

**Problem**: Backend cannot connect to PostgreSQL

**Solutions**:
1. Check PostgreSQL container is running:
   ```bash
   docker ps | grep postgres
   docker logs spotaccount-postgres
   ```

2. Verify environment variables:
   ```bash
   cat /opt/spotaccount/.env.production
   # Check DATABASE_URL is correct
   ```

3. Test database connectivity:
   ```bash
   docker exec spotaccount-postgres psql -U postgres -c "\l"
   ```

4. Check disk space:
   ```bash
   df -h
   # Ensure /var/lib/docker has space
   ```

### 11.5 Out of Disk Space

**Problem**: EC2 instance runs out of disk space

**Solutions**:
1. Clean up Docker:
   ```bash
   # Remove unused images
   docker image prune -a -f
   
   # Remove unused volumes
   docker volume prune -f
   
   # Remove stopped containers
   docker container prune -f
   ```

2. Check disk usage:
   ```bash
   du -h --max-depth=1 / | sort -hr | head -20
   ```

3. Increase EBS volume size:
   - EC2 → Volumes → Select root volume
   - Actions → Modify Volume
   - Increase size (e.g., from 30GB to 50GB)
   - After modification, SSH into instance and resize filesystem:
     ```bash
     sudo growpart /dev/xvda 1
     sudo resize2fs /dev/xvda1
     ```

### 11.6 GitHub Actions Deployment Fails

**Problem**: GitHub Actions workflow fails during deployment

**Solutions**:
1. Check GitHub Secrets are set correctly:
   - Repository Settings → Secrets and variables → Actions
   - Verify all required secrets exist

2. Review workflow logs:
   - GitHub → Actions → Select failed workflow
   - Expand failed step to see error message

3. Common issues:
   - **SSH connection fails**: Verify `EC2_SSH_PRIVATE_KEY` secret
   - **ECR push fails**: Check AWS credentials have ECR permissions
   - **Terraform fails**: Verify backend bucket exists and is accessible

4. Test deployment manually:
   ```bash
   # SSH into EC2
   ssh -i key.pem ec2-user@your-ec2-ip
   
   # Run deployment script manually
   cd /opt/spotaccount
   bash scripts/deploy-ec2.sh
   ```

### 11.7 High Memory Usage

**Problem**: Instance experiencing high memory usage

**Solutions**:
1. Check container memory usage:
   ```bash
   docker stats
   ```

2. Restart specific container:
   ```bash
   docker restart spotaccount-backend
   # or
   docker restart spotaccount-postgres
   ```

3. If persistent, consider upgrading instance type:
   - Stop the application: `docker-compose -f docker-compose.prod.yml down`
   - AWS Console: EC2 → Instances → Instance State → Stop
   - Wait for instance to stop
   - Actions → Instance Settings → Change Instance Type
   - Select t3.small (or larger)
   - Start instance
   - SSH in and restart application

### 11.8 Let's Encrypt Rate Limits

**Problem**: Cannot obtain SSL certificate due to rate limits

**Solutions**:
1. Let's Encrypt has rate limits:
   - 5 failed validation attempts per account, per hostname, per hour
   - 50 certificates per registered domain per week

2. Use staging environment for testing:
   ```bash
   docker run --rm \
     -v /opt/spotaccount/nginx/certbot-etc:/etc/letsencrypt \
     -v /opt/spotaccount/nginx/certbot-var:/var/lib/letsencrypt \
     -v /opt/spotaccount/nginx/certbot-webroot:/var/www/certbot \
     certbot/certbot certonly \
     --webroot \
     --webroot-path=/var/www/certbot \
     --email admin@example.com \
     --agree-tos \
     --staging \
     -d yourdomain.com
   ```

3. Wait for rate limit to reset (1 hour for validation, 1 week for certificates)

4. Check current rate limit status: https://crt.sh

---

## Cost Optimization Tips

### 12.1 Stop EC2 Instance When Not in Use

For development/testing:
```bash
# Stop instance (you only pay for EBS storage)
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Start instance when needed
aws ec2 start-instances --instance-ids i-1234567890abcdef0
```

### 12.2 Use Reserved Instances for Production

If running 24/7 for >1 year, consider Reserved Instances:
- 1-year No Upfront: ~30% savings
- 1-year All Upfront: ~40% savings
- 3-year All Upfront: ~60% savings

### 12.3 Monitor Costs

1. AWS Cost Explorer:
   - AWS Console → Cost Management → Cost Explorer
   - View daily/monthly costs
   - Identify cost drivers

2. Set up cost anomaly detection:
   - Cost Management → Cost Anomaly Detection
   - Create monitor
   - Set alert threshold

### 12.4 Clean Up Unused Resources

Regularly check for:
- Unused EBS snapshots
- Unattached Elastic IPs (charged when not attached)
- Old Docker images in ECR
- Old CloudWatch log streams

---

## Monthly Maintenance Checklist

- [ ] Review CloudWatch metrics and logs
- [ ] Check EC2 instance health
- [ ] Verify SSL certificate renewal (auto-renewed by certbot)
- [ ] Review AWS billing dashboard
- [ ] Clean up old Docker images: `docker image prune -a`
- [ ] Check database size and backup (if configured)
- [ ] Update packages on EC2: `sudo yum update`
- [ ] Review security group rules
- [ ] Check GitHub Actions workflow runs
- [ ] Verify application health endpoints

---

## Security Best Practices

1. **Restrict SSH Access**:
   - Update security group to allow SSH only from your IP
   - Use bastion host for production
   - Consider AWS Session Manager instead of SSH

2. **Regular Updates**:
   - Keep EC2 instance updated: `sudo yum update -y`
   - Update Docker images regularly
   - Monitor security advisories

3. **Secrets Management**:
   - Never commit secrets to Git
   - Use AWS Secrets Manager for sensitive data
   - Rotate credentials regularly

4. **Backup Strategy**:
   - Create EBS snapshots regularly
   - Backup PostgreSQL data to S3
   - Test restore procedures

5. **Network Security**:
   - Use security groups as firewall
   - Keep only necessary ports open
   - Use VPC for network isolation (if needed)

---

## Support and Resources

- **AWS Documentation**: https://docs.aws.amazon.com
- **Terraform AWS Provider**: https://registry.terraform.io/providers/hashicorp/aws
- **Docker Documentation**: https://docs.docker.com
- **Let's Encrypt Documentation**: https://letsencrypt.org/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/

For project-specific issues, refer to the main README.md or create an issue in the GitHub repository.

---

**End of Manual Actions Guide**

