# Subject AI — Implementation Plan

Last updated: 2025-08-11

Generated from PRD at `docs/prd.md` and current repository state.

## 1) Confirmed Technology Stacks
- Frontend: Vite + React (TypeScript)
- Backend: Supabase Edge Functions (Deno) in `supabase/functions/`
- Auth: Supabase Auth
- Payments: Stripe (Checkout, Billing Portal, Webhooks)
- Database: Postgres (Supabase; tables: `subscribers`, `usage_stats`)
- AI Provider: OpenAI (LLM for subject optimization)
- CI/CD: GitHub Actions (tests on PRs; deploy on main)
- Hosting: Vercel (frontend), Supabase (backend)
- Testing: Vitest/Playwright on frontend; Deno/TypeScript tests for functions; API/e2e via Playwright + Supabase session

## 2) Project Structure
```
<project-root>/
├─ src/
│  ├─ pages/
│  ├─ components/
│  ├─ integrations/
│  │  └─ supabase/
│  ├─ lib/
│  └─ tests/
├─ supabase/
│  └─ functions/
│     ├─ optimize-subject/
│     ├─ create-checkout/
│     ├─ customer-portal/
│     ├─ check-subscription/
│     └─ stripe-webhook/
├─ tests/
│  ├─ e2e/
│  └─ api/
└─ docs/
   ├─ prd.md
   └─ planning/
      └─ implementation-plan.md
```

## 3) Feature-to-Stack Mapping
- AI-generated subject suggestions: frontend + supabase-functions + OpenAI
- Subject line scoring: frontend + supabase-functions + OpenAI
- A/B suggestion set (top N alternatives): frontend + supabase-functions
- Stripe checkout and billing portal: frontend + supabase-functions + Stripe
- Subscription status sync/validation: supabase-functions + Postgres + Stripe
- Onboarding/account/usage limits: frontend + Postgres + supabase-functions
- Minimal analytics (usage count, manual open-rate input): frontend + Postgres + supabase-functions
- Privacy/data handling notice: frontend (docs/UI)

## 4) Tasks and Subtasks
Note: Estimates default to 3 days if unspecified.

#1: Foundation, environments, and access [ ] (est: 3 days)
  #1.1: Confirm stacks and project structure [ ] (est: 0.5 days)
  #1.2: Verify env vars (OpenAI, Stripe, Supabase keys) and secrets management [ ] (est: 0.5 days)
  #1.3: Document local dev and deployment flows (README updates) [ ] (est: 1 day)
  #1.4: Validate existing DB tables and migrations alignment [ ] (est: 1 day)

#2: Testing and CI/CD pipeline [ ] (est: 3 days)
  #2.1: Set up unit/integration tests for `supabase/functions/*` (deno/ts) [ ] (est: 1 day)
       - Status: Frontend unit tests + CI are in place; Deno function tests exist for some functions; expansion pending.
  #2.2: Set up Playwright e2e for auth + paid flows (stub Stripe in test) [in-progress] (est: 1 day) [CURRENT-TASK]
       - Status: Playwright configured; smoke + pricing toggle tests added; Cucumber pricing feature aligned with UI; E2E bypass path added for checkout; next: auth + paid flow.
  #2.3: GitHub Actions: run tests on PRs; deploy on main [ ] (est: 1 day)
       - Status: CI green after updating e2e build with VITE_E2E and artifact action versions; deploy step pending.

#3: Feature – AI-generated subject suggestions (Implemented) [ ] (est: 2 days)
  #3.1: Add unit tests for `optimize-subject` logic and error paths [ ] (est: 1 day)
  #3.2: Add rate limits/usage checks, polish API typing and responses [ ] (est: 1 day)

#4: Feature – Subject line scoring (Planned) [ ] (est: 3 days)
  #4.1: Define scoring rubric and JSON schema [ ] (est: 0.5 days)
  #4.2: Implement scoring function (LLM + heuristics) as new edge function [ ] (est: 1.5 days)
  #4.3: Frontend UI to display score + rationale [ ] (est: 1 day)

#5: Feature – A/B suggestion set (Planned) [ ] (est: 3 days)
  #5.1: Extend generation to produce N alternatives deterministically [ ] (est: 1.5 days)
  #5.2: Frontend UX for comparing selections [ ] (est: 1 day)
  #5.3: Persist user selections for later analysis [ ] (est: 0.5 days)

#6: Stripe checkout and billing portal (Implemented) [ ] (est: 2 days)
  #6.1: Add integration tests for `create-checkout` and `customer-portal` [ ] (est: 1 day)
  #6.2: Hardening: input validation, error handling, retries/backoff [ ] (est: 1 day)

#7: Subscription status sync/validation (Implemented) [ ] (est: 2 days)
  #7.1: Add tests for `check-subscription` and `stripe-webhook` [ ] (est: 1 day)
  #7.2: Map price IDs to tiers via env; ensure DB upserts consistent [ ] (est: 1 day)

#8: Onboarding/account/usage limits (Planned) [ ] (est: 3 days)
  #8.1: Basic onboarding flow and settings page [ ] (est: 1.5 days)
  #8.2: Enforce usage limits per tier via middleware and `usage_stats` [ ] (est: 1.5 days)

