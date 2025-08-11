# 9. Minimal analytics

## Summary
Track usage counts and allow manual open-rate input as a baseline for insights.

## Goals
- Provide simple dashboard for usage and inputs.
- Support later expansion to historical insights.

## Non-Goals
- Complex attribution or cohort analysis.

## Requirements
- Functional:
  - Store manual open-rate inputs and associate with suggestion/winner when available.
  - Display usage counts and recent activity.
- Non-functional:
  - Respect privacy; avoid PII in logs.

## Acceptance Criteria
- Users can input open-rate data and see it reflected in the dashboard.
- Usage counts reflect generation and scoring actions.

## Dependencies
- Postgres tables (`usage_stats`, analytics records).

## Risks & Mitigations
- Data quality issues → add input validation and labels.

## Milestones
- M1: Input + display usage counts.
- M2: Tie inputs to winners for later insights.

## Test Plan
- Unit: data validators and UI components.
- Integration: read/write analytics records.
- E2E: user enters data; view updates.

## Open Questions
- Which minimal fields to capture for open-rate input?
