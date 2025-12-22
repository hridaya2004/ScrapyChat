FROM oven/bun:alpine AS base

FROM base AS builder

WORKDIR /app

COPY bun.lock package.json ./
COPY apps/frontend/web/package.json ./apps/frontend/web/

COPY . .

RUN bun install

RUN cd apps/frontend/web && bun run build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/frontend/web/public ./apps/frontend/web/public
COPY --from=builder /app/apps/frontend/web/.next/standalone/ ./
COPY --from=builder /app/apps/frontend/web/.next/static/ ./apps/frontend/web/.next/static

CMD ["bun", "run", "apps/frontend/web/server.js"]
