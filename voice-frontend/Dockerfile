# --- Stage 1: Build Stage ---
# Use Node.js Alpine image to build the React/Vite static assets
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package dependency files to leverage Docker layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application for production (generates the 'dist' directory)
RUN npm run build


# --- Stage 2: Production Stage ---
# Use a lightweight Nginx Alpine image to serve the static files securely
FROM nginx:alpine

# Copy the built static assets from the builder stage to Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for HTTP web traffic
EXPOSE 80

# Start Nginx in the foreground to keep the container running for Kubernetes
CMD ["nginx", "-g", "daemon off;"]
