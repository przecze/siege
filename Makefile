.PHONY: lock audit assets deploy

# Regenerate package-lock.json from package.json using the same Node version as the container
lock:
	docker run --rm -v $(PWD)/package.json:/app/package.json -v $(PWD):/out -w /app node:26-alpine \
		sh -c "npm install --package-lock-only --min-release-age=14 && cp package-lock.json /out/"

# Audit, auto-fix vulnerabilities, then regenerate lock
audit:
	docker run --rm -v $(PWD):/app -w /app node:26-alpine \
		sh -c "npm audit --audit-level=moderate || true"
	docker run --rm -v $(PWD):/app -w /app node:26-alpine \
		sh -c "npm audit fix"
	$(MAKE) lock
assets:
	docker compose run --rm assets

deploy:
	cd ansible && ansible-playbook deploy.yml