# Change: Simplify AWS Infrastructure to Single EC2 Instance

## Why

The previous AWS architecture (ECS Fargate, RDS, CloudFront, S3, VPC) was too complex to manage and too expensive at €70/month. The setup required significant manual intervention in the AWS console that could not be automated by AI assistants. For a small-scale application (up to 100 users), this infrastructure was over-engineered.

**The old infrastructure has been completely destroyed** (Terraform destroy executed, all cost-incurring services terminated) to stop ongoing costs. We are now building a fresh, simplified infrastructure from scratch.

We need a simpler, cost-effective solution that:
- Reduces monthly costs significantly (target: <€20/month)
- Simplifies deployment and maintenance
- Allows full automation via GitHub Actions where possible
- Documents all required manual AWS console actions in a dedicated guide
- Maintains application functionality

## What Changes

- **BREAKING**: Replace ECS Fargate with single EC2 instance running Docker containers
- **BREAKING**: Replace RDS PostgreSQL with PostgreSQL container on EC2
- **BREAKING**: Replace CloudFront + S3 frontend hosting with nginx reverse proxy on EC2
- **BREAKING**: Remove VPC complexity, use default VPC with public subnet
- **BREAKING**: Simplify Terraform to provision only EC2 instance, security groups, and Elastic IP
- **MODIFIED**: Update GitHub Actions to build Docker images and deploy to EC2
- **ADDED**: Add domain configuration (Route 53 or external DNS) pointing to EC2 Elastic IP
- **ADDED**: Add Docker Compose configuration for EC2 deployment
- **ADDED**: Add deployment script for pulling images and restarting containers on EC2
- **ADDED**: Create dedicated AWS manual actions documentation (`docs/aws-manual-actions.md`)

## Impact

- **Affected specs**: New `infrastructure` capability
- **Affected code**: 
  - `infrastructure/terraform/*` - Complete rewrite
  - `.github/workflows/*` - Update deployment workflows
  - `docker-compose.yml` - Add production configuration
  - New deployment scripts
  - `docs/aws-manual-actions.md` - New documentation for manual AWS console actions
- **Cost reduction**: Expected from €70/month to ~€10-15/month (t3.micro EC2 + minimal data transfer)
- **Operational complexity**: Significantly reduced - single server management vs multi-service orchestration
- **Scalability**: Reduced (single instance), but acceptable for current scale requirements (up to 100 users)

