FROM node:22-alpine
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source files
COPY . .

# Expose port
EXPOSE 3000

# Start the application
# Use start:prod in Docker since env vars come from docker-compose
CMD ["npm", "run", "start:prod"]