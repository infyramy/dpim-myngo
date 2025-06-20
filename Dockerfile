# 🚀 Production Dockerfile for Frontend-only deployment
# Optimized for Coolify, Vercel, Railway, and other platforms

# =============================================================================
# Stage 1: Builder
# =============================================================================
FROM node:20-alpine AS builder

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies with production optimization
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Build the frontend application
RUN pnpm run build:frontend

# =============================================================================
# Stage 2: Production Runtime
# =============================================================================
FROM node:20-alpine AS production

# Install serve for static file hosting and curl for health checks
RUN apk add --no-cache curl && \
    npm install -g serve

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port 3000 (standard for Coolify)
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000", "--no-clipboard"]