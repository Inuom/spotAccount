# Design: EC2-Based Infrastructure Simplification

## Context

The application previously ran on a complex AWS stack:
- ECS Fargate for backend container orchestration
- RDS PostgreSQL for managed database
- CloudFront + S3 for frontend CDN
- VPC with public/private subnets
- Multiple security groups and IAM roles

This architecture cost €70/month and required manual AWS console operations that could not be automated by AI assistants. **The old infrastructure has been completely destroyed** (Terraform destroy executed, all cost-incurring services terminated) to stop ongoing costs.

The application serves a small user base (up to 100 users) and doesn't require the scalability or complexity of the previous setup. We are now building a new, simplified infrastructure from scratch.

## Goals / Non-Goals

### Goals
- Reduce infrastructure costs by 70-80% (target: <€20/month)
- Simplify deployment to single EC2 instance
- Enable full automation via GitHub Actions (no manual AWS console steps)
- Maintain application functionality (backend API, frontend, database)
- Support HTTPS with domain name
- Keep infrastructure as code (Terraform)

### Non-Goals
- High availability (single instance is acceptable)
- Auto-scaling (manual scaling if needed)
- Multi-region deployment
- Advanced monitoring (basic CloudWatch logs sufficient)
- Database backups beyond EC2 snapshots (can add later if needed)

## Decisions

### Decision: Single EC2 Instance with Docker Compose
**Rationale**: Simplest deployment model. All services (backend, frontend, database) run as Docker containers on one EC2 instance. Docker Compose manages service dependencies and networking.

**Alternatives considered**:
- Multiple EC2 instances: Too expensive and complex
- ECS on EC2: Still requires cluster management overhead
- Lightsail: Simpler but less flexible, similar cost

### Decision: PostgreSQL Container Instead of RDS
**Rationale**: Eliminates RDS costs (~€15-20/month). Containerized PostgreSQL is sufficient for current scale. Data persistence via Docker volumes on EC2 EBS.

**Alternatives considered**:
- Keep RDS: Too expensive
- External managed database (e.g., Supabase): Additional service dependency
- SQLite: Not suitable for concurrent access

### Decision: Nginx Reverse Proxy Instead of CloudFront + S3
**Rationale**: Single nginx container handles:
- Reverse proxy to backend API
- Static file serving for frontend
- SSL/TLS termination with Let's Encrypt
- Eliminates CloudFront and S3 costs

**Alternatives considered**:
- Keep CloudFront + S3: Too expensive and complex
- Caddy: Simpler but nginx is more widely used
- Traefik: Overkill for single instance

### Decision: Default VPC Instead of Custom VPC
**Rationale**: Reduces Terraform complexity. Default VPC provides sufficient networking for single-instance deployment. Security groups still provide network isolation.

**Alternatives considered**:
- Keep custom VPC: Unnecessary complexity
- No VPC: Not possible, all EC2 instances require VPC

### Decision: Elastic IP for Static Public IP
**Rationale**: Required for domain DNS configuration. Elastic IP is free when attached to running instance.

### Decision: GitHub Actions Builds Images, EC2 Pulls and Deploys
**Rationale**: 
- GitHub Actions builds Docker images and pushes to ECR (or Docker Hub)
- EC2 instance runs deployment script that pulls latest images and restarts containers
- Deployment script can be triggered via GitHub Actions SSH or webhook

**Alternatives considered**:
- GitHub Actions SSH directly to EC2: Requires managing SSH keys
- Webhook endpoint on EC2: More secure, allows manual triggers
- AWS CodeDeploy: Adds complexity and cost

### Decision: t3.micro or t3.small EC2 Instance
**Rationale**: 
- t3.micro: €8-10/month, 2 vCPU, 1GB RAM (may be tight for all services)
- t3.small: €15-18/month, 2 vCPU, 2GB RAM (recommended for comfort)
- Start with t3.micro, upgrade if needed

### Decision: Domain Configuration
**Rationale**: Use Route 53 for DNS (if domain registered in AWS) or external DNS provider. Point A record to Elastic IP. Let's Encrypt for SSL certificates via nginx.

## Risks / Trade-offs

### Risk: Single Point of Failure
**Mitigation**: Acceptable for current scale. Can add backup/restore procedures. EC2 snapshots for disaster recovery.

### Risk: Limited Scalability
**Mitigation**: Acceptable for up to 100 users. If growth requires, can migrate back to distributed architecture.

### Risk: Manual Database Backups
**Mitigation**: Implement automated backup script that dumps PostgreSQL and uploads to S3 (minimal S3 usage for backups only).

### Risk: Security on Single Instance
**Mitigation**: 
- Security groups restrict access (HTTPS only, SSH from specific IPs)
- Keep containers updated
- Use secrets management (environment variables or AWS Secrets Manager)

### Trade-off: Reduced High Availability
**Acceptable**: Application can tolerate brief downtime during deployments or instance restarts.

### Trade-off: Less Monitoring
**Acceptable**: Basic CloudWatch logs sufficient. Can add application-level monitoring later.

## Migration Plan

**Note**: Since the old infrastructure has been completely destroyed, this is a fresh deployment, not a migration. No data migration is needed as we're starting from scratch.

### Phase 1: Prepare New Infrastructure
1. Create new Terraform configuration for EC2
2. Set up GitHub Actions workflow for image building
3. Create Docker Compose production configuration
4. Create deployment script
5. Create AWS manual actions documentation

### Phase 2: Deploy to EC2
1. Perform any required manual AWS console actions (documented separately)
2. Provision EC2 instance with Terraform
3. Install Docker and Docker Compose on EC2 (via user data or manual)
4. Configure domain DNS
5. Deploy application containers
6. Test functionality

### Phase 3: Validation
1. Verify all services are running correctly
2. Test HTTPS/SSL configuration
3. Verify domain resolution
4. Test application functionality end-to-end

### Rollback Plan
- Terraform state can be used to destroy and recreate infrastructure
- Docker Compose configuration allows quick container restarts
- EC2 snapshots can be created for disaster recovery

## Open Questions

- Should we use ECR or Docker Hub for image registry? (ECR is free for first 500MB/month) ok for ECR
- Should we implement automated backups from day one? Not in the MVP
- What monitoring/alerting is needed beyond CloudWatch logs? log file that I can read by connecting on the EC2

