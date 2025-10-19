# Research: Shared Subscription Debt Manager

**Date**: 2025-10-18  
**Feature**: 001-shared-subscription-spec  
**Purpose**: Resolve technical decisions and establish best practices for implementation

## Technology Stack Decisions

### Backend Framework: NestJS
**Decision**: Use NestJS for backend API development  
**Rationale**: 
- Provides structured, maintainable architecture with decorators and dependency injection
- Built-in support for TypeScript and testing
- Excellent integration with Prisma ORM
- Strong ecosystem for authentication, validation, and API documentation
- Follows Angular patterns for consistency across full-stack

**Alternatives considered**: 
- Express.js (too low-level, requires more boilerplate)
- Fastify (good performance but less ecosystem)
- Spring Boot (Java overhead for small application)

### Frontend Framework: Angular 17+ with NgRx
**Decision**: Use Angular 17+ for frontend SPA development with NgRx for state management  
**Rationale**:
- TypeScript-first with strong typing
- Component-based architecture aligns with backend modules
- Built-in routing, forms, and HTTP client
- Excellent testing support with Jasmine/Karma
- Strong ecosystem for financial applications
- NgRx provides predictable state management with time-travel debugging
- Feature-based store modules align with business domain
- Smart/dumb component pattern promotes testability and maintainability

**Alternatives considered**:
- React (less opinionated, more setup required)
- Vue.js (smaller ecosystem for enterprise features)
- Svelte (less mature for complex applications)
- Redux (more boilerplate, less Angular integration)

### Database: PostgreSQL with Prisma ORM
**Decision**: Use PostgreSQL with Prisma ORM for data persistence  
**Rationale**:
- Production-ready database with ACID compliance for financial data integrity
- Prisma provides excellent type-safe database access
- Excellent migration support and schema management
- Docker containerization for consistent development/production environments
- AWS RDS PostgreSQL for managed production hosting with automated backups
- Better concurrency support and scalability than SQLite

**Alternatives considered**:
- SQLite (limited concurrency, not suitable for production deployment)
- MySQL (less type safety with Prisma, fewer advanced features)
- MongoDB (NoSQL not suitable for financial transactions and relationships)

### Authentication: Username/Password with JWT
**Decision**: Implement username/password authentication with JWT tokens  
**Rationale**:
- Simple to implement and maintain
- JWT provides stateless authentication
- Sufficient security for small group application
- No external dependencies or costs

**Alternatives considered**:
- AWS Cognito (additional complexity and cost)
- OAuth providers (unnecessary for internal tool)
- Session-based auth (requires server-side storage)

### Hosting: AWS Fargate + S3 + CloudFront
**Decision**: Deploy backend on AWS Fargate, frontend on S3+CloudFront  
**Rationale**:
- Serverless backend reduces operational overhead
- S3+CloudFront provides global CDN for frontend
- Cost-effective for small scale
- Terraform enables infrastructure as code

**Alternatives considered**:
- VPS hosting (more operational overhead)
- Heroku (vendor lock-in, higher costs)
- Azure/GCP (less familiar, similar costs)

### CI/CD: GitHub Actions
**Decision**: Use GitHub Actions for CI/CD pipeline  
**Rationale**:
- Native integration with GitHub repository
- Cost-effective for small teams
- Excellent ecosystem of actions
- Supports testing, linting, security scanning, and deployment

**Alternatives considered**:
- Jenkins (requires server maintenance)
- Azure DevOps (Microsoft ecosystem)
- GitLab CI (would require migration)

## Architecture Patterns

### Backend Architecture: Modular NestJS
**Decision**: Organize backend into feature modules (auth, users, subscriptions, payments, reports)  
**Rationale**:
- Clear separation of concerns
- Easy to test and maintain
- Follows NestJS best practices
- Aligns with business domain

