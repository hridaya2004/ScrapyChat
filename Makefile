APP_VERSION := $(shell git describe --tags --dirty --always 2>/dev/null)

dev:
	APP_VERSION=$(APP_VERSION) docker compose up --build

build:
	APP_VERSION=$(APP_VERSION) docker compose build

down:
	docker compose down

logs:
	docker compose logs -f
