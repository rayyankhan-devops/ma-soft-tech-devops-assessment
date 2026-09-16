# ====================================================================
# Stage 1: Build & Dependencies
# ====================================================================
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies (excludes devDependencies like vitest, supertest, eslint)
RUN npm ci --omit=dev && npm cache clean --force

# ====================================================================
# Stage 2: Production Runtime
# ====================================================================
FROM node:22-alpine AS runner

# Set metadata labels
LABEL maintainer="MA Soft Tech Solutions DevOps Team"
LABEL description="Production Express REST API Container"

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    PORT=8080

# Create app directory with strict permissions
RUN chown -R node:node /app

# Copy production node_modules from dependencies stage
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src/ ./src/

# Switch to non-root user (Principle of Least Privilege)
USER node

# Expose service port
EXPOSE 8080

# Native Docker Healthcheck Probe
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start server
CMD ["node", "src/server.js"]