### Frontend Architecture: Component-Based Angular
**Decision**: Organize frontend into reusable components and role-based pages  
**Rationale**:
- Promotes code reuse
- Clear separation between admin and user interfaces
- Easy to test individual components
- Follows Angular best practices

### Database Design: Normalized Relational Model
**Decision**: Use normalized relational model with proper foreign keys and constraints  
**Rationale**:
- Ensures data integrity for financial data
- Supports complex queries and reporting
- Easy to understand and maintain
- Prisma provides excellent type safety

## Security Considerations

### Password Security: bcrypt Hashing
**Decision**: Use bcrypt for password hashing with appropriate salt rounds  
**Rationale**:
- Industry standard for password hashing
- Resistant to rainbow table attacks
- Configurable cost factor for future-proofing

### API Security: JWT + RBAC
**Decision**: Implement JWT-based authentication with role-based access control  
**Rationale**:
- Stateless authentication scales well
- Clear separation between admin and user permissions
- Easy to implement and maintain

### Data Protection: Encryption at Rest
**Decision**: Encrypt sensitive data (passwords, payment amounts) in database  
**Rationale**:
- Protects against data breaches
- Required for financial data compliance
- SQLite supports encryption extensions

## Performance Considerations

### Response Time: 2-Second Target
**Decision**: Target 2-second response time for all user actions  
**Rationale**:
- Provides good user experience
- Achievable with SQLite for small scale
- Allows for future growth

### Concurrency: Last-Write-Wins
**Decision**: Implement last-write-wins semantics for concurrent access  
**Rationale**:
- Simple to implement and understand
- Sufficient for small group usage
- Avoids complex conflict resolution

### Caching: Basic Application-Level
**Decision**: Implement basic caching for frequently accessed data  
**Rationale**:
- Improves response times
- Reduces database load
- Simple to implement with NestJS

## Testing Strategy

### Unit Testing: Jest + 80% Coverage
**Decision**: Use Jest for unit testing with 80% coverage requirement  
**Rationale**:
- Industry standard for Node.js testing
- 80% coverage provides good confidence
- Achievable with proper test design

### Integration Testing: API Endpoints
**Decision**: Test all API endpoints with real database interactions  
**Rationale**:
- Ensures API contracts work correctly
- Catches integration issues early
- Provides confidence in data flow

### E2E Testing: Critical User Flows
**Decision**: Test critical user flows with Cypress  
**Rationale**:
- Ensures complete user journeys work
- Catches UI and integration issues
- Provides confidence in deployment

## Deployment Strategy

### Infrastructure as Code: Terraform
**Decision**: Use Terraform for AWS infrastructure provisioning  
**Rationale**:
- Reproducible infrastructure
- Version controlled changes
- Easy to manage multiple environments
- Industry standard for AWS

### Deployment Pipeline: GitHub Actions
**Decision**: Automated deployment through GitHub Actions  
**Rationale**:
- Consistent deployment process
- Reduces human error
- Enables rapid iteration
- Integrates with development workflow

### Environment Strategy: Staging + Production
**Decision**: Maintain staging and production environments  
**Rationale**:
- Safe testing of changes
- Reduces production issues
- Enables gradual rollouts
- Supports rollback procedures

## Monitoring and Observability

### Logging: Structured JSON Logs
**Decision**: Implement structured JSON logging for all application events  
**Rationale**:
- Easy to parse and analyze
- Supports log aggregation
- Enables debugging and monitoring
- Industry standard format

### Health Checks: Application Endpoints
**Decision**: Implement /healthz endpoint for application health monitoring  
**Rationale**:
- Enables load balancer health checks
- Supports monitoring and alerting
- Simple to implement and maintain
- Standard practice for web applications

### Error Tracking: Basic Application Logging
**Decision**: Implement basic error logging without external services  
**Rationale**:
- Cost-effective for small scale
- Sufficient for debugging needs
- Reduces external dependencies
- Can be enhanced later if needed

## Data Management

