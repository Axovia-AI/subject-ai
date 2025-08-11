# 4. Subject line scoring

## Summary
Provide an estimated open-rate score and brief rationale for any subject line, enabling users to compare options and pick the best-performing candidate.

## Goals
- Deterministic scoring for identical inputs.
- Return score (0–100) and short rationale/explanations.
- Fast scoring (<1.5s typical) with cost controls.

## Non-Goals
- Real inbox deliverability guarantees (separate deliverability checks feature).
- Historical cohort analysis (covered by insights feature later).

## Requirements
- Functional:
  - New edge function `score-subject` (Deno) that accepts `{ subject: string, context?: string }` and returns `{ score: number, rationale: string }`.
  - Frontend UI to display score and rationale; can score any generated or user-typed subject.
  - Store optional scoring snapshots for analytics (subject, score, timestamp, user id).
- Non-functional:
  - Configurable model/heuristics; low-latency responses.
  - Proper input validation (zod) and rate limiting.

## Acceptance Criteria
- Given a subject, scoring returns 0–100 and a rationale string.
- Scoring repeated with same input/seed returns same or near-identical result.
- UI displays score and rationale clearly and handles errors gracefully.

## Dependencies
- Supabase Edge Functions: new `score-subject`
- Supabase Auth, Postgres (optional persistence)
- OpenAI API key configured

## Risks & Mitigations
- Score trust: publish rubric; show rationale; combine LLM + heuristics.
- Cost/latency: short prompts, small max tokens, optional caching.
- Abuse: rate-limit endpoint; auth required.

## Milestones
- M1: Implement `score-subject` with rubric + UI display
- M2: Deterministic mode/seed and optional persistence for analytics

## Test Plan
- Unit:
  - zod schema validation; scoring rubric function unit tests.
  - UI component renders score and rationale.
- Integration:
  - `score-subject` returns correct shape; handles bad input.
- E2E:
  - User selects a suggestion and sees score+rationale.
  - Error path shown when quota exceeded.

## Open Questions
- Exact scoring rubric weights (length, clarity, curiosity, spamminess)?

