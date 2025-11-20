## ADDED Requirements

### Requirement: EC2 Instance Hosting
The system SHALL run all application services (backend API, frontend, database) on a single EC2 instance using Docker containers.

#### Scenario: EC2 instance provisioning
- **WHEN** infrastructure is provisioned via Terraform
- **THEN** a single EC2 instance is created with Docker and Docker Compose installed
- **AND** the instance has an Elastic IP assigned for static public IP address

#### Scenario: Container deployment
- **WHEN** Docker Compose configuration is deployed to EC2
- **THEN** backend, frontend, PostgreSQL, and nginx containers are started
- **AND** containers are configured to restart automatically on failure
- **AND** containers communicate via Docker network

### Requirement: Cost Optimization
The infrastructure SHALL cost less than €20/month while maintaining application functionality.

#### Scenario: Cost calculation
- **WHEN** infrastructure is provisioned
- **THEN** total monthly cost is less than €20 (EC2 instance + minimal data transfer)
- **AND** no managed services (RDS, ECS Fargate, CloudFront) are used

### Requirement: Automated Deployment
The system SHALL support fully automated deployment via GitHub Actions where possible, with any required manual AWS console operations clearly documented.

#### Scenario: CI/CD pipeline deployment
- **WHEN** code is pushed to master branch
- **THEN** GitHub Actions builds Docker images and pushes to registry
- **AND** deployment script is triggered on EC2 instance
- **AND** EC2 instance pulls latest images and restarts containers
- **AND** application is updated without manual intervention

#### Scenario: Deployment script execution
- **WHEN** deployment script runs on EC2
- **THEN** latest Docker images are pulled from registry
- **AND** existing containers are stopped gracefully
- **AND** new containers are started with updated images
- **AND** database migrations are executed if needed
- **AND** health checks verify successful deployment

### Requirement: AWS Manual Actions Documentation
The system SHALL provide comprehensive documentation for any manual AWS console actions required for setup or maintenance.

#### Scenario: Documentation availability
- **WHEN** manual AWS console actions are required
- **THEN** step-by-step instructions are available in `docs/aws-manual-actions.md`
- **AND** documentation includes prerequisites, required permissions, and troubleshooting
- **AND** all AWS console operations are clearly explained with context

#### Scenario: Documentation completeness
- **WHEN** reviewing AWS manual actions documentation
- **THEN** all required manual steps are documented (ECR setup, DNS configuration, IAM roles, etc.)
- **AND** each step includes clear instructions and expected outcomes
- **AND** troubleshooting section addresses common issues

### Requirement: Domain and SSL Configuration
The system SHALL serve the application via a custom domain name with HTTPS enabled.

#### Scenario: Domain DNS configuration
- **WHEN** domain is configured
- **THEN** DNS A record points to EC2 Elastic IP address
- **AND** domain resolves to the application

#### Scenario: SSL certificate
- **WHEN** nginx reverse proxy is configured
- **THEN** Let's Encrypt SSL certificate is automatically obtained and renewed
- **AND** HTTPS is enforced for all traffic
- **AND** HTTP traffic redirects to HTTPS

### Requirement: Reverse Proxy Configuration
The system SHALL use nginx as a reverse proxy to route traffic to backend API and serve frontend static files.

#### Scenario: API routing
- **WHEN** request is made to `/api/*` endpoint
- **THEN** nginx forwards request to backend container
- **AND** backend processes request and returns response

#### Scenario: Frontend serving
- **WHEN** request is made to root path or frontend routes
- **THEN** nginx serves static files from frontend container
- **AND** Angular routing works correctly for client-side navigation

### Requirement: Database Persistence
The system SHALL persist PostgreSQL data across container restarts using Docker volumes.

#### Scenario: Data persistence
- **WHEN** PostgreSQL container is restarted
- **THEN** database data is preserved in Docker volume
- **AND** application can reconnect to database without data loss

#### Scenario: Volume backup
- **WHEN** backup is needed
- **THEN** PostgreSQL data can be exported from Docker volume
- **AND** backup can be stored externally (e.g., S3) for disaster recovery

### Requirement: Security Configuration
The system SHALL restrict network access using security groups and enforce HTTPS.

#### Scenario: Security group rules
- **WHEN** EC2 instance is created
- **THEN** security group allows HTTPS (443) from anywhere
- **AND** security group allows SSH (22) only from specific IP addresses
- **AND** security group allows backend API port only from nginx container (internal)
- **AND** all other ports are blocked

#### Scenario: HTTPS enforcement
- **WHEN** user accesses application via HTTP
- **THEN** request is redirected to HTTPS
- **AND** all API calls use HTTPS

### Requirement: Monitoring and Logging
The system SHALL provide basic monitoring and logging capabilities.

#### Scenario: Application logs
- **WHEN** containers generate logs
- **THEN** logs are accessible via Docker logs or CloudWatch (if configured)
- **AND** logs can be viewed for troubleshooting

#### Scenario: Health checks
- **WHEN** deployment completes
- **THEN** health check endpoint is verified
- **AND** deployment fails if health check does not pass

