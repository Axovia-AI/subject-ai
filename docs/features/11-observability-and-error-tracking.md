# 11. Observability and error tracking

## Summary
Add structured logs, error tracking, and minimal metrics for faster debugging and reliability.

## Goals
- Client error boundaries and server error wrapping.
- Centralize logging utilities.

## Non-Goals
- Full tracing stack (future work).

## Requirements
- Functional:
  - Frontend error boundary and logger.
  - Backend `_shared/observability.ts` with redaction and context helpers.
- Non-functional:
  - Provider-agnostic; pluggable Sentry or OTEL exporter later.

## Acceptance Criteria
- Errors are captured and viewable in provider dashboard (when configured).
- PII redaction enforced in logs.

## Dependencies
- Provider configuration (later).

## Risks & Mitigations
- Noise → sampling and levels; redact sensitive data.

## Milestones
- M1: Utilities and boundaries.
- M2: Provider wiring.

## Test Plan
- Unit: logger redaction, error boundary behavior.
- Integration: server wrapper captures context.
- E2E: simulate a handled error; confirm user-friendly UI.

## Open Questions
- Preferred provider (Sentry vs OTEL exporter)?
