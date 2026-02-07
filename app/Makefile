.PHONY: lock build up down logs test

# Regenerate package-lock.json from package.json using the same Node version as the container
lock:
	docker run --rm -v $(PWD)/package.json:/app/package.json -v $(PWD):/out -w /app node:22-alpine \
		sh -c "npm install --package-lock-only && cp package-lock.json /out/"

# Rebuild the container (includes npm ci with updated lockfile)
build:
	docker compose up --build -d

# Full rebuild with fresh node_modules volume
rebuild:
	docker compose down -v
	docker compose up --build -d

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f --tail 30

# Run smoke tests (builds test container, runs against the dev server)
test:
	docker compose --profile test up --build --exit-code-from test test
