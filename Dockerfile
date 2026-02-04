# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (frontend + backend)
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown -R 1001:1001 /app/data

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose port 8080
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV DB_DIR=/app/data

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the server
CMD ["node", "dist-server/index.js"]
