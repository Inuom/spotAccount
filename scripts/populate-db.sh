#!/bin/bash
# Database Population Script
# Runs Prisma migrations and seed to populate the database

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL environment variable is not set"
    error "For local development: export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/spotaccount'"
    error "Or run this script inside the backend container: docker-compose exec backend bash scripts/populate-db.sh"
    exit 1
fi

log "Starting database population..."
log "DATABASE_URL: ${DATABASE_URL%%@*}@***" # Hide password in logs

# Navigate to backend directory if not already there
if [ -d "backend" ]; then
    cd backend
fi

# Run migrations
log "Running Prisma migrations..."
if npx prisma migrate deploy; then
    log "✓ Migrations applied successfully"
else
    error "Failed to apply migrations"
    exit 1
fi

# Run seed
log "Running database seed..."
if npx prisma db seed; then
    log "✓ Seed completed successfully"
else
    warning "Seed script failed or no changes needed"
fi

log "Database population completed!"
log ""
log "Next steps:"
log "  - Start the application: npm run start:dev (or docker-compose up)"
log "  - Login with admin credentials: admin@example.com / 0000"
log "  - Change the admin password immediately after first login"
