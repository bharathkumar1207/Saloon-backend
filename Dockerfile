# ---- Build stage: compile TypeScript ----
FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY db ./db
RUN npm run build

# ---- Production stage: only what's needed to run ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
# migrate.ts (compiled to dist/db/migrate.js) looks for SQL files next to
# itself at runtime, i.e. dist/db/migrations — not db/migrations.
COPY --from=builder /app/db/migrations ./dist/db/migrations

# Default uploads dir if UPLOADS_DIR isn't set at runtime. Either way,
# mount a volume at whatever path you use (e.g. -e UPLOADS_DIR=/data/uploads
# -v saloon-uploads:/data/uploads) so uploads survive container
# restarts/rebuilds instead of being lost with the container.
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "dist/src/index.js"]
