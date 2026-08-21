FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package configurations
COPY package.json pnpm-lock.yaml tsconfig.json vite.config.ts bunfig.toml ./

# Install dependencies offline/cached
RUN pnpm install --frozen-lockfile

# Copy application source
COPY src ./src
COPY public ./public

# Build application
RUN pnpm run build

EXPOSE 8080

ENV PORT=8080
ENV HOST=0.0.0.0

# Start development server as a foundation container
CMD ["pnpm", "run", "dev"]
