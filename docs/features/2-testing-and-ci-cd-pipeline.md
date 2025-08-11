# 2. Testing and CI/CD pipeline

## Summary
Ensure code reliability via automated unit, integration, and E2E tests, executed in CI on every change.

## Goals
- Vitest unit tests for frontend.
- Deno tests for Supabase Edge Functions.
- Playwright + Cucumber E2E.
- GitHub Actions runs tests, builds preview, and executes E2E.

## Non-Goals
- Production deployment automation (can be added later).

## Requirements
- Functional:
  - `npm run test`, `npm run test:coverage` produce reports; CI uploads artifacts.
  - `deno test -A supabase/functions` runs (skips for unimplemented parts when needed).
  - E2E runs against `vite preview` with base URL from `E2E_BASE_URL`.
- Non-functional:
  - Fast feedback (<10 min CI).
  - Flake reduction: retry strategy on E2E where reasonable.

## Acceptance Criteria
- CI green on main and PRs; artifacts show coverage and test reports.
- Local tests run consistently on macOS.

## Dependencies
- `.github/workflows/ci.yml`.
- Existing `features/` and `vitest` config.

## Risks & Mitigations
- E2E flakiness → stabilize with waits, retries, and idempotent steps.
- Deno permissions → use `-A` and minimal FS/network access.

## Milestones
- M1: Unit tests scaffold and CI running.
- M2: E2E happy paths for auth, optimize, checkout.

## Test Plan
- Unit: components, hooks, services.
- Integration: API calls (msw optional), Deno functions.
- E2E: auth, generate suggestions, checkout, gating.

## Open Questions
- Add sonar/codecov or keep local coverage artifacts only?
