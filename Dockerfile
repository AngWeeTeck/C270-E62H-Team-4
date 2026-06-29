# Multi-stage build for the Forum application
# Stage 1: Build backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Stage 2: Production backend
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend from builder
COPY --from=backend-builder /app/backend /app/backend

# Copy backend source code
COPY backend/models /app/backend/models
COPY backend/routes /app/backend/routes
COPY backend/server.js /app/backend/server.js

# Copy .env.example if exists
COPY backend/.env.example* /app/backend/.env.example

WORKDIR /app/backend

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to nodejs user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to run node process
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]
