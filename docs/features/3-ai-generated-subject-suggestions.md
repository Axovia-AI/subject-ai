# 3. AI-generated subject suggestions

## Summary
Enable users to generate high-quality email subject lines from a short prompt/context using AI to improve open rates. This is the core value proposition of Subject AI.

## Goals
- Generate 3–10 compelling subject candidates per prompt.
- Fast responses (<2s typical, budget-aware token usage).
- Deterministic options when given the same input and seed.
- Clear UX for generating, viewing, copying, and retrying suggestions.

## Non-Goals
- End-to-end deliverability guarantees (covered by deliverability checks feature later).
- CRM/ESP push integrations (separate feature).

## Requirements
- Functional:
  - Frontend action to submit prompt/context and display suggestions.
  - Edge function `optimize-subject` (already present) returns an array of suggestions with metadata (e.g., seed, tokens used).
  - Usage counting stored in `usage_stats` (increment on successful generation).
  - Respect subscription gating for generation volume.
- Non-functional:
  - Budget-conscious LLM usage; configurable max tokens/temperature.
  - Meaningful error messages and retry options.

## Acceptance Criteria
- Given a valid prompt, when the user clicks Generate, then 3–10 suggestions appear within 2s on average.
- Suggestions are copyable individually and as a set.
- If unauthenticated or unsubscribed beyond limits, the UI shows a clear paywall or limit error.
- Errors are visible and actionable; retries work.

## Dependencies
- Supabase Edge Functions: `optimize-subject`
- Supabase Auth (session)
- Postgres `usage_stats`
- OpenAI API key configured

## Risks & Mitigations
- Cost overruns: enforce token/temperature caps; log usage; add caching if needed.
- Quality variance: implement prompt templates and seed control; allow quick retry/regenerate.
- Rate limits: implement server-side throttling and client debounce.

## Milestones
- M1: Stable UX path to generate and copy suggestions; count usage
- M2: Deterministic mode and seed support; improved prompts and error handling

## Test Plan
- Unit:
  - React component renders suggestions and handles copy actions.
  - Client service formats request/response correctly.
- Integration:
  - `optimize-subject` returns array with expected shape; handles errors.
  - Usage stats incremented on success.
- E2E:
  - Authenticated user generates suggestions and copies one.
  - Unauthenticated or exceeded limit user sees gating message.

## Open Questions
- Default N suggestions (propose 5)?
- Temperature default (propose 0.7) and max tokens?