### Backup Strategy: AWS RDS Automated Backups
**Decision**: Use AWS RDS PostgreSQL automated backups with point-in-time recovery  
**Rationale**:
- Managed backup service with automated retention policies
- Point-in-time recovery capabilities for maximum data protection
- Cost-effective for production workloads
- Reduces operational overhead
- Built-in disaster recovery options

### Data Retention: 1-Year Minimum
**Decision**: Retain financial data for minimum 1 year  
**Rationale**:
- Compliance with financial regulations
- Supports audit requirements
- Balances storage costs with requirements
- Can be extended if needed

### Data Migration: Prisma Migrations
**Decision**: Use Prisma migrations for database schema changes  
**Rationale**:
- Type-safe schema evolution
- Version controlled changes
- Easy to apply and rollback
- Integrates with deployment pipeline

## NgRx State Management Decisions

### State Management: NgRx with Feature Modules
**Decision**: Use NgRx for state management with feature-based modules and normalized state  
**Rationale**:
- Predictable state management with time-travel debugging
- Feature-based modules align with business domain (auth, subscriptions, payments, reports)
- Normalized state using @ngrx/entity reduces data duplication
- Smart/dumb component pattern promotes testability
- Effects handle all HTTP calls with actions generated by selectors
- Global error/loading state management for consistent UX

**Alternatives considered**:
- Redux (more boilerplate, less Angular integration)
- Akita (smaller ecosystem, less familiar)
- Component state (doesn't scale, hard to test)
- Service-based state (not predictable, hard to debug)

### Component Architecture: Smart/Dumb Pattern
**Decision**: Implement smart/dumb component architecture with selectors for data binding  
**Rationale**:
- Clear separation of concerns: components only display and bind data
- All viewmodel logic in selectors for testability and reusability
- Smart components handle user interactions and dispatch actions
- Dumb components receive data via inputs and emit events
- Promotes component reusability and testability

**Alternatives considered**:
- All smart components (harder to test, more coupling)
- Service-based components (less predictable, harder to debug)
- Mixed approach (inconsistent patterns, harder to maintain)

### State Persistence: No Persistence
**Decision**: No state persistence - all state recreated on page refresh  
**Rationale**:
- Maximum security for financial data
- Prevents data leakage in browser storage
- Simpler implementation and debugging
- Aligns with stateless backend architecture
- Reduces attack surface and compliance concerns

**Alternatives considered**:
- Local storage (security risk for financial data)
- Session storage (still persists during session)
- IndexedDB (complex, overkill for small scale)

### Error Handling: Global State Management
**Decision**: Global error and loading state in NgRx store with selectors for UI state  
**Rationale**:
- Consistent error handling across the application
- Centralized loading states for better UX
- Selectors provide clean separation of UI state logic
- Easy to test and debug error scenarios
- Reduces boilerplate in components

**Alternatives considered**:
- Component-level error handling (inconsistent, hard to manage)
- Service-based error handling (less predictable, harder to test)
- Mixed approach (inconsistent patterns, harder to maintain)

## Frontend Architecture Evolution

### Template Organization: Separate HTML Files
**Decision**: Plan to separate component templates into dedicated HTML files instead of inline templates  
**Rationale**:
- Better maintainability and developer experience
- Improved IDE support with syntax highlighting and IntelliSense
- Easier collaboration and code review for template changes
- Follows Angular best practices and community standards

### Signals Migration Strategy
**Decision**: Plan for future Angular signals migration after core functionality is stable  
**Rationale**:
- Current NgRx/Observables implementation is functional and stable
- Signals migration represents a significant architectural change
- Risk reduction: complete core features before major refactoring
- Angular 18+ signals will provide better performance and developer experience when ready

**Migration Timeline**:
- Phase 1: Complete core functionality with current NgRx approach
- Phase 2: Separate templates into HTML files for immediate improvement
- Phase 3: Plan signals migration after system stabilization