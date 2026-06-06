FROM oven/bun:alpine AS base
WORKDIR /app

FROM base AS prepare
RUN bun add -g turbo
COPY . .
RUN turbo prune web --docker

FROM base AS builder
ARG APP_VERSION=unknown
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}
COPY --from=prepare /app/out/json/ .
RUN bun install
COPY --from=prepare /app/out/full/ .
RUN bunx turbo build

FROM base AS runner
RUN addgroup --system --gid 1001 bunx
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:bunx /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:bunx /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:bunx /app/apps/web/public ./apps/web/public

CMD bun apps/web/server.js
