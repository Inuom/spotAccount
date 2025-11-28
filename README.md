# Shared Subscription Debt Manager

A full-stack web application for managing shared subscription costs among small groups (5-20 users), automating debt tracking, calculations, and reimbursements.

## 🏗️ Architecture

- **Backend**: NestJS with TypeScript, PostgreSQL database, Prisma ORM
- **Frontend**: Angular 17+ SPA with NgRx state management
- **Infrastructure**: AWS EC2 (single instance) with Docker containers, Terraform IaC
- **Deployment**: Docker Compose, Nginx reverse proxy, Let's Encrypt SSL
- **CI/CD**: GitHub Actions with automated EC2 deployment
- **Cost**: ~€12-15/month (optimized for small-scale deployments)

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+ or yarn
- Git

## 🚀 Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run start:dev
```

The backend API will be available at `http://localhost:3000/api`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:4200`

## 📁 Project Structure

```
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── subscriptions/  # Subscription management
│   │   ├── charges/        # Charge generation
│   │   ├── payments/       # Payment processing
│   │   ├── reports/        # Reporting
│   │   ├── common/         # Shared utilities
│   │   └── database/       # Database configuration
│   ├── prisma/             # Database schema and migrations
│   └── tests/              # Backend tests
│
├── frontend/               # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Reusable components
│   │   │   ├── pages/      # Page components (admin/user)
│   │   │   ├── store/      # NgRx state management
│   │   │   ├── services/   # API services
│   │   │   ├── guards/     # Route guards
│   │   │   └── models/     # TypeScript models
│   │   ├── assets/         # Static assets
│   │   └── environments/   # Environment configs
│   └── tests/              # Frontend tests
│
├── infrastructure/         # Terraform IaC
│   └── terraform/
│
└── specs/                  # Feature specifications
    └── 001-shared-subscription-spec/
```

## 🔧 Development

### Backend Commands

```bash
npm run build          # Build for production
npm run start:dev      # Start development server
npm run test           # Run tests
npm run test:cov       # Run tests with coverage
npm run lint           # Lint code
```

### Frontend Commands

```bash
npm start              # Start development server
npm run build          # Build for production
npm test               # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run e2e            # Run E2E tests
npm run lint           # Lint code
```

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage report
```

### Frontend Testing
```bash
cd frontend
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run e2e           # Run E2E tests with Cypress
```

**Coverage Target**: 80% minimum across all test types

## 🌐 API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI spec: `specs/001-shared-subscription-spec/contracts/openapi.yaml`

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC): admin/user roles
- Password hashing with bcrypt
- HTTPS enforcement (production)
- Rate limiting on API endpoints
- CSRF protection
- Audit logging for critical actions

## 📊 Features

### User Stories (Priority Order)

1. **P1: Configure Shared Subscription** - Administrators create subscriptions and generate monthly charges
2. **P1: Verify User Payments** - Administrators verify user payments to settle shares
3. **P2: User Payment Management** - Users manage their own pending payments
4. **P3: View Balances and Reports** - Users and admins view balances as of a date

### Key Entities

- **User**: System users with admin or user roles
- **Subscription**: Recurring shared expense configurations
- **Charge**: Monthly instances of subscription billing
- **Share**: Individual participant's portion of a charge
- **Payment**: Reimbursement records with verification workflow

## 🚢 Deployment

This application uses a simplified, cost-effective AWS EC2 deployment (~€12-15/month).

### Quick Deployment

For automated deployment via GitHub Actions:

1. Complete AWS setup (see [AWS Manual Actions Guide](docs/aws-manual-actions.md))
2. Configure GitHub Secrets
3. Push to master branch - automatic deployment via GitHub Actions

### Manual Deployment

For detailed step-by-step instructions, see the [EC2 Deployment Guide](docs/ec2-deployment-guide.md).

#### Quick Start:

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init \
  -backend-config="bucket=spotaccount-terraform-state" \
  -backend-config="key=terraform.tfstate" \
  -backend-config="region=eu-west-1"

# Apply infrastructure
terraform apply -var-file="production.tfvars"

# Note the EC2 IP address from output
# SSH into EC2 and run deployment script
ssh -i key.pem ec2-user@<ec2-ip>
cd /opt/spotaccount
bash scripts/deploy-ec2.sh
```

### Architecture

- **EC2 Instance**: Single t3.micro/t3.small instance running Docker containers
- **Docker Compose**: Manages all services (backend, frontend, database, nginx)
- **Nginx**: Reverse proxy with Let's Encrypt SSL
- **PostgreSQL**: Containerized database with persistent volumes
- **ECR**: Docker image registry for backend and frontend

### Documentation

- 📘 [EC2 Deployment Guide](docs/ec2-deployment-guide.md) - Complete deployment instructions
- 🔧 [AWS Manual Actions](docs/aws-manual-actions.md) - AWS console setup guide
- 🚀 [Quick Start](docs/ec2-deployment-guide.md#quick-start) - Get up and running fast

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="24h"
PORT=3000
NODE_ENV="development"
```

### Frontend (environment.ts)
```typescript
apiUrl: 'http://localhost:3000/api'
production: false
```

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following the coding standards
3. Write tests for new features
4. Ensure all tests pass and coverage meets requirements
5. Submit a pull request with clear description

## 📄 License

ISC

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

## 🎯 Development Phases

- [x] **Phase 1**: Project setup and initialization ✅
- [x] **Phase 2**: Foundational infrastructure (auth, database, state management) ✅
- [ ] **Phase 3**: User Story 1 - Subscription management
- [ ] **Phase 4**: User Story 2 - Payment verification
- [ ] **Phase 5**: User Story 3 - User payment management
- [ ] **Phase 6**: User Story 4 - Reporting and balances
- [ ] **Phase 7**: Polish, testing, and infrastructure

## 📊 Current Status

**Phase 2 Complete!** The application now has:
- ✅ Backend API with NestJS + Prisma + SQLite
- ✅ JWT authentication and role-based authorization
- ✅ Frontend with Angular 17 + NgRx state management
- ✅ Health check endpoints (`/api/health`, `/api/health/db`)
- ✅ Global error handling and logging
- ✅ HTTP interceptors and route guards

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed progress report.

**Ready for Phase 3**: User Story implementation can now begin!

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-18

