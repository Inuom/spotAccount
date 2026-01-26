#!/bin/sh
set -e

echo "Starting backend application..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is required"
  echo "Example: DATABASE_URL='postgresql://user:pass@host:5432/dbname'"
  exit 1
fi

# Run database migrations before starting
echo "Running database migrations..."
npx prisma migrate deploy || {
  echo "ERROR: Database migration failed"
  exit 1
}

# Run database seed (idempotent - safe to run multiple times)
echo "Running database seed..."
npx prisma db seed || {
  echo "WARNING: Database seed failed or no changes needed. Continuing..."
}

# Hide password in logs
DB_URL_SAFE=$(echo "$DATABASE_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')
echo "Connected to: $DB_URL_SAFE"

# Start the application
exec npm run start:prod

