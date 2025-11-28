# Frontend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm config set ignore-scripts true --global

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

RUN npm config set ignore-scripts true --global

# Build the application
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose port
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4200 || exit 1

# Start the application
CMD ["serve", "-s", "dist/frontend", "-l", "4200"]
