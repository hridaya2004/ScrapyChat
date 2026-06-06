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

FROM alpine:3.23 AS runner
ARG APP_VERSION=unknown
ENV APP_VERSION=${APP_VERSION}
RUN apk add --no-cache libstdc++ libgcc
RUN addgroup -g 1001 -S elysiajs \
 && adduser -S -u 1001 -G elysiajs elysiajs
USER elysiajs
COPY --from=builder /app/apps/auth/server /server

CMD ["./server"]
