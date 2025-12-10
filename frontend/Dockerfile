# Stage 1: Build the frontend
FROM node:22-alpine as build-stage
WORKDIR /app

# Copy package files and install dependencies (better caching)
COPY package*.json ./
RUN npm ci --only=production=false

# Copy all source files and build
COPY . .

# Build with environment variable for API URL
# Accept VITE_API_BASE_URL as build argument, default to localhost for local development
ARG VITE_API_BASE_URL=http://localhost:3000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine3.20-slim

# Copy built files from previous stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
