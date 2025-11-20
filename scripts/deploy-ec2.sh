#!/bin/bash
# EC2 Deployment Script
# Feature: simplify-aws-to-ec2
# This script pulls the latest Docker images and restarts containers

set -e

# Configuration
APP_DIR="/opt/spotaccount"
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"
ENV_FILE="$APP_DIR/.env.production"
LOG_FILE="$APP_DIR/deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as ec2-user
if [ "$USER" != "ec2-user" ]; then
    error "This script should be run as ec2-user"
    exit 1
fi

# Check if required files exist
if [ ! -f "$ENV_FILE" ]; then
    error "Environment file not found: $ENV_FILE"
    error "Please create it from env.production.template"
    exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
    error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

log "Starting deployment..."

# Change to application directory
cd "$APP_DIR"

# Load environment variables
log "Loading environment variables..."
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Authenticate with ECR
log "Authenticating with AWS ECR..."
AWS_REGION=$(echo "$BACKEND_IMAGE" | cut -d'.' -f4)
AWS_ACCOUNT_ID=$(echo "$BACKEND_IMAGE" | cut -d'.' -f1)

if ! aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"; then
    error "Failed to authenticate with ECR"
    exit 1
fi

# Pull latest images
log "Pulling latest Docker images..."
if ! docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull; then
    error "Failed to pull Docker images"
    exit 1
fi

# Stop existing containers gracefully
log "Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --timeout 30 || warning "Some containers may not have stopped cleanly"

# Start new containers
log "Starting new containers..."
if ! docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d; then
    error "Failed to start containers"
    exit 1
fi

# Wait for backend to be healthy
log "Waiting for backend to be healthy..."
TIMEOUT=60
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    if docker exec spotaccount-backend wget --quiet --tries=1 --spider http://localhost:3000/healthz 2>/dev/null; then
        log "Backend is healthy"
        break
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    error "Backend health check timed out"
    log "Showing backend logs:"
    docker logs --tail 50 spotaccount-backend
    exit 1
fi

# Run database migrations (if needed)
log "Running database migrations..."
if ! docker exec spotaccount-backend npx prisma migrate deploy; then
    warning "Database migration failed or not needed"
fi

# Clean up old images
log "Cleaning up old Docker images..."
docker image prune -f || warning "Failed to clean up old images"

# Show container status
log "Container status:"
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

log "Deployment completed successfully!"
log "Application is now running at https://$(hostname -f)"

exit 0

