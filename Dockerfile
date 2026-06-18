FROM node:22-alpine AS builder

RUN npm install -g pnpm@11

WORKDIR /app

# Copy manifests first for layer caching — install layer only rebuilds when these change
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

# Copy sources needed for the API build
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# tsup bundles @wanderaza/* workspace deps into dist/index.js
RUN pnpm --filter @wanderaza/api build

# pnpm deploy produces a self-contained directory: dist/ + production node_modules
RUN pnpm deploy --filter @wanderaza/api --prod /deploy

# ---- runner ----
FROM node:22-alpine AS runner

WORKDIR /app
COPY --from=builder /deploy .

EXPOSE 3001
CMD ["node", "dist/index.js"]
