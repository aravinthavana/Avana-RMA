# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# IMPORTANT: Set API URL to route to the same origin (Nginx will proxy it)
ENV VITE_API_BASE_URL=/api

# Build the React application
RUN npm run build

# Serve stage
FROM nginx:stable

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
