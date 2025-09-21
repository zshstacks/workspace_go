# client/Dockerfile
# Development stage
FROM node:24-alpine AS development
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production build stage
FROM node:24-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:24-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]