# Requests to Human

Keep this list updated with any inputs needed to unblock implementation. Check off items when provided.

- [ ] Stripe Price IDs per tier (or confirm single Premium price to start)
- [ ] Production domain to configure success/cancel/return URLs
- [ ] Decision: include `stripe-webhook` for v1 launch? (yes/no)
- [ ] Any constraints for pricing tiers (names, monthly/yearly, trial?)
- [ ] Any copy/branding preferences for Pricing and Billing UI

Notes:
- Supabase local is linked and running; secrets are configured per `docs/implementation-plan.md` message.
- Backend Deno tests will run in CI (Deno not required locally).
