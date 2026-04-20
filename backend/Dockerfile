# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (only package.json and lockfile first for better caching)
COPY package*.json ./
RUN npm install

# Copy source and build (TSC)
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
# Default port for the app (can be overridden by Render)
ENV PORT=5002

# Only copy necessary files from builder
# We only need the compiled 'dist' folder and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install production dependencies ONLY
RUN npm install --omit=dev

# Expose the port (informative only, Render handles routing)
EXPOSE 5002

# The 'start' script in package.json runs 'node dist/server.js'
CMD ["npm", "start"]
