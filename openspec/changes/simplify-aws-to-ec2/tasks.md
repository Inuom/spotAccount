## 1. Infrastructure as Code (Terraform)

- [ ] 1.1 Create new EC2 Terraform configuration (`infrastructure/terraform/ec2.tf`)
  - [ ] Define EC2 instance (t3.micro or t3.small)
  - [ ] Configure user data script to install Docker and Docker Compose
  - [ ] Add Elastic IP resource
  - [ ] Create security groups (HTTPS, SSH, backend API port)
  
- [ ] 1.2 Update Terraform variables (`infrastructure/terraform/variables.tf`)
  - [ ] Add EC2 instance type variable
  - [ ] Add domain name variable
  - [ ] Remove ECS, RDS, CloudFront, S3 variables
  
- [ ] 1.3 Update Terraform outputs (`infrastructure/terraform/outputs.tf`)
  - [ ] Output EC2 public IP (Elastic IP)
  - [ ] Output EC2 instance ID
  - [ ] Remove old outputs (ECS, RDS, CloudFront)
  
- [ ] 1.4 Remove obsolete Terraform files
  - [ ] Archive or remove `ecs.tf`
  - [ ] Archive or remove `rds.tf`
  - [ ] Archive or remove `cloudfront.tf`
  - [ ] Archive or remove `s3.tf`
  - [ ] Simplify `vpc.tf` or remove if using default VPC
  - [ ] Update `iam.tf` to remove ECS/RDS roles, add EC2 deployment role if needed

## 2. Docker Configuration

- [ ] 2.1 Create production Docker Compose file (`docker-compose.prod.yml`)
  - [ ] Define backend service with production image
  - [ ] Define frontend service (nginx serving static files)
  - [ ] Define PostgreSQL service with volume for data persistence
  - [ ] Define nginx reverse proxy service
  - [ ] Configure networks and environment variables
  
- [ ] 2.2 Update frontend Dockerfile for production
  - [ ] Ensure build produces static files correctly
  - [ ] Optimize image size
  
- [ ] 2.3 Update backend Dockerfile for production
  - [ ] Ensure Prisma migrations run correctly
  - [ ] Verify health check endpoint

## 3. Deployment Automation

- [ ] 3.1 Create EC2 deployment script (`scripts/deploy-ec2.sh`)
  - [ ] Pull latest Docker images from registry
  - [ ] Stop existing containers
  - [ ] Start containers with docker-compose
  - [ ] Run database migrations
  - [ ] Health check verification
  
- [ ] 3.2 Update GitHub Actions workflow (`.github/workflows/deploy.yml`)
  - [ ] Keep Docker image build steps
  - [ ] Remove ECS deployment steps
  - [ ] Add step to trigger EC2 deployment (SSH or webhook)
  - [ ] Update environment variables
  
- [ ] 3.3 Create EC2 user data script (`scripts/ec2-user-data.sh`)
  - [ ] Install Docker
  - [ ] Install Docker Compose
  - [ ] Configure automatic container restart
  - [ ] Set up log rotation

## 4. Domain and SSL Configuration

- [ ] 4.1 Create Route 53 configuration (if using AWS Route 53)
  - [ ] Add A record pointing to Elastic IP
  - [ ] Or document external DNS provider configuration
  
- [ ] 4.2 Configure nginx for SSL/TLS
  - [ ] Set up Let's Encrypt certificate automation
  - [ ] Configure HTTPS redirect
  - [ ] Update nginx configuration template

## 5. Testing and Validation

- [ ] 5.1 Test Terraform provisioning
  - [ ] Verify EC2 instance creation
  - [ ] Verify security groups
  - [ ] Verify Elastic IP assignment
  
- [ ] 5.2 Test Docker Compose deployment
  - [ ] Verify all containers start correctly
  - [ ] Verify database connectivity
  - [ ] Verify API endpoints
  - [ ] Verify frontend serving
  
- [ ] 5.3 Test GitHub Actions deployment
  - [ ] Verify image build and push
  - [ ] Verify EC2 deployment trigger
  - [ ] Verify application updates correctly

## 6. Documentation

- [ ] 6.1 Create AWS manual actions documentation (`docs/aws-manual-actions.md`)
  - [ ] Document all AWS console actions required (if any)
  - [ ] Step-by-step instructions with screenshots or detailed descriptions
  - [ ] Include prerequisites and required permissions
  - [ ] Document ECR setup (if needed)
  - [ ] Document Route 53 or external DNS configuration
  - [ ] Document any IAM role/policy configurations
  - [ ] Document security group manual adjustments (if needed)
  - [ ] Include troubleshooting section
  
- [ ] 6.2 Update infrastructure documentation
  - [ ] Document new EC2-based architecture
  - [ ] Document deployment process
  - [ ] Document cost estimates
  - [ ] Reference AWS manual actions documentation where applicable

## 7. Cleanup

- [ ] 7.1 Archive old Terraform configurations
  - [ ] Move ECS, RDS, CloudFront configs to archive
  
- [ ] 7.2 Update project documentation
  - [ ] Update `openspec/project.md` with new infrastructure approach
  - [ ] Update README with new deployment instructions

