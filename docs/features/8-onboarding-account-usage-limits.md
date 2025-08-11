# 8. Onboarding/account/usage limits

## Summary
Provide basic onboarding UI, account settings, and enforce usage limits per subscription tier.

## Goals
- Make it easy to start generating subjects.
- Allow viewing account info and limits.
- Enforce limits with helpful messaging.

## Non-Goals
- Complex RBAC/team seats (later).

## Requirements
- Functional:
  - Onboarding tips/checklist on first visit.
  - Account page with plan and usage stats.
  - Enforce limits via client guard + optional server checks using `usage_stats`.
- Non-functional:
  - Clear UX and accessible components.

## Acceptance Criteria
- New users can complete onboarding and generate first suggestions.
- Exceeding limits shows actionable guidance to upgrade.

## Dependencies
- Supabase Auth, `usage_stats` table.
- Subscription validation feature.

## Risks & Mitigations
- Confusing limits → show remaining usage clearly; provide upgrade path.
- Race conditions on usage updates → server-side upsert with transaction semantics.

## Milestones
- M1: Onboarding and account page.
- M2: Hard limits + UX polish.

## Test Plan
- Unit: components and guards.
- Integration: usage updates and reads.
- E2E: onboarding journey; limit exceeded flow.

## Open Questions
- Exact quota levels per tier?
