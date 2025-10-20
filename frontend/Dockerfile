# Stage 1: Build the frontend
FROM node:22-alpine as build-stage
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files and build
COPY ./ ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine3.20-slim

# Copy built files from previous stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
