FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/core/package*.json ./packages/core/
COPY packages/sgp4/package*.json ./packages/sgp4/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/api/src ./apps/api/src
COPY packages/core/src ./packages/core/src
COPY packages/sgp4/src ./packages/sgp4/src
COPY apps/api/tsconfig.json ./apps/api/
COPY packages/core/tsconfig.json ./packages/core/
COPY packages/sgp4/tsconfig.json ./packages/sgp4/

# Build packages
WORKDIR /app/packages/core
RUN npm run build

WORKDIR /app/packages/sgp4
RUN npm run build

# Build API
WORKDIR /app/apps/api
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
