# 12. Performance and cost controls

## Summary
Guardrails to control latency and token costs for AI operations.

## Goals
- Enforce token and temperature caps.
- Add caching/memoization where valuable.

## Non-Goals
- Complex distributed caching.

## Requirements
- Functional:
  - Configurable caps in server functions and client defaults.
  - Optional memoization for repeated prompts.
- Non-functional:
  - Clear budget metrics surfaced in logs/analytics.

## Acceptance Criteria
- Typical generation/scoring completes within defined SLAs.
- Token usage remains within budget targets.

## Dependencies
- AI provider usage metrics; observability hooks.

## Risks & Mitigations
- Over-caching stale results → include input hash; allow bypass.

## Milestones
- M1: Caps configured; baseline metrics.
- M2: Memoization added where helpful.

## Test Plan
- Unit: config readers; cache utilities.
- Integration: repeated prompt hits cache; budget metrics logged.
- E2E: user perceives fast results.

## Open Questions
- What SLA targets (p50/p95) should we commit to?
