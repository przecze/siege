.PHONY: lock assets

# Regenerate package-lock.json from package.json using the same Node version as the container
lock:
	docker run --rm -v $(PWD)/package.json:/app/package.json -v $(PWD):/out -w /app node:22-alpine \
		sh -c "npm install --package-lock-only && cp package-lock.json /out/"
assets:
	docker compose run --rm assets
