# 1. Foundation, environments, and access

## Summary
Establish baselines for environments, secrets, repo structure, and developer workflows to enable reliable development and deployments.

## Goals
- Confirm stacks and directory structure match repo.
- Document local dev, preview, and production flows.
- Verify environment variables and secrets management.
- Validate DB tables and migrations alignment.

## Non-Goals
- Feature implementation details (covered in feature specs).
- Production observability setup (handled separately).

## Requirements
- Functional:
  - `.env.example` lists required vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPENAI_API_KEY`.
  - README includes setup steps and scripts to run `npm run dev`, `vite preview`, and E2E.
  - Validate existing Supabase schema/migrations consistency.
- Non-functional:
  - Clear, concise docs. No secrets committed.
  - Repeatable setup for new developers (<15 minutes).

## Acceptance Criteria
- A developer can clone, set env vars, run app, and execute tests successfully.
- Migrations are up-to-date and documented.
- `.env.example` is accurate and complete.

## Dependencies
- Current repo structure and CI (`.github/workflows/ci.yml`).
- Supabase project credentials.

## Risks & Mitigations
- Drift between docs and code → add setup checks to CI and keep `.env.example` as source of truth.
- Missing secrets at runtime → fail fast with clear messages.

## Milestones
- M1: `.env.example`, README setup, validated migrations.
- M2: Local dev scripts and sanity checks documented.

## Test Plan
- Unit: config/env loader utilities.
- Integration: local start succeeds when env present; fails clearly when missing.
- E2E: smoke run of preview + health check.

## Open Questions
- Do we want separate dev/stage/prod Supabase projects, or isolated schemas?
