# 7. Subscription status sync/validation

## Summary
Ensure accurate subscription state via Stripe webhooks and validation endpoint.

## Goals
- Keep subscription status in sync after checkout/updates.
- Validate status before enabling gated features.

## Non-Goals
- Detailed revenue analytics (out of scope).

## Requirements
- Functional:
  - Use existing `stripe-webhook` to receive events and update DB.
  - `check-subscription` function to validate status client-side.
- Non-functional:
  - Idempotent webhook processing; robust error handling.

## Acceptance Criteria
- After Stripe events, DB reflects correct status within seconds.
- Frontend gating reflects the status returned by `check-subscription`.

## Dependencies
- Stripe webhooks configured correctly.
- Postgres tables for customers/subscriptions.

## Risks & Mitigations
- Missed events → rely on scheduled sync or dashboard triggers.
- Duplicate processing → idempotency keys.

## Milestones
- M1: Webhook + validation paths verified.
- M2: Edge cases covered (trial, canceled, past_due).

## Test Plan
- Unit: webhook payload validation.
- Integration: event simulation for subscription lifecycle.
- E2E: gating behavior in UI per status.

## Open Questions
- Which statuses gate features (trial vs active vs grace)?
