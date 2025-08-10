# Repository Testing & CI Implementation Plan

Last updated: 2025-08-09

## Overview
Add professional automated testing and CI to ensure implemented functionality is verifiable on PRs and releases. Frontend uses Vitest + RTL; backend (Supabase Edge Functions, Deno) will adopt unit-testable logic extraction.

## Message from Human
- Don't stop working unless you need to.
- Finish the project to completion together
- I have added the following Edge Function Secrets in the Supabase Project:
- I have Linked and started the supabase locally
- I have logged into the supabase database
- Let me know if you need anything else in @docs/requests-to-human.md

```text
OPENAI_API_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL
STRIPE_API_KEY
    ANTHROPIC_API_KEY


         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
   S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
   S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
       S3 Region: local
```

## Architecture Decisions
- Frontend tests: Vitest (jsdom), React Testing Library, `@testing-library/jest-dom`.
- Coverage: text + lcov; artifacts uploaded by CI.
- JUnit test report generated for CI consumption.
- Path alias `@` retained (Vite + Vitest config alignment).
- Supabase Edge Functions: extract pure logic into `logic.ts` per function for unit tests; keep `index.ts` as thin I/O wrapper.

## CI Plan (GitHub Actions)
- Workflow: `.github/workflows/ci.yml`
  - Frontend job (Node 18/20): `npm ci`, `npm run lint` (non-blocking initially), `npm run test:coverage` with JUnit; upload artifacts.
  - Deno job: `deno fmt --check`, `deno lint`, `deno test` (placeholder until tests added); upload report if present.
  - Triggers: push, pull_request, release (published).

## Test Plan
- Initial
  - Unit: `src/lib/utils.test.ts` for `cn()`.
  - Smoke: `src/pages/Index.test.tsx` (mocks `useAuth` to avoid provider wiring; Supabase client mocked in setup).
- Next
  - Components: `Header`, `Auth` flow basics (no network), selected UI components.
  - Edge Functions (Deno): extract pure logic to `logic.ts`; add `logic_test.ts` for `optimize-subject`, then other functions.

## Tasks & Status
- [x] Scan repository to determine stack and functionality
- [x] Propose testing/CI architecture (frontend + backend)
- [x] Get approval (blanket approval granted)
- [x] Implement initial tests (utils + Index smoke)
- [x] Add CI workflow with coverage + JUnit artifacts
- [x] Validate local test run and artifact creation
- [ ] Expand frontend test coverage (Header, Auth)

## Monetization (Stripe) Plan
- Single Source of Truth for pricing: configure Stripe Price IDs and map tiers in one config consumed by Edge Functions and UI.
- Wire Pricing page CTAs to subscription flow (invoke `create-checkout`).
- Add "Manage Billing" entry point that calls `customer-portal` for subscribed users.
- Verify success/cancel/return URLs for prod domain.
- Optional: Add `stripe-webhook` to keep `subscribers` table authoritative.

### Tasks
- [ ] Price IDs config + tier mapping (SSOT)
- [ ] Wire Pricing CTAs to `create-checkout`
- [ ] Add Customer Portal button for subscribed users
- [ ] Optional: Implement `stripe-webhook` with signature verification
- [ ] Tests: subscription UI flow and context behavior

- [x] Wire Pricing CTAs to `create-checkout`
- [x] Add mapping helpers for STRIPE_PRICE_MAP in edge functions
- [x] Implement `stripe-webhook` (scaffolded)


### Requests to human
- Provide Stripe Price IDs per tier (or confirm single Premium price to start)
- Provide production domain to set in success/cancel/return URLs
- Confirm whether to include the webhook for v1 launch

- [ ] Refactor `supabase/functions/optimize-subject` -> `logic.ts` + Deno tests
- [ ] Mirror pattern for `check-subscription`, `create-checkout`, `customer-portal`
- [ ] Address linter errors incrementally (types, hooks deps)

## File Inventory (added/updated by this effort)
- Added:
  - `vitest.config.ts`
  - `src/setupTests.ts`
  - `src/lib/utils.test.ts`
  - `src/pages/Index.test.tsx`
  - `.github/workflows/ci.yml`
  - `docs/implementation-plan.md` (this document)
- Updated:
  - `package.json` (test scripts)

## Notes
- Lint currently reports errors across existing files; CI marks lint step as non-blocking to avoid disruption while tests ramp up.
- Coverage will initially be low; focus is on establishing structure and increasing coverage steadily without blocking delivery.

## Collaboration & Sync
- Another agent (Augment AI Coding agent) collaborates on this repository.
- Sync cadence: every 10 minutes, or at task boundaries.
- Shared log: `docs/agents-sync-log.md`
  - Format: `ISO timestamp | agent | phase/task | status | notes`.
  - Before starting a task: add an entry with status `claimed`.
  - On completion/handoff: add an entry with status `completed`/`handoff`.
  - If conflicts are detected, pause and notify in the log and via PR comment.

## Changelog
- 2025-08-09: Initial test/CI setup, plan created, tests passing locally, CI configured.
