#!/bin/bash
# Let's Encrypt SSL Setup Script
# Feature: simplify-aws-to-ec2
# Run this script on the EC2 instance to set up SSL certificates

set -e

# Configuration
DOMAIN_NAME="${1:-}"
EMAIL="${2:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Validate inputs
if [ -z "$DOMAIN_NAME" ]; then
    error "Domain name is required"
    echo "Usage: $0 <domain_name> <email>"
    echo "Example: $0 example.com admin@example.com"
    exit 1
fi

if [ -z "$EMAIL" ]; then
    error "Email is required"
    echo "Usage: $0 <domain_name> <email>"
    echo "Example: $0 example.com admin@example.com"
    exit 1
fi

log "Setting up SSL certificates for $DOMAIN_NAME"

# Check if domain resolves to this server
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
DOMAIN_IP=$(dig +short $DOMAIN_NAME | tail -1)

if [ "$PUBLIC_IP" != "$DOMAIN_IP" ]; then
    warning "Domain $DOMAIN_NAME does not resolve to this server's IP ($PUBLIC_IP)"
    warning "Current resolution: $DOMAIN_IP"
    warning "Please update your DNS records before continuing"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create directory for Let's Encrypt challenge
log "Creating Let's Encrypt challenge directory..."
mkdir -p /opt/spotaccount/nginx/certbot-webroot/.well-known/acme-challenge
chown -R ec2-user:ec2-user /opt/spotaccount/nginx/certbot-webroot

# Update nginx configuration with domain name
log "Updating nginx configuration..."
cd /opt/spotaccount
sed -i "s/DOMAIN_NAME/$DOMAIN_NAME/g" nginx/nginx.conf

# Temporarily use HTTP-only nginx config for Let's Encrypt challenge
log "Creating temporary HTTP-only nginx configuration..."
cat > nginx/nginx-temp.conf << 'NGINX_TEMP'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'Let\'s Encrypt setup in progress...';
            add_header Content-Type text/plain;
        }
    }
}
NGINX_TEMP

# Restart nginx with temporary config
log "Restarting nginx with temporary configuration..."
docker run --rm \
    -v /opt/spotaccount/nginx/nginx-temp.conf:/etc/nginx/nginx.conf:ro \
    -v /opt/spotaccount/nginx/certbot-webroot:/var/www/certbot \
    -p 80:80 \
    --name nginx-temp \
    -d \
    nginx:alpine

sleep 5

# Obtain SSL certificate
log "Obtaining SSL certificate from Let's Encrypt..."
docker run --rm \
    -v /opt/spotaccount/nginx/certbot-etc:/etc/letsencrypt \
    -v /opt/spotaccount/nginx/certbot-var:/var/lib/letsencrypt \
    -v /opt/spotaccount/nginx/certbot-webroot:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN_NAME

if [ $? -eq 0 ]; then
    log "SSL certificate obtained successfully!"
else
    error "Failed to obtain SSL certificate"
    docker stop nginx-temp
    exit 1
fi

# Stop temporary nginx
log "Stopping temporary nginx..."
docker stop nginx-temp

# Update environment file with domain name
log "Updating environment file..."
if [ -f /opt/spotaccount/.env.production ]; then
    sed -i "s|DOMAIN_NAME=.*|DOMAIN_NAME=$DOMAIN_NAME|" /opt/spotaccount/.env.production
    sed -i "s|LETSENCRYPT_EMAIL=.*|LETSENCRYPT_EMAIL=$EMAIL|" /opt/spotaccount/.env.production
fi

# Start application with full nginx config
log "Starting application with HTTPS enabled..."
cd /opt/spotaccount
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

log "SSL setup complete!"
log "Your application should now be accessible at https://$DOMAIN_NAME"
log ""
log "Certificate will be automatically renewed by the certbot container"
log "Renewal happens every 12 hours, certificates are renewed if they expire in less than 30 days"

exit 0

