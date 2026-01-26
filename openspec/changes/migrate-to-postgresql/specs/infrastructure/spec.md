## ADDED Requirements

### Requirement: Database Population Script
The system SHALL provide a documented, reproducible process to populate the database by running schema migrations and then the seed script.

#### Scenario: Fresh database population
- **WHEN** the populate process runs against an empty PostgreSQL database
- **THEN** Prisma migrations are applied and schema is created
- **AND** the seed script runs (e.g. initial admin user)
- **AND** the database is ready for application use

#### Scenario: Idempotent seed
- **WHEN** the seed script runs and required initial data (e.g. admin user) already exists
- **THEN** the script completes successfully without duplicating data
- **AND** no error is raised

### Requirement: Local PostgreSQL Usage
The system SHALL use PostgreSQL for local development, provided via Docker Compose, with the backend connected to it.

#### Scenario: Local Docker Compose startup
- **WHEN** a developer runs Docker Compose for local development
- **THEN** a PostgreSQL container is started
- **AND** the backend container connects to PostgreSQL via `DATABASE_URL`
- **AND** migrations and seed can be run to populate the database
- **AND** the application operates against PostgreSQL (not SQLite)

## MODIFIED Requirements

### Requirement: EC2 Instance Hosting
The system SHALL run all application services (backend API, frontend, database) on a single EC2 instance using Docker containers.

#### Scenario: EC2 instance provisioning
- **WHEN** infrastructure is provisioned via Terraform
- **THEN** a single EC2 instance is created with Docker and Docker Compose installed
- **AND** the instance has an Elastic IP assigned for static public IP address

#### Scenario: Container deployment
- **WHEN** Docker Compose configuration is deployed to EC2
- **THEN** backend, frontend, PostgreSQL, and nginx containers are started
- **AND** the backend connects to PostgreSQL via `DATABASE_URL` (no SQLite)
- **AND** containers are configured to restart automatically on failure
- **AND** containers communicate via Docker network

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
- **AND** database seed is executed (idempotent) to ensure initial data (e.g. admin user) exists
- **AND** health checks verify successful deployment
