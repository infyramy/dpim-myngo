# 🚀 Universal Dockerfile for Vue.js - Works Everywhere!
# Build arguments to control deployment type
ARG DEPLOYMENT_TYPE=production
ARG FRONTEND_PORT=3000
ARG API_SERVER_PORT=3001

# =============================================================================
# Stage 1: Builder (Common for all deployments)
# =============================================================================
FROM node:20-alpine AS builder

# Install system dependencies required for node-gyp builds
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies with Docker-optimized flags
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Build both frontend and backend
RUN pnpm run build

# =============================================================================
# Stage 2: Production (Frontend + Backend in same container)
# =============================================================================
FROM node:20-alpine AS production

# Install system dependencies including nginx for serving frontend
RUN apk add --no-cache \
    nginx \
    curl \
    wget \
    python3 \
    make \
    g++

# Install global packages
RUN npm install -g pnpm serve concurrently

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Set working directory
WORKDIR /app

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy built backend from builder stage  
COPY --from=builder /app/dist/server ./dist-server

# Copy package.json and source files needed for backend
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/http.d/default.conf.template

# Create startup script that runs both frontend (nginx) and backend (node)
RUN echo '#!/bin/sh' > start.sh && \
    echo '' >> start.sh && \
    echo '# Set default ports if not provided' >> start.sh && \
    echo 'export FRONTEND_PORT=${FRONTEND_PORT:-3000}' >> start.sh && \
    echo 'export API_SERVER_PORT=${API_SERVER_PORT:-3001}' >> start.sh && \
    echo '' >> start.sh && \
    echo 'echo "🚀 Starting myNGO Application"' >> start.sh && \
    echo 'echo "📱 Frontend (Nginx) will be available on port $FRONTEND_PORT"' >> start.sh && \
    echo 'echo "🔌 Backend API will be available on port $API_SERVER_PORT"' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Substitute environment variables in nginx config' >> start.sh && \
    echo 'envsubst '"'"'$FRONTEND_PORT'"'"' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Test nginx configuration' >> start.sh && \
    echo 'nginx -t' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Start both services using concurrently' >> start.sh && \
    echo 'exec concurrently \' >> start.sh && \
    echo '  --names "NGINX,BACKEND" \' >> start.sh && \
    echo '  --prefix-colors "blue,green" \' >> start.sh && \
    echo '  "nginx -g '"'"'daemon off;'"'"'" \' >> start.sh && \
    echo '  "node dist-server/index.js"' >> start.sh

# Make script executable
RUN chmod +x start.sh

# Ensure nginx directories exist and have proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /etc/nginx/http.d && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /etc/nginx/http.d

# Set environment variables with defaults
ENV FRONTEND_PORT=3000
ENV API_SERVER_PORT=3001

# Expose both ports
EXPOSE $FRONTEND_PORT $API_SERVER_PORT

# Health check for both services
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:$FRONTEND_PORT/ && \
    wget --no-verbose --tries=1 --spider http://localhost:$API_SERVER_PORT/health || exit 1

# Start both frontend and backend
CMD ["./start.sh"]

# =============================================================================
# Stage 3: Development (For local development with hot reload)
# =============================================================================
FROM node:20-alpine AS development

# Install system dependencies
RUN apk add --no-cache \
    curl \
    wget \
    python3 \
    make \
    g++

# Install global packages
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV FRONTEND_PORT=5173
ENV API_SERVER_PORT=3001

# Expose ports for development
EXPOSE 5173 3001

# Start development servers
CMD ["pnpm", "run", "dev"]

# =============================================================================
# Stage 4: Final (Auto-select based on DEPLOYMENT_TYPE)
# =============================================================================
FROM ${DEPLOYMENT_TYPE} AS final