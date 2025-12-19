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

# cp -r .next/standalone/apps/frontend/web/.next .next/standalone/
COPY --from=builder /app/apps/frontend/web/.next/standalone/apps/frontend/web/.next standalone/.next

# cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
COPY --from=builder /app/apps/frontend/web/public standalone/public
COPY --from=builder /app/apps/frontend/web/.next/static standalone/.next

COPY --from=builder /app/apps/frontend/web/.next/standalone/node_modules standalone/node_modules
COPY --from=builder /app/apps/frontend/web/.next/standalone/apps/frontend/web/server.js standalone/server.js

EXPOSE 3000

CMD ["bun", "run", "standalone/server.js"]
