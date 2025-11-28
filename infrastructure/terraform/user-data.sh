#!/bin/bash
# EC2 User Data Script - Install Docker and Docker Compose
# Feature: simplify-aws-to-ec2

set -e

# Log output to file
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting EC2 initialization for ${project_name}-${environment}..."

# Update system
echo "Updating system packages..."
yum update -y

# Install Docker
echo "Installing Docker..."
yum install -y docker

# Start and enable Docker service
echo "Starting Docker service..."
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -a -G docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION="2.24.0"
curl -L "https://github.com/docker/compose/releases/download/v$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installations
echo "Verifying installations..."
docker --version
docker-compose --version

# Create application directory
echo "Creating application directory..."
mkdir -p /opt/${project_name}
chown ec2-user:ec2-user /opt/${project_name}

# Create deployment script directory
mkdir -p /opt/${project_name}/scripts
chown ec2-user:ec2-user /opt/${project_name}/scripts

# Install git (for deployment scripts if needed)
echo "Installing git..."
yum install -y git

# Install AWS CLI v2
echo "Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
yum install -y unzip
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Configure log rotation for Docker containers
echo "Configuring Docker log rotation..."
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Restart Docker to apply configuration
systemctl restart docker

# Create systemd service for automatic deployment on boot (optional)
cat > /etc/systemd/system/${project_name}-app.service <<EOF
[Unit]
Description=${project_name} Application Containers
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/${project_name}
ExecStart=/usr/local/bin/docker-compose -f /opt/${project_name}/docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f /opt/${project_name}/docker-compose.prod.yml down
User=ec2-user

[Install]
WantedBy=multi-user.target
EOF

# Don't enable the service yet - it will be enabled after first deployment
# systemctl enable ${project_name}-app.service

echo "EC2 initialization complete!"
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
echo "AWS CLI version: $(aws --version)"
echo "Application directory: /opt/${project_name}"

