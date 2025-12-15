# 1. Use Node.js Alpine image (lightweight)
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files first (to cache dependencies)
# Using package*.json matches both package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the code
COPY . .

# 6. Expose the port Vite runs on
EXPOSE 5173

# 7. Start the server
# --host is required for Docker to map the port correctly
CMD ["npm", "run", "dev", "--", "--host"]