# Subject AI — Implementation Plan

Generated from PRD at `docs/prd.md` and current repository state.

## 1) Confirmed Technology Stacks
- Frontend: Next.js (TypeScript)
- Backend: Supabase Edge Functions (Deno) in `supabase/functions/`
- Auth: Supabase Auth
- Payments: Stripe (Checkout, Billing Portal, Webhooks)
- Database: Postgres (Supabase; tables: `subscribers`, `usage_stats`)
- AI Provider: OpenAI (LLM for subject optimization)
- CI/CD: GitHub Actions (tests on PRs; deploy on main)
- Hosting: Vercel (frontend), Supabase (backend)
- Testing: Jest/Playwright on frontend; Deno/TypeScript tests for functions; API/e2e via Playwright + Supabase session

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

#1: Foundation, environments, and access [ ] (est: 3 days) [CURRENT-TASK]
  #1.1: Confirm stacks and project structure [ ] (est: 0.5 days)
  #1.2: Verify env vars (OpenAI, Stripe, Supabase keys) and secrets management [ ] (est: 0.5 days)
  #1.3: Document local dev and deployment flows (README updates) [ ] (est: 1 day)
  #1.4: Validate existing DB tables and migrations alignment [ ] (est: 1 day)

#2: Testing and CI/CD pipeline [ ] (est: 3 days)
  #2.1: Set up unit/integration tests for `supabase/functions/*` (deno/ts) [ ] (est: 1 day)
  #2.2: Set up Playwright e2e for auth + paid flows (stub Stripe in test) [ ] (est: 1 day)
  #2.3: GitHub Actions: run tests on PRs; deploy on main [ ] (est: 1 day)

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

Note: Remember to update this plan after each completed task or subtask by:
1. Checking off [ ] to [x].
2. Removing [CURRENT-TASK] from the completed item.
3. Adding [CURRENT-TASK] to the next active task or subtask.
