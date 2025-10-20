# Stage 1: Build frontend
FROM node:22-alpine as build-stage
WORKDIR /app

# Install dependencies
COPY package*.json /app/
RUN npm install

# Copy source code and build
COPY ./ /app/
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine3.20-slim
COPY --from=build-stage /app/dist /usr/share/nginx/html
