#!/bin/sh
set -e

echo "Starting backend application..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set. Using default SQLite database."
  export DATABASE_URL="file:/app/prisma/dev.db"
fi

# For SQLite, ensure the database directory exists
mkdir -p /app/prisma

# Run database migrations before starting
echo "Running database migrations..."
npx prisma migrate deploy || {
  echo "WARNING: Database migration failed. Continuing anyway..."
}

echo "DATABASE_URL: $DATABASE_URL"

# Start the application
exec npm run start:prod

