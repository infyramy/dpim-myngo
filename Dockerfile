# =============================================================================
# Production Dockerfile for Coolify (Single Container)
# Frontend (Nginx) + Backend (Node.js) in one container
# =============================================================================

# Build stage
FROM node:20-alpine AS builder

# Install system dependencies for node-gyp
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build both frontend and backend
RUN pnpm run build:frontend && pnpm run build:backend

# Production stage with Nginx + Node.js
FROM nginx:alpine AS production

# Install Node.js, curl, and supervisor for process management
RUN apk add --no-cache \
    nodejs \
    npm \
    curl \
    supervisor

# Install PM2 for Node.js process management
RUN npm install -g pm2

# Create non-root user for Node.js
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Set working directory for backend
WORKDIR /app

# Copy package.json and install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --production=true

# Copy built backend from builder stage
COPY --from=builder /app/dist/server ./dist/server
COPY --from=builder /app/src/server/migrations ./src/server/migrations

# Copy built frontend from builder stage to nginx directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for single container
COPY nginx.single.conf /etc/nginx/conf.d/default.conf

# Create PM2 ecosystem file for backend
RUN echo 'module.exports = {\n\
  apps: [{\n\
    name: "myngo-backend",\n\
    script: "dist/server/index.js",\n\
    instances: 1,\n\
    autorestart: true,\n\
    watch: false,\n\
    max_memory_restart: "1G",\n\
    env: {\n\
      NODE_ENV: "production",\n\
      API_PORT: process.env.API_PORT || 3001,\n\
      API_HOST: "127.0.0.1"\n\
    }\n\
  }]\n\
};' > ecosystem.config.js

# Create supervisor configuration
RUN echo '[supervisord]\n\
nodaemon=true\n\
user=root\n\
\n\
[program:nginx]\n\
command=nginx -g "daemon off;"\n\
stdout_logfile=/var/log/nginx/access.log\n\
stderr_logfile=/var/log/nginx/error.log\n\
autorestart=true\n\
\n\
[program:backend]\n\
command=pm2-runtime start ecosystem.config.js\n\
directory=/app\n\
user=appuser\n\
stdout_logfile=/var/log/backend.log\n\
stderr_logfile=/var/log/backend.log\n\
autorestart=true' > /etc/supervisor/conf.d/supervisord.conf

# Set proper permissions
RUN chown -R appuser:appuser /app && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    mkdir -p /var/log/nginx && \
    touch /var/log/backend.log && \
    chmod 666 /var/log/backend.log

# Expose port 3000 for the combined service
EXPOSE 3000

# Health check for both services
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/nginx-health && curl -f http://localhost:3001/health || exit 1

# Start both services with supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]