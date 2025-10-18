# Quickstart Guide: Shared Subscription Debt Manager

**Date**: 2025-10-17  
**Feature**: 001-shared-subscription-spec  
**Purpose**: Get the application running locally for development

## Prerequisites

### Required Software
- **Node.js**: 18+ (LTS recommended)
- **npm**: 9+ (comes with Node.js)
- **Git**: Latest version
- **PowerShell**: 7+ (Windows)
- **Cursor IDE**: Latest version (recommended)

### Optional Software
- **Docker**: For containerized development
- **AWS CLI**: For deployment testing

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd spotAccount
```

### 2. Install Dependencies

#### Backend Setup
```bash
cd backend
npm install
```

#### Frontend Setup
```bash
cd frontend
npm install
# Install NgRx dependencies
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools
```

### 3. Database Setup

#### Initialize SQLite Database
```bash
cd backend
npx prisma generate
npx prisma db push
```

#### Seed Development Data (Optional)
```bash
npx prisma db seed
```

### 4. Environment Configuration

#### Backend Environment (.env)
```bash
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Application
PORT=3000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:4200"
```

#### Frontend Environment (src/environments/environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Shared Subscription Manager'
};
```

### 5. Start Development Servers

#### Terminal 1: Backend
```bash
cd backend
npm run start:dev
```

#### Terminal 2: Frontend
```bash
cd frontend
npm start
```

### 6. Verify Setup

#### Backend Health Check
```bash
curl http://localhost:3000/healthz
```

#### Frontend Access
Open browser to: `http://localhost:4200`

## Development Workflow

### 1. Database Changes

#### Create Migration
```bash
cd backend
npx prisma migrate dev --name <migration-name>
```

#### Apply Migrations
```bash
npx prisma migrate deploy
```

#### Reset Database
```bash
npx prisma migrate reset
```

### 2. API Development

#### Generate Prisma Client
```bash
npx prisma generate
```

#### View Database
```bash
npx prisma studio
```

### 3. Testing

#### Run All Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

#### Run E2E Tests
```bash
# Backend
npm run test:e2e

# Frontend
npm run e2e
```

#### Coverage Report
```bash
# Backend
npm run test:cov

# Frontend
npm run test:cov
```

### 4. Code Quality

#### Linting
```bash
# Backend
npm run lint

# Frontend
npm run lint
```

#### Formatting
```bash
# Backend
npm run format

# Frontend
npm run format
```

### 5. NgRx Development

#### Generate NgRx Feature Module
```bash
cd frontend
ng generate @ngrx/schematics:feature --name=feature-name --module=app.module.ts
```

#### NgRx DevTools
```bash
# Install Redux DevTools browser extension
# Enable in development environment
npm run start:dev
```

#### State Management Testing
```bash
# Test selectors
npm run test -- --testNamePattern="selectors"

# Test effects
npm run test -- --testNamePattern="effects"

# Test reducers
npm run test -- --testNamePattern="reducers"
```

## Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── subscriptions/  # Subscription management
│   ├── charges/        # Charge generation
│   ├── payments/       # Payment processing
│   ├── reports/        # Reporting
│   ├── common/         # Shared utilities
│   └── database/       # Database configuration
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
└── tests/              # Test files
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   └── user/       # User pages
│   │   ├── services/       # API services
│   │   ├── guards/         # Route guards
│   │   └── models/         # TypeScript models
│   ├── assets/             # Static assets
│   └── environments/       # Environment configs
└── tests/                  # Test files
```

## Common Development Tasks

### 1. Create New User
```bash
# Via API
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "email": "user@example.com",
    "name": "Test User",
    "password": "password123",
    "role": "user"
  }'
```

### 2. Create Subscription
```bash
curl -X POST http://localhost:3000/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "title": "Netflix Subscription",
    "total_amount": 15.99,
    "billing_day": 1,
    "participants": [
      {"user_id": "user-id-1", "share_type": "equal"},
      {"user_id": "user-id-2", "share_type": "equal"}
    ]
  }'
```

### 3. Generate Charges
```bash
curl -X POST "http://localhost:3000/subscriptions/{id}/generate-charges?until=2025-12-31" \
  -H "Authorization: Bearer <admin-token>"
```

### 4. Create Payment
```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-token>" \
  -d '{
    "user_id": "user-id",
    "amount": 7.99,
    "scheduled_date": "2025-10-20"
  }'
```

### 5. Verify Payment
```bash
curl -X PATCH http://localhost:3000/payments/{id}/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "verification_reference": "BANK-REF-123"
  }'
```

## Troubleshooting

### Common Issues

#### 1. Database Connection
```bash
# Check if database file exists
ls -la backend/dev.db

# Reset database
cd backend
npx prisma migrate reset
```

#### 2. Port Conflicts
```bash
# Check if ports are in use
netstat -an | findstr :3000
netstat -an | findstr :4200

# Kill processes if needed
taskkill /F /PID <process-id>
```

#### 3. Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset and apply migrations
npx prisma migrate reset
```

### Debug Mode

#### Backend Debug
```bash
cd backend
npm run start:debug
```

#### Frontend Debug
```bash
cd frontend
npm run start -- --configuration=development
```

## Production Deployment

### 1. Build Applications
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### 2. Database Migration
```bash
cd backend
npx prisma migrate deploy
```

### 3. Environment Variables
Set production environment variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `PORT`

### 4. AWS Deployment
```bash
# Deploy infrastructure
cd infrastructure/terraform
terraform init
terraform plan
terraform apply

# Deploy applications
./scripts/deploy.sh
```

## Useful Commands

### Database Management
```bash
# View database in browser
npx prisma studio

# Generate migration
npx prisma migrate dev --name <name>

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Testing
```bash
# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- <test-file>

# Run tests with coverage
npm run test:cov
```

### Code Quality
```bash
# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

## Next Steps

1. **Read the API Documentation**: Review `contracts/openapi.yaml`
2. **Understand the Data Model**: Review `data-model.md`
3. **Set up CI/CD**: Configure GitHub Actions
4. **Deploy to Staging**: Test in staging environment
5. **Production Deployment**: Deploy to production

## Support

- **Documentation**: Check this repository's docs folder
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **API Reference**: Generated from OpenAPI spec
