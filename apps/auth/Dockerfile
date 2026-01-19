FROM oven/bun:alpine AS base
WORKDIR /app

FROM base AS prepare
RUN bun add -g turbo
COPY . .
RUN turbo prune auth --docker

FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN bun install
COPY --from=prepare /app/out/full/ .
RUN bunx turbo build

FROM base AS runner
RUN addgroup --system --gid 1001 elysiajs
RUN adduser --system --uid 1001 elysiajs
COPY --from=builder --chown=elysiajs:elysiajs /app/apps/auth/server .
USER elysiajs

CMD ["./server"]
