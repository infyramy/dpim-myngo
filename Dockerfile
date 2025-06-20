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
# Stage 2: Production with Nginx (for production deployments)
# =============================================================================
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy custom entrypoint script
COPY entrypoint.sh /entrypoint.sh

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Ensure nginx directories exist and have proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Set default environment variable
ENV FRONTEND_PORT=3000

# Expose the frontend port
EXPOSE $FRONTEND_PORT

# Health check using curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$FRONTEND_PORT/ || exit 1

# Use custom entrypoint script
CMD ["/entrypoint.sh"]

# =============================================================================
# Stage 3: Simple Server (Frontend + Backend in same container)
# =============================================================================
FROM node:20-alpine AS simple

# Install system dependencies
RUN apk add --no-cache \
    wget \
    curl \
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
COPY --from=builder /app/dist-server ./dist-server

# Copy package.json and source files needed for backend
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules

# Create startup script
RUN echo '#!/bin/sh' > start.sh && \
    echo '' >> start.sh && \
    echo '# Set default ports if not provided' >> start.sh && \
    echo 'FRONTEND_PORT=${FRONTEND_PORT:-3000}' >> start.sh && \
    echo 'API_SERVER_PORT=${API_SERVER_PORT:-3001}' >> start.sh && \
    echo '' >> start.sh && \
    echo 'echo "🚀 Starting myNGO Application"' >> start.sh && \
    echo 'echo "📱 Frontend will be available on port $FRONTEND_PORT"' >> start.sh && \
    echo 'echo "🔌 Backend API will be available on port $API_SERVER_PORT"' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Start both services using concurrently' >> start.sh && \
    echo 'exec concurrently \' >> start.sh && \
    echo '  --names "FRONTEND,BACKEND" \' >> start.sh && \
    echo '  --prefix-colors "blue,green" \' >> start.sh && \
    echo '  "serve -s dist -l $FRONTEND_PORT" \' >> start.sh && \
    echo '  "node dist-server/index.js"' >> start.sh

# Make script executable
RUN chmod +x start.sh

# Change ownership to appuser
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Set environment variables with defaults
ENV FRONTEND_PORT=3000
ENV API_SERVER_PORT=3001

# Expose both ports
EXPOSE $FRONTEND_PORT $API_SERVER_PORT

# Health check for both services
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:$FRONTEND_PORT/ && \
    wget --no-verbose --tries=1 --spider http://localhost:$API_SERVER_PORT/api/health || exit 1

# Start both frontend and backend
CMD ["./start.sh"]

# =============================================================================
# Stage 4: Universal (Auto-detect or manual selection)
# =============================================================================
FROM ${DEPLOYMENT_TYPE} AS final