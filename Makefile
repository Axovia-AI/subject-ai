.PHONY: test-deps install-node install-playwright check-deno

# Install local dependencies needed to run tests (unit + e2e + Deno)
# Usage: make test-deps
# - Installs Node modules via npm ci
# - Installs Playwright browsers (may take a while)
# - Checks for Deno (prints install hint if missing)

test-deps: install-node install-playwright check-deno
	@echo "\nTest dependencies setup complete."

install-node:
	@echo "Installing Node dependencies (npm ci)..."
	npm ci

install-playwright:
	@echo "Installing Playwright browsers (with system deps if supported)..."
	npx playwright install --with-deps || npx playwright install

check-deno:
	@echo "Checking Deno availability..."
	@if ! command -v deno >/dev/null 2>&1; then \
		echo "Deno is not installed."; \
		echo "Install on macOS: brew install deno"; \
		echo "Other platforms: https://deno.land/manual/getting_started/installation"; \
	else \
		echo "Deno found:"; deno --version; \
	fi

.PHONY: test-unit test-e2e test-deno

# Run frontend unit tests (Vitest)
# Usage: make test-unit
test-unit:
	@echo "Running frontend unit tests (Vitest)..."
	npm run test

# Run E2E tests (Playwright) against local preview
# Usage: make test-e2e
# Builds the app in E2E mode, serves preview on port 5174, and runs Playwright tests
# Requires: test-deps
# Note: This simple target does not auto-stop the server on failure; use CI for robust orchestration

test-e2e:
	@echo "Building app for E2E and starting preview..."
	VITE_E2E=true npm run build
	npm run e2e:serve & echo $$! > .preview_pid
	@echo "Waiting for preview to be ready..."
	for i in 1 2 3 4 5 6 7 8 9 10; do \
	  if curl -sSf http://localhost:5174 > /dev/null; then echo "Preview up"; break; fi; \
	  sleep 2; \
	done
	@echo "Running Playwright E2E tests..."
	E2E_BASE_URL=http://localhost:5174 npm run e2e || true
	@echo "Stopping preview server..."
	@if [ -f .preview_pid ]; then kill `cat .preview_pid` || true; rm .preview_pid; fi

# Run Deno tests for Supabase functions
# Usage: make test-deno
# Requires Deno installed locally

test-deno:
	@echo "Running Deno tests for Supabase functions..."
	deno test -A supabase/functions || true


