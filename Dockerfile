# Multi-stage Dockerfile for physio-doctor-platform

# Stage 1: Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.24.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN cd apps/api && pnpm prisma generate

# Build applications
RUN pnpm run build

# Stage 2: API Production
FROM node:22-alpine AS api

RUN npm install -g pnpm@10.24.0

WORKDIR /app

# Copy built API
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./api_node_modules

# Generate Prisma Client in production
RUN cd /app && pnpm install --prod --frozen-lockfile
RUN cd /app && pnpm prisma generate

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]

# Stage 3: Web Production  
FROM node:22-alpine AS web

RUN npm install -g pnpm@10.24.0

WORKDIR /app

# Copy built web app
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/node_modules ./node_modules

EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["pnpm", "start"]

