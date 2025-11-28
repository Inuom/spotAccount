#!/bin/sh
set -e

echo "Starting backend application..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set. Using default SQLite database."
  export DATABASE_URL="file:/app/prisma/dev.db"
fi

# For SQLite, ensure the database file exists
# If it doesn't exist, Prisma will create it on first connection
# The schema is already available in /app/prisma/schema.prisma

echo "DATABASE_URL: $DATABASE_URL"

# Start the application
exec npm run start:prod

