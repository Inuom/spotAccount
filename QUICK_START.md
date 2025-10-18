# Quick Start Guide

**Status**: Phase 2 Complete ✅  
**Next**: Ready for Phase 3 (User Story Implementation)

## 🚀 Getting Started (5 Minutes)

### 1. Setup Backend Database

```bash
cd backend

# Install dependencies (if needed)
npm install

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Create .env file from template
cp .env.example .env
```

### 2. Start Backend Server

```bash
cd backend
npm run start:dev
```

**Backend will run on**: http://localhost:3000/api

### 3. Start Frontend (New Terminal)

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Start development server
npm start
```

**Frontend will run on**: http://localhost:4200

### 4. Verify Setup

Test the health endpoints:

```bash
# Application health
curl http://localhost:3000/api/health

# Database health
curl http://localhost:3000/api/health/db
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-18T..."
}
```

---

## 🎯 What's Available Now

### Backend API Endpoints
- `GET /api/health` - Application health check
- `GET /api/health/db` - Database connectivity check

### Authentication (Ready to Use)
- JWT authentication middleware configured
- Role-based guards (ADMIN/USER) ready
- Use `@Public()` decorator for public routes
- Use `@Roles(Role.ADMIN)` for admin-only routes

### Database
- Prisma ORM configured
- SQLite database ready
- All entities defined:
  - User, Subscription, SubscriptionParticipant
  - Charge, ChargeShare, Payment
- Migrations ready to run

### Frontend
- Angular 17 application ready
- NgRx store configured (auth, ui)
- Route guards ready (authGuard, adminGuard)
- API service ready
- HTTP interceptors configured

---

## 📝 Next Steps

### Phase 3: Implement User Story 1

**Goal**: Administrators can create subscriptions and generate monthly charges

**Tasks** (T026-T043):
1. Create backend entities and services
2. Implement subscription API endpoints
3. Create frontend components
4. Implement NgRx effects and actions
5. Create admin pages

### Starting Development

**Backend Development**:
```bash
# Create a new module
cd backend/src
nest g module subscriptions
nest g service subscriptions
nest g controller subscriptions
```

**Frontend Development**:
```bash
# Create a new component
cd frontend
ng g component pages/admin/subscriptions
ng g component components/subscription-form
```

**Database Changes**:
```bash
# After modifying schema.prisma
cd backend
npx prisma generate
npx prisma migrate dev --name descriptive_name
```

---

## 🛠️ Development Commands

### Backend

```bash
# Development
npm run start:dev       # Start with hot reload

# Build
npm run build          # Compile TypeScript

# Testing
npm test               # Run tests
npm run test:cov       # Run tests with coverage

# Database
npx prisma studio      # Open database GUI
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Create migration
```

### Frontend

```bash
# Development
npm start              # Start dev server
ng serve              # Alternative

# Build
npm run build         # Build for production
ng build              # Alternative

# Testing
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run e2e           # Run E2E tests
```

---

## 🔍 Project Structure

### Backend
```
backend/src/
├── auth/          # ✅ JWT authentication & guards
├── common/        # ✅ Filters, interceptors, middleware
├── database/      # ✅ Prisma service
├── health/        # ✅ Health check endpoints
├── users/         # ⏳ User management (Phase 3)
├── subscriptions/ # ⏳ Subscription management (Phase 3)
├── charges/       # ⏳ Charge generation (Phase 3)
├── payments/      # ⏳ Payment processing (Phase 4)
└── reports/       # ⏳ Reporting (Phase 6)
```

### Frontend
```
frontend/src/app/
├── guards/        # ✅ Route guards
├── interceptors/  # ✅ HTTP interceptors
├── services/      # ✅ API service
├── store/         # ✅ NgRx state (auth, ui)
├── components/    # ⏳ Reusable components (Phase 3+)
└── pages/         # ⏳ Page components (Phase 3+)
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Problem**: `Error: Cannot find module '@prisma/client'`
```bash
cd backend
npx prisma generate
npm run start:dev
```

**Problem**: Database errors
```bash
cd backend
rm prisma/*.db  # Remove old database
npx prisma migrate reset  # Reset migrations
npx prisma migrate dev --name init
```

### Frontend Won't Start

**Problem**: Dependency errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

**Problem**: Port already in use
```bash
# Change port in package.json or:
ng serve --port 4201
```

### CORS Errors

Make sure backend CORS is configured for frontend URL:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:4200`

Check `backend/src/main.ts` CORS configuration.

---

## 📚 Documentation

- **[README.md](./README.md)** - Main project documentation
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Detailed progress report
- **[specs/001-shared-subscription-spec/](./specs/001-shared-subscription-spec/)** - Feature specifications
  - `spec.md` - Feature requirements
  - `plan.md` - Implementation plan
  - `tasks.md` - Task breakdown
  - `data-model.md` - Database schema details
  - `contracts/openapi.yaml` - API specification

---

## 🎓 Architecture Patterns

### Backend (NestJS)
- **Modules**: Feature-based organization
- **Services**: Business logic
- **Controllers**: HTTP endpoints
- **Guards**: Authentication & authorization
- **Filters**: Error handling
- **Interceptors**: Logging & transformation

### Frontend (Angular + NgRx)
- **Smart Components**: Connected to store, dispatch actions
- **Dumb Components**: Receive data via @Input, emit events
- **Effects**: Handle side effects (HTTP calls)
- **Selectors**: Derive data from store
- **Actions**: Describe state changes
- **Reducers**: Update state immutably

---

## 🔐 Security Notes

- **JWT Secret**: Change in production (`.env` file)
- **CORS**: Configure allowed origins for production
- **HTTPS**: Required in production (handled by CloudFront)
- **Rate Limiting**: Consider adding for production
- **Input Validation**: Already configured with ValidationPipe
- **SQL Injection**: Protected by Prisma ORM

---

## 🚢 Ready for Production?

### Before Deployment
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add comprehensive tests (80% coverage)
- [ ] Configure production environment variables
- [ ] Set up Terraform for AWS infrastructure
- [ ] Configure database backups
- [ ] Set up monitoring and alerting
- [ ] Security audit

### Current State
- ✅ Application foundation ready
- ✅ Development environment configured
- ✅ Authentication & authorization implemented
- ✅ Error handling and logging configured
- ✅ Database schema defined
- ⏳ Business logic to be implemented (Phase 3+)

---

**Happy Coding! 🎉**

For questions or issues, refer to the [full documentation](./README.md) or [implementation status](./IMPLEMENTATION_STATUS.md).

