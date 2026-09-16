# ====================================================================
# Stage 1: Build React Static Application
# ====================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications first to leverage Docker caching
COPY package*.json ./

# Install all dependencies including dev tools needed for Vite build
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ====================================================================
# Stage 2: Production Nginx Server
# ====================================================================
FROM nginx:alpine AS runner

# Set metadata labels
LABEL maintainer="MA Soft Tech Solutions DevOps Team"
LABEL description="Production React Static Application served via Nginx"

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose web port
EXPOSE 80

# Native Docker Healthcheck Probe
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
