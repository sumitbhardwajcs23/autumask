# Stage 1: Build TypeScript source
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install curl for container health check
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript output from builder
COPY --from=builder /app/dist ./dist

# Copy migrations and SQL schemas for database operations
COPY src/database/schema.sql ./dist/database/schema.sql

EXPOSE 5000

# Health check against backend health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Default startup runs Express HTTP server; can be overridden to run queue worker
CMD ["npm", "start"]
