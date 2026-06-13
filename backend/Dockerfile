# Use the official Node.js 20 Alpine image for a small footprint
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies (only production ones if you want to be extra lean, but we install all to build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# ==========================================
# Production Runtime Stage
# ==========================================
FROM node:20-alpine

# Set node environment to production
ENV NODE_ENV=production

WORKDIR /app

# Copy the built node_modules and application code from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Expose the port the app runs on
EXPOSE 3000

# Start the application using the production script
CMD ["npm", "start"]
