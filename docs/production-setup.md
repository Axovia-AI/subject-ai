# Production Setup Guide (Vercel + Supabase)

A step-by-step checklist to take this repo to production with Vercel (frontend) and Supabase (Auth, Postgres, Edge Functions).

If you prefer Google Cloud, we can draft a parallel guide; this one assumes Vercel + Supabase.

## Prerequisites
- Access to this GitHub repo (admin for secrets)
- Supabase project (Project REF handy)
- Vercel account (connected to GitHub)
- Stripe account (products/prices created)
- OpenAI API key (for subject optimization)
- Optional: Domain for your site (Vercel)

## Architecture Overview
- Frontend: Vite + React on Vercel
- Backend: Supabase Edge Functions (Deno)
- Database: Supabase Postgres (RLS in migrations)
- Auth: Supabase Auth
- Payments: Stripe (Checkout + Billing Portal via functions)

---

## 1) Supabase: Project and Secrets

1. Locate your Project Ref
   - In the repo: `supabase/config.toml` → `project_id` (e.g., `ntzcqfphhsuddtbugiqd`)
   - In Supabase Dashboard: Project Settings → General → Reference ID

2. Configure Function Secrets
   - Supabase Dashboard → Project Settings → Secrets (or Functions → Secrets)
   - Add the following keys:
     - `SUPABASE_URL` (Project API URL)
     - `SUPABASE_ANON_KEY` (Public anon key)
     - `SUPABASE_SERVICE_ROLE_KEY` (Service role key; required by functions that write)
     - `OPENAI_API_KEY`
     - `STRIPE_API_KEY` (server-side key)
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_PRICE_MAP` (JSON)
       - Example:
         - `{"Starter:monthly":"price_123","Starter:annual":"price_456","Professional:monthly":"price_789"}`
       - Keys should match plan labels used in pricing and in the app; values are Stripe Price IDs.

3. Database Migrations
   - Migrations in `supabase/migrations/` define:
     - `user_profiles`, `usage_stats`, `user_preferences`, `subscribers` tables
     - RLS policies for safe access
   - Apply via your usual migration process (if using Supabase CLI locally, or ensure your prod DB has these tables/policies).

Note: Edge Functions pull secrets from Supabase; do not store server-side secrets in `.env` or Vercel.

---

## 2) GitHub: CI Secrets for Auto-Deploy

The CI pipeline deploys Supabase Edge Functions on push to `main`.

1. Create Supabase Access Token
   - Supabase Dashboard → Avatar (top-right) → Account Settings → Access Tokens → New Token

2. Add GitHub Repo Secrets
   - GitHub → Repo → Settings → Secrets and variables → Actions → New repository secret
   - Add:
     - `SUPABASE_ACCESS_TOKEN`: the token from step 1
     - `SUPABASE_PROJECT_REF`: your project ref (e.g., `ntzcqfphhsuddtbugiqd`)

3. CI Behavior
   - On push to `main`, CI runs tests and then deploys each function in `supabase/functions/*` using the Supabase CLI.
   - Workflow file: `.github/workflows/ci.yml` (job name: `Deploy Supabase Functions (main)`).

---

## 3) Frontend: Vercel Configuration

Recommended: Vercel GitHub Integration
- Connect Vercel to your GitHub repo
- Project Settings in Vercel:
  - Production Branch: `main`
  - Environment Variables (Production):
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `VITE_STRIPE_PUBLIC_KEY` (publishable key)
- Optional: Assign a custom domain

Alternative (CLI): Deploy from GitHub Actions with Vercel CLI
- Not enabled in CI by default (we recommend the GitHub Integration)
- If desired, create GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Then add a deploy step in CI (we can draft this on request)

---

## 4) Stripe: Products, Prices, and Webhooks

1. Products & Prices
   - Create Stripe Products and recurring Prices for each plan/period you offer
   - Copy the Price IDs and populate `STRIPE_PRICE_MAP` in Supabase Secrets
   - Mapping convention used by functions:
     - Keys like `Starter:monthly`, `Starter:annual`, `Professional:monthly`, etc.

2. Webhook Setup
   - After first deploy of the `stripe-webhook` function, its URL will be:
     - `https://<PROJECT_REF>.functions.supabase.co/stripe-webhook`
     - Example: `https://ntzcqfphhsuddtbugiqd.functions.supabase.co/stripe-webhook`
   - In Stripe Dashboard → Developers → Webhooks → Add endpoint
     - Endpoint URL: the function URL above
     - Events to send (minimum):
       - `checkout.session.completed`
       - `customer.subscription.created`
       - `customer.subscription.updated`
       - `customer.subscription.deleted`
     - Reveal the Webhook Signing Secret and set `STRIPE_WEBHOOK_SECRET` in Supabase Secrets

3. Testing
   - Use the Stripe Dashboard to send test events to the endpoint and verify logs
   - Confirm `subscribers` table updates in Supabase match the subscription status

---

## 5) Supabase Auth: URLs & Allowed Redirects

- Supabase Dashboard → Authentication → URL Configuration
  - Site URL: your Vercel production domain (e.g., `https://yourdomain.com`)
  - Redirect URLs: include production URL(s) used for sign-in callbacks
- If you use OAuth providers, configure them and add their callback URLs in provider settings

---

## 6) Deploy & Verify

1. Trigger a deployment
   - Push to `main` (or merge a PR) to run CI and deploy functions
   - Vercel will auto-deploy the frontend if using the GitHub integration

2. Verify functions
   - Example (check-subscription requires Authorization Bearer token):
     - `curl -i https://<PROJECT_REF>.functions.supabase.co/check-subscription -H "Authorization: Bearer <JWT>"`
   - Example (optimize-subject; requires body and server secrets):
     - `curl -i -X POST https://<PROJECT_REF>.functions.supabase.co/optimize-subject -H 'Content-Type: application/json' -d '{"originalSubject":"Hello","emailContext":"..."}'`

3. Verify data
   - In Supabase, check `subscribers` after a Stripe checkout and `usage_stats` after subject optimization

4. Frontend smoke
   - Visit your Vercel domain and run through auth, pricing, and billing portal flows

---

## 7) Production Checklist (TL;DR)

- [ ] Supabase Secrets set: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MAP
- [ ] GitHub Secrets set: SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF
- [ ] Vercel envs set: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLIC_KEY
- [ ] Stripe products/prices created and mapped into STRIPE_PRICE_MAP
- [ ] Stripe webhook configured to Supabase function URL; secret saved
- [ ] Supabase Auth URL configuration updated with production domain(s)
- [ ] Push to main deploys: functions via CI, frontend via Vercel
- [ ] Verify flows: auth, checkout, billing portal, subject optimization

---

## Notes & Troubleshooting

- Missing GitHub secrets will cause the CI deploy job to fail early with a clear message
- If a function deploy fails, check job logs and ensure Supabase access token has sufficient permissions
- Stripe webhook 400/401 usually indicates a mismatched signature or missing secret
- For cross-origin issues, functions include permissive CORS headers; still ensure your frontend uses the correct Supabase URL and anon key

If you want, I can also add a short Production Setup link in the README.

