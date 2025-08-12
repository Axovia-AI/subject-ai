# Subject AI - Simple PRD

**Company:** Axovia AI  
**Project Owner:** Stephen Boyett  
**Date:** 2025-08-11

## Project Summary
Axovia AI will launch a micro-SaaS that optimizes email subject lines to maximize open rates. The product will generate and refine subject lines using AI and data-driven feedback, enabling users to improve engagement and conversion.

Current implementation aligns with a Supabase-centric architecture:
- Backend: Supabase Edge Functions (Deno) for core operations
- Auth: Supabase Auth
- Payments: Stripe (Checkout, Billing Portal, Webhooks)
- Data: Postgres (e.g., `subscribers`, `usage_stats` tables referenced)

## Users
Our clients

## Requirements

### Must-Have Features (MVP)
- AI-generated subject line suggestions from a brief prompt/context [Implemented via `supabase/functions/optimize-subject`]
- Subject line scoring (estimated open-rate score and rationale) [Planned]
- Simple A/B suggestion set (top N alternatives) [Planned]
- Stripe checkout for self-serve subscription (monthly/annual) [Implemented via `create-checkout` function]
- Customer billing portal for plan management [Implemented via `customer-portal` function]
- Subscription status sync and validation [Implemented via `stripe-webhook` and `check-subscription` functions]
- Basic onboarding, account management, and usage limits [Planned; `usage_stats` upsert present]
- Minimal analytics: usage count and basic open-rate tracking input (manual) [Partially Implemented; `usage_stats` updates exist]
- Privacy and data handling notice [Planned]

### Nice-to-Have Features
- Multi-language subject generation
- CRM/ESP integrations (e.g., Mailchimp, HubSpot) for 1-click insert
- Deliverability checks (spammy-word detection, length warnings)
- Browser extension or Gmail add-on
- Team seats and role-based access
- Historical performance insights and recommendations

### Technical Requirements
- Backend: Supabase Edge Functions (Deno) using `@supabase/supabase-js` [Implemented]
- Auth: Supabase Auth with JWT validation in functions where needed [Implemented client usage]
- Payments: Stripe Checkout + Billing Portal + Webhooks with signature verification [Implemented functions present]
- Database: Postgres tables (e.g., `subscribers`, `usage_stats`) referenced/used [Implemented]
- Full automated testing (unit, integration, e2e) with high coverage [Planned]
- CI pipeline to run tests on every change and deploy to production on main [Planned]
- Observability: logs, metrics, error tracking [Planned]
- Data privacy and PII handling best practices [Planned]
- Scalable architecture for early growth [Planned]

### Constraints
- Must be valuable and profitable: clear, compelling paid plan with margins
- Keep scope minimal for fast time-to-market (MVP first)
- Comply with Stripe requirements and tax/regulatory basics
- Budget-conscious infra and AI usage to maintain profitability

## Next Steps
1. Review and prioritize requirements
2. Estimate effort for MVP features
3. Create implementation plan and test/CI setup