#9: Minimal analytics (Partially Implemented) [ ] (est: 2 days)
  #9.1: Ensure `usage_stats` updates across flows; add dashboards [ ] (est: 1 day)
  #9.2: Allow manual open-rate input (baseline tracking) [ ] (est: 1 day)

#10: Privacy and data handling notice (Planned) [ ] (est: 1 day)
  #10.1: Draft and link privacy policy; surface in UI [ ] (est: 1 day)

#11: Observability and error tracking (Planned) [ ] (est: 2 days)
  #11.1: Add Sentry/errors + structured logs to functions [ ] (est: 1 day)
  #11.2: Frontend error boundaries and logging [ ] (est: 1 day)

#12: Performance and cost controls (Planned) [ ] (est: 2 days)
  #12.1: Prompt/response size guardrails; token usage monitoring [ ] (est: 1 day)
  #12.2: Caching or memoization for repeated prompts [ ] (est: 1 day)

#13: Deployment and release checklist [ ] (est: 1 day)
  #13.1: Verify environments (dev/stage/prod) and release notes [ ] (est: 1 day)

## 5) Testing & CI Details

### Architecture Decisions
- Frontend tests: Vitest (jsdom), React Testing Library, `@testing-library/jest-dom`.
- Coverage: text + lcov; artifacts uploaded by CI.
- JUnit test report generated for CI consumption.
- Path alias `@` retained (Vite + Vitest config alignment).
- Supabase Edge Functions: extract pure logic into `logic.ts` per function for unit tests; keep `index.ts` as thin I/O wrapper.
 - Playwright e2e lives in `tests/e2e/` and runs via `playwright test` (not Vitest). Vitest excludes `tests/e2e/**`.
 - E2E mode: build with `VITE_E2E=true` in CI to enable auth-bypass path for mocked checkout calls.

### CI Plan (GitHub Actions)
- Workflow: `.github/workflows/ci.yml`
  - Frontend job (Node 18/20): `npm ci`, `npm run lint` (non-blocking initially), `npm run test:coverage` with JUnit; upload artifacts.
  - Deno job: `deno fmt --check`, `deno lint`, `deno test` (placeholder until tests added); upload report if present.
  - Triggers: push, pull_request, release (published).

### Test Plan
- Initial
  - Unit: `src/lib/utils.test.ts` for `cn()`.
  - Smoke: `src/pages/Index.test.tsx` (mocks `useAuth`; Supabase client mocked in setup).
- Next
  - Components: `Header`, Auth flow basics (no network), selected UI components.
  - Edge Functions (Deno): extract pure logic to `logic.ts`; add `logic_test.ts` for `optimize-subject`, then other functions.

### Notes
- Lint currently reports errors across existing files; CI marks lint step as non-blocking to avoid disruption while tests ramp up.
- Coverage will initially be low; focus is on establishing structure and increasing coverage steadily without blocking delivery.

## 6) Stripe Monetization

### Plan
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

### Status Imported
- [x] Wire Pricing CTAs to `create-checkout`
- [x] Add mapping helpers for STRIPE_PRICE_MAP in edge functions
- [x] Implement `stripe-webhook` (scaffolded)
- [x] Implement yearly pricing toggle in `Pricing.tsx` and pass period to checkout (`<plan>:<monthly|annual>`)

### Requests to Human
- Provide Stripe Price IDs per tier (or confirm single Premium price to start)
- Provide production domain to set in success/cancel/return URLs
- Confirm whether to include the webhook for v1 launch

## 7) Backend Refactors for Testability
- [ ] Refactor `supabase/functions/optimize-subject` → `logic.ts` + Deno tests
- [ ] Mirror pattern for `check-subscription`, `create-checkout`, `customer-portal`
- [ ] Address linter errors incrementally (types, hooks deps)

## 8) Collaboration & Sync
- Another agent (Augment AI Coding agent) collaborates on this repository.
- Sync cadence: every 10 minutes, or at task boundaries.
- Shared log: `docs/agents-sync-log.md`
  - Format: `ISO timestamp | agent | phase/task | status | notes`.
  - Before starting a task: add an entry with status `claimed`.
  - On completion/handoff: add an entry with status `completed`/`handoff`.
  - If conflicts are detected, pause and notify in the log and via PR comment.

## 9) File Inventory (testing/CI effort)
- Added:
  - `vitest.config.ts`
  - `src/setupTests.ts`
  - `src/lib/utils.test.ts`
  - `src/pages/Index.test.tsx`
  - `.github/workflows/ci.yml`
  - `docs/implementation-plan.md` (merged; see note in that file)
  - `playwright.config.ts`
  - `tests/e2e/smoke.spec.ts`
  - `tests/e2e/pricing.spec.ts`
- Updated:
  - `package.json` (test scripts)
  - `src/components/Pricing.tsx` (billingPeriod toggle + E2E bypass)
  - `.github/workflows/ci.yml` (VITE_E2E build for e2e)

## 10) Changelog
- 2025-08-11: Implemented yearly pricing toggle and passed period to checkout; added Playwright e2e tests (smoke, pricing); aligned Cucumber feature; enabled VITE_E2E in CI; excluded Playwright from Vitest.
- 2025-08-09: Initial test/CI setup, plan created, tests passing locally, CI configured.

Note: Remember to update this plan after each completed task or subtask by:
1. Checking off [ ] to [x].
2. Removing [CURRENT-TASK] from the completed item.
3. Adding [CURRENT-TASK] to the next active task or subtask.
