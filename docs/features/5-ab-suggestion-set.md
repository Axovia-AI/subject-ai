# 5. A/B suggestion set

## Summary
Allow users to generate and compare a top-N set of subject suggestions side-by-side to pick the best option for their campaign.

## Goals
- Generate N alternatives (default 5) with stable ordering and metadata.
- Simple UI to compare, select winner, and copy.
- Persist selection for later analytics.

## Non-Goals
- Automated email sending or CRM push (separate integrations feature).
- Multi-arm bandit testing across live audiences.

## Requirements
- Functional:
  - Extend existing `optimize-subject` to accept `{ n: number }` or add a dedicated endpoint `ab-suggestions`.
  - Frontend UI presents a consistent, comparable list/grid of suggestions.
  - Persist the chosen winner with metadata (prompt, timestamp, user id) for future insights.
- Non-functional:
  - Deterministic results when given same input and seed.
  - Respect usage limits and subscription gating.

## Acceptance Criteria
- Given a prompt and N, the UI displays N suggestions with consistent order.
- User can mark a winner, which is persisted and visible in history.
- Copy actions work for any suggestion and for the winner.

## Dependencies
- Supabase Edge Functions: `optimize-subject` (extension or new fn)
- Postgres for persistence (winner record, metadata)
- Supabase Auth for user ownership

## Risks & Mitigations
- Cost: N suggestions multiply token use → cap N (default 5, max 10) and show usage impact.
- Bias: ordering may bias selection → allow randomization toggle, record order.
- Latency: parallelize generation or reuse a single batched prompt.

## Milestones
- M1: Batched generation and UI comparison grid
- M2: Winner persistence and history view

## Test Plan
- Unit:
  - Component renders N cards and handles select/copy.
  - Client request includes `n`; response normalized.
- Integration:
  - Endpoint returns an array length N; handles bounds and errors.
  - Winner persistence creates DB record.
- E2E:
  - User generates N suggestions, selects winner, and sees it in history.

## Open Questions
- Default N (5) and max (10)? Should we allow deterministic seed controls here?

