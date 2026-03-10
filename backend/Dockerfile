# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install exact dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install postgresql-client for pg_dump capability (used by backup service)
RUN apk add --no-cache postgresql-client

# Copy package files and install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
# Prisma client gets generated locally during postinstall, but explicitly generating it ensures consistency
RUN npx prisma generate

# Expose API port
EXPOSE 3001

# Start the application
# We use a custom script or run migrations before starting
CMD npx prisma migrate deploy && node dist/index.js
