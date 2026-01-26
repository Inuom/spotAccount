# Local PostgreSQL Setup Guide

## Quick Setup (Recommended)

### 1. Start PostgreSQL Container

```bash
# Start only PostgreSQL (fastest for development)
docker-compose up -d postgres

# Wait for it to be ready (should take 5-10 seconds)
docker-compose logs -f postgres
# Press Ctrl+C when you see "database system is ready to accept connections"
```

### 2. Populate the Database

```bash
# Navigate to backend
cd backend

# Set DATABASE_URL (if not using docker-compose for backend)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/spotaccount"

# Run populate script (migrations + seed)
bash ../scripts/populate-db.sh
```

Expected output:
```
✓ Migrations applied successfully
✓ Seed completed successfully
Database population completed!
```

### 3. Verify PostgreSQL is Running

```bash
# Check container status
docker-compose ps

# Should show:
# NAME                     STATUS
# spotaccount-postgres     Up X seconds (healthy)

# Test database connection
docker exec spotaccount-postgres psql -U postgres -c "\l"
# Should list databases including 'spotaccount'
```

---

## Development Workflows

### Option A: Backend Outside Docker (Faster iteration)

**Best for**: Active backend development with hot reload

```bash
# Terminal 1: Keep PostgreSQL running
docker-compose up -d postgres

# Terminal 2: Run backend locally
cd backend
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/spotaccount"
npm run start:dev

# Terminal 3: Run frontend locally
cd frontend
npm start
```

**Access**:
- Backend: http://localhost:3000/api
- Frontend: http://localhost:4200

### Option B: Full Docker Compose (Mirrors production)

**Best for**: Testing full stack, deployment simulation

```bash
# Start all services
docker-compose up

# Or in detached mode
docker-compose up -d
docker-compose logs -f backend  # Watch backend logs
```

**Access**:
- Backend: http://localhost:3000/api
- Frontend: http://localhost:4200

---

## Common Tasks

### Reset Database (Clean Start)

```bash
# Stop containers
docker-compose down

# Remove PostgreSQL data volume
docker volume rm spotaccount_postgres_data

# Start fresh
docker-compose up -d postgres
cd backend
bash ../scripts/populate-db.sh
```

### View Database with Prisma Studio

```bash
cd backend
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/spotaccount"
npx prisma studio
# Opens at http://localhost:5555
```

### Access PostgreSQL Shell

```bash
# Via Docker
docker exec -it spotaccount-postgres psql -U postgres -d spotaccount

# Common commands in psql:
\dt              # List tables
\d users         # Describe users table
SELECT * FROM users;  # Query users
\q               # Quit
```

### Check Database Size

```bash
docker exec spotaccount-postgres psql -U postgres -c "\l+"
```

---

## Troubleshooting

### "Cannot connect to Docker daemon"
**Problem**: Docker Desktop isn't running

**Solution**: 
1. Start Docker Desktop from Start Menu
2. Wait for it to fully start (system tray icon stops animating)
3. Retry: `docker-compose up -d postgres`

### "Port 5432 already in use"
**Problem**: Another PostgreSQL instance is running

**Solution**:
```bash
# Option 1: Stop other PostgreSQL service
# Windows: Services → PostgreSQL → Stop

# Option 2: Change port in docker-compose.yml
# ports:
#   - "5433:5432"  # Use 5433 on host
# Then update DATABASE_URL to use port 5433
```

### "Prisma migrate failed"
**Problem**: Database not ready or connection issue

**Solution**:
```bash
# Verify PostgreSQL is healthy
docker-compose ps
docker-compose logs postgres

# Check connection
docker exec spotaccount-postgres pg_isready -U postgres

# If still failing, try full reset (see above)
```

### "Admin user already exists"
**Problem**: Seed ran multiple times (this is OK)

**Solution**: This is normal and safe. The seed script is idempotent.

---

## Environment Variables

### Local Development (default values)

```bash
# .env or export in terminal
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/spotaccount"
JWT_SECRET="your-super-secret-jwt-key"
CORS_ORIGIN="http://localhost:4200"
PORT=3000
```

### Docker Compose (automatically set)

Docker Compose injects these for you when using `docker-compose up`:
- `DATABASE_URL`: Points to `postgres` container (internal network)
- All other variables from `docker-compose.yml`

---

## Default Credentials

**PostgreSQL**:
- Host: `localhost` (or `postgres` inside Docker network)
- Port: `5432`
- Database: `spotaccount`
- User: `postgres`
- Password: `postgres`

**Application Admin**:
- Email: `admin@example.com`
- Password: `0000`
- **⚠️ Change immediately after first login!**

---

## Performance Tips

### Keep PostgreSQL Running
Leave the postgres container running during development to avoid startup delays:
```bash
# Never stop, just keeps running
docker-compose up -d postgres
```

### Use Local Backend (Not Docker)
For faster iteration, run backend locally with Docker PostgreSQL:
```bash
docker-compose up -d postgres  # Only database in Docker
cd backend
npm run start:dev              # Backend on host (hot reload)
```

---

## Next Steps

1. ✅ Start PostgreSQL: `docker-compose up -d postgres`
2. ✅ Populate database: `cd backend && bash ../scripts/populate-db.sh`
3. ✅ Start backend: `npm run start:dev` (in backend directory)
4. ✅ Start frontend: `npm start` (in frontend directory)
5. ✅ Login: http://localhost:4200 with `admin@example.com` / `0000`
