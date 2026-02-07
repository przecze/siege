.PHONY: lock build up down logs dev dev-down dev-logs rebuild assets

# Regenerate package-lock.json from package.json using the same Node version as the container
lock:
	docker run --rm -v $(PWD)/package.json:/app/package.json -v $(PWD):/out -w /app node:22-alpine \
		sh -c "npm install --package-lock-only && cp package-lock.json /out/"

# Build the production image
build:
	docker compose build site

# Start the production site (default)
up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f --tail 30

# Start dev services (vite + nginx)
dev:
	docker compose --profile dev up --build -d

dev-down:
	docker compose stop game nginx-dev
	docker compose rm -f game nginx-dev

dev-logs:
	docker compose --profile dev logs -f --tail 30

# Full rebuild with fresh node_modules volume
rebuild:
	docker compose stop game nginx-dev
	docker compose rm -f game nginx-dev
	docker volume rm -f siege_game_node_modules 2>/dev/null || true
	docker compose --profile dev up --build -d

assets:
	docker compose run --rm assets
