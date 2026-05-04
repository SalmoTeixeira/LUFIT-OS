# Railway Dockerfile for LUFIT OS
# Multi-stage build: Build → Production

# ===== STAGE 1: Build =====
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy all source files
COPY . .

# Build frontend (Vite) + backend (esbuild)
RUN npm run build

# ===== STAGE 2: Production =====
FROM node:20-slim AS production

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./

# Install ONLY production dependencies (no devDependencies)
RUN npm ci --omit=dev

# Expose port (Railway detects this)
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the server
CMD ["node", "dist/boot.js"]
