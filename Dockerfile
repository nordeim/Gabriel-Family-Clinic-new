# 🏥 Gabriel Family Clinic Healthcare Platform
# Multi-stage Docker build with Node.js 22 Alpine for production deployment

# ========================================
# BUILD STAGE - Dependencies & Compilation
# ========================================
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for healthcare platform
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    openssl

# Copy package files
COPY package*.json ./

# Install dependencies with production focus
RUN npm ci --only=production --frozen-lockfile

# Copy source code
COPY . .

# Environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# ========================================
# PRODUCTION STAGE - Minimal Runtime
# ========================================
FROM node:22-alpine AS production

# Install healthcare platform runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security (HIPAA compliance)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app ./

# Create necessary directories with proper permissions
RUN mkdir -p /app/.next/cache /app/public/uploads
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port (standard healthcare application port)
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the Next.js production server
CMD ["npm", "start"]
