# 6. Stripe checkout and billing portal

## Summary
Enable self-serve subscription purchase and management using Stripe Checkout and Billing Portal.

## Goals
- Provide CTA to start checkout.
- Provide access to the Billing Portal.
- Handle errors and edge cases gracefully.

## Non-Goals
- Complex pricing experiments (handled separately).

## Requirements
- Functional:
  - Use existing functions: `create-checkout`, `customer-portal`.
  - Frontend buttons to open checkout/session and portal.
  - Price IDs configurable via env.
- Non-functional:
  - Resilient to transient Stripe errors (retry/backoff).
  - Clear UX states.

## Acceptance Criteria
- Users can complete checkout and return with active subscription.
- Users can open Billing Portal and update/cancel.

## Dependencies
- Stripe account/keys.
- Supabase Edge Functions above.

## Risks & Mitigations
- Incomplete webhooks → rely on subscription sync feature to finalize.
- Misconfigured price IDs → validation and logs.

## Milestones
- M1: Checkout and portal buttons wired.
- M2: Error states and validation hardened.

## Test Plan
- Unit: client helpers for Stripe calls.
- Integration: function calls success/failure paths.
- E2E: happy path checkout (stub/record mode).

## Open Questions
- Do we need tax/VAT configuration in MVP?
