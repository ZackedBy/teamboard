FROM node:22-alpine
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source files
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]