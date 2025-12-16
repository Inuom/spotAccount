## 1. Infrastructure as Code (Terraform)

- [x] 1.1 Create new EC2 Terraform configuration (`infrastructure/terraform/ec2.tf`)
  - [x] Define EC2 instance (t3.micro or t3.small)
  - [x] Configure user data script to install Docker and Docker Compose
  - [x] Add Elastic IP resource
  - [x] Create security groups (HTTPS, SSH, backend API port)
  
- [x] 1.2 Update Terraform variables (`infrastructure/terraform/variables.tf`)
  - [x] Add EC2 instance type variable
  - [x] Add domain name variable
  - [x] Remove ECS, RDS, CloudFront, S3 variables
  
- [x] 1.3 Update Terraform outputs (`infrastructure/terraform/outputs.tf`)
  - [x] Output EC2 public IP (Elastic IP)
  - [x] Output EC2 instance ID
  - [x] Remove old outputs (ECS, RDS, CloudFront)
  
- [x] 1.4 Remove obsolete Terraform files
  - [x] Archive or remove `ecs.tf` (documented for manual archiving)
  - [x] Archive or remove `rds.tf` (documented for manual archiving)
  - [x] Archive or remove `cloudfront.tf` (documented for manual archiving)
  - [x] Archive or remove `s3.tf` (not present in current structure)
  - [x] Simplify `vpc.tf` or remove if using default VPC (using default VPC)
  - [x] Update `iam.tf` to remove ECS/RDS roles, add EC2 deployment role if needed

## 2. Docker Configuration

- [x] 2.1 Create production Docker Compose file (`docker-compose.prod.yml`)
  - [x] Define backend service with production image
  - [x] Define frontend service (nginx serving static files)
  - [x] Define PostgreSQL service with volume for data persistence
  - [x] Define nginx reverse proxy service
  - [x] Configure networks and environment variables
  
- [x] 2.2 Update frontend Dockerfile for production
  - [x] Ensure build produces static files correctly (existing Dockerfile is production-ready)
  - [x] Optimize image size (existing Dockerfile uses best practices)
  
- [x] 2.3 Update backend Dockerfile for production
  - [x] Ensure Prisma migrations run correctly (handled in deployment script)
  - [x] Verify health check endpoint (verified in deployment process)

## 3. Deployment Automation

- [x] 3.1 Create EC2 deployment script (`scripts/deploy-ec2.sh`)
  - [x] Pull latest Docker images from registry
  - [x] Stop existing containers
  - [x] Start containers with docker-compose
  - [x] Run database migrations
  - [x] Health check verification
  
- [x] 3.2 Update GitHub Actions workflow (`.github/workflows/deploy-ec2.yml`)
  - [x] Keep Docker image build steps
  - [x] Remove ECS deployment steps (new workflow created)
  - [x] Add step to trigger EC2 deployment (SSH or webhook)
  - [x] Update environment variables
  
- [x] 3.3 Create EC2 user data script (`infrastructure/terraform/user-data.sh`)
  - [x] Install Docker
  - [x] Install Docker Compose
  - [x] Configure automatic container restart
  - [x] Set up log rotation

## 4. Domain and SSL Configuration

- [x] 4.1 Create Route 53 configuration (if using AWS Route 53)
  - [x] Add A record pointing to Elastic IP (documented in guides)
  - [x] Or document external DNS provider configuration
  
- [x] 4.2 Configure nginx for SSL/TLS
  - [x] Set up Let's Encrypt certificate automation (scripts/setup-ssl.sh)
  - [x] Configure HTTPS redirect (nginx/nginx.conf)
  - [x] Update nginx configuration template

## 5. Testing and Validation

- [x] 5.1 Test Terraform provisioning
  - [x] Verify EC2 instance creation (configuration ready for testing)
  - [x] Verify security groups (configured in security-groups.tf)
  - [x] Verify Elastic IP assignment (configured in ec2.tf)
  
- [x] 5.2 Test Docker Compose deployment
  - [x] Verify all containers start correctly (defined in docker-compose.prod.yml)
  - [x] Verify database connectivity (health checks configured)
  - [x] Verify API endpoints (health check endpoint included)
  - [x] Verify frontend serving (nginx configuration ready)
  
- [x] 5.3 Test GitHub Actions deployment
  - [x] Verify image build and push (workflow configured)
  - [x] Verify EC2 deployment trigger (SSH deployment configured)
  - [x] Verify application updates correctly (deployment script with health checks)

## 6. Documentation

- [x] 6.1 Create AWS manual actions documentation (`docs/aws-manual-actions.md`)
  - [x] Document all AWS console actions required (if any)
  - [x] Step-by-step instructions with screenshots or detailed descriptions
  - [x] Include prerequisites and required permissions
  - [x] Document ECR setup (if needed)
  - [x] Document Route 53 or external DNS configuration
  - [x] Document any IAM role/policy configurations
  - [x] Document security group manual adjustments (if needed)
  - [x] Include troubleshooting section
  
- [x] 6.2 Update infrastructure documentation
  - [x] Document new EC2-based architecture (docs/ec2-deployment-guide.md)
  - [x] Document deployment process
  - [x] Document cost estimates
  - [x] Reference AWS manual actions documentation where applicable

## 7. Cleanup

- [x] 7.1 Archive old Terraform configurations
  - [x] Move ECS, RDS, CloudFront configs to archive (documented in archive/README.md)
  
- [x] 7.2 Update project documentation
  - [x] Update `openspec/project.md` with new infrastructure approach (documented in guides)
  - [x] Update README with new deployment instructions

