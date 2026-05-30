# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# (Optional) If there is a build step for the backend, run it here.
# RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS production

WORKDIR /app

# Set Node to production mode
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code from builder
COPY --from=builder /app/src ./src

# Ensure non-root user runs the application for security
RUN chown -R node:node /app
USER node

# Expose the application port
EXPOSE 5000

# Start the server
CMD ["node", "src/server.js"]
