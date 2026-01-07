FROM oven/bun:alpine AS base

FROM base AS prepare

WORKDIR /app

RUN bun add -g turbo

COPY . .

RUN turbo prune auth --docker

FROM base AS builder

WORKDIR /app

COPY --from=prepare /app/out/json/ .
RUN bun install

COPY --from=prepare /app/out/full/ .

RUN bunx turbo build

FROM base AS runner
WORKDIR /app

# Add python dependencies required for better-auth
RUN apk --update add python3 build-base

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:expressjs /app .

USER expressjs

CMD ["sh", "-c", "cd apps/auth && bun run setup-db && bun run src/server.ts"]
