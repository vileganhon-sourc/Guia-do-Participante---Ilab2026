# ── Builder stage ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifests first for layer caching
COPY package.json ./

# Install all deps with npm (no lockfile issues)
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled server and frontend build
COPY --from=builder /app/dist ./dist

# Create data directory for persistence
RUN mkdir -p /app/data && chown -R node:node /app

EXPOSE 5000
VOLUME ["/app/data"]
USER node

CMD ["node", "dist/index.js"]
