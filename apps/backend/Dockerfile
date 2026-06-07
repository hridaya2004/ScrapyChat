FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS builder
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

# Omit development dependencies
ENV UV_NO_DEV=1

# Disable Python downloads, because we want to use the system interpreter
# across both images. If using a managed Python version, it needs to be
# copied from the build image into the final image; see `standalone.Dockerfile`
# for an example.
ENV UV_PYTHON_DOWNLOADS=0

RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=apps/backend/uv.lock,target=uv.lock \
    --mount=type=bind,source=apps/backend/pyproject.toml,target=pyproject.toml \
    --mount=type=bind,source=apps/backend/README.md,target=README.md \
    --mount=type=bind,source=.git,target=/app/.git \
    uv sync --locked --no-install-project
COPY apps/backend /app
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=.git,target=/app/.git \
    uv sync --locked

# Then, use a final image without uv
FROM python:3.13-slim-bookworm

ARG APP_VERSION=unknown
ENV APP_VERSION=${APP_VERSION}

# Setup a non-root user
RUN groupadd --system --gid 999 nonroot \
    && useradd --system --gid 999 --uid 999 --create-home nonroot

WORKDIR /app

# Copy the python packages from the builder
COPY --from=builder --chown=nonroot:nonroot /app/.venv /app/.venv

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

# Copy only the application source from the builder
COPY --from=builder --chown=nonroot:nonroot /app/src /app/src

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

USER nonroot

EXPOSE 8080

# Run the FastAPI application by default
CMD ["python", "-m", "src.main"]
