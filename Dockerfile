# 🚀 Universal Dockerfile for Vue.js - Works Everywhere!
# Build arguments to control deployment type
ARG DEPLOYMENT_TYPE=production
ARG PORT=3000

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

# Build the application using Docker-friendly build command
RUN pnpm run build:only

# =============================================================================
# Stage 2: Production with Nginx (for production deployments)
# =============================================================================
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to nginx user
USER nginx

# Expose port from nginx.conf
EXPOSE 3100

# Health check using curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3100/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# Stage 3: Simple Server (for Coolify, Vercel, Railway, etc.)
# =============================================================================
FROM node:20-alpine AS simple

# Install wget for health checks and serve for static hosting
RUN apk add --no-cache wget && \
    npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port 3000 (standard for most platforms)
EXPOSE 3000

# Health check using wget
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start serve
CMD ["serve", "-s", "dist", "-l", "3000"]

# =============================================================================
# Stage 4: Universal (Auto-detect or manual selection)
# =============================================================================
FROM ${DEPLOYMENT_TYPE} AS final