FROM oven/bun:alpine AS base

FROM base AS builder

WORKDIR /app

COPY bun.lock package.json ./
COPY apps/frontend/web/package.json ./apps/frontend/web/

RUN bun install

COPY . .

RUN cd apps/frontend/web && bun run build


FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/frontend/web/.next/standalone/node_modules node_modules
COPY --from=builder /app/apps/frontend/web/.next/standalone/apps/frontend/web .
COPY --from=builder /app/apps/frontend/web/.next/static .next/static
COPY --from=builder /app/apps/frontend/web/public .next/public

EXPOSE 3000

CMD ["bun", "run", "server.js"]
