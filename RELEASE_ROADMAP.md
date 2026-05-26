# Subject AI - Release Roadmap

> **Goal:** Launch Subject AI to production with all payment flows, auth, and AI optimization working.

**Quick Links:**
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Supabase Dashboard](https://supabase.com/dashboard/project/ntzcqfphhsuddtbugiqd)
- [GitHub Repo Settings](https://github.com/Axovia-AI/subject-ai/settings)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

## Phase 1: Stripe Setup (Human Required)

### 1.1 Create Stripe Products & Prices

Go to [Stripe Products](https://dashboard.stripe.com/products) → Click **+ Add product**

Create these 3 products with **monthly** and **annual** prices:

| Product | Monthly Price | Annual Price (20% off) |
|---------|--------------|------------------------|
| **Starter** | $19/month | $182.40/year ($15.20/mo) |
| **Professional** | $49/month | $470.40/year ($39.20/mo) |
| **Enterprise** | $149/month | $1,430.40/year ($119.20/mo) |

For each product:
1. Click **+ Add product**
2. Name: `Subject AI Starter` (or Professional/Enterprise)
3. Click **Add pricing** → Recurring → Set amount and interval
4. **Save** and note the Price ID (starts with `price_`)

**Copy all 6 Price IDs here:**
```
Starter:monthly     → price_________________
Starter:annual      → price_________________
Professional:monthly → price_________________
Professional:annual  → price_________________
Enterprise:monthly   → price_________________
Enterprise:annual    → price_________________
```

---

### 1.2 Create Stripe Webhook

Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks) → Click **+ Add endpoint**

| Field | Value |
|-------|-------|
| **Endpoint URL** | `https://ntzcqfphhsuddtbugiqd.supabase.co/functions/v1/stripe-webhook` |
| **Events** | Select these 4 events: |
| | `checkout.session.completed` |
| | `customer.subscription.created` |
| | `customer.subscription.updated` |
| | `customer.subscription.deleted` |

After creating:
1. Click **Reveal** on the Signing secret
2. Copy it (starts with `whsec_`)

**Webhook Signing Secret:** `whsec_________________________________`

---

### 1.3 Get Stripe API Keys

Go to [Stripe API Keys](https://dashboard.stripe.com/apikeys)

| Key | Use For |
|-----|---------|
| **Publishable key** (`pk_live_...`) | Frontend (Vercel env) |
| **Secret key** (`sk_live_...`) | Backend (Supabase secret) |

**Copy your keys:**
```
Publishable: pk_live_________________________
Secret:      sk_live_________________________
```

---

## Phase 2: Supabase Configuration (Human Required)

### 2.1 Add Supabase Secrets

Go to [Supabase Project Secrets](https://supabase.com/dashboard/project/ntzcqfphhsuddtbugiqd/settings/vault/secrets)

Add these secrets (click **+ Add secret** for each):

| Secret Name | Value | Status |
|-------------|-------|--------|
| `STRIPE_API_KEY` | Your Stripe Secret Key (`sk_live_...`) | ⬜ |
| `STRIPE_WEBHOOK_SECRET` | Your Webhook Signing Secret (`whsec_...`) | ⬜ |
| `STRIPE_PRICE_MAP` | See JSON below | ⬜ |
| `OPENAI_API_KEY` | Your OpenAI API key | ⬜ |
| `SUPABASE_URL` | `https://ntzcqfphhsuddtbugiqd.supabase.co` | ⬜ |
| `SUPABASE_ANON_KEY` | [Get from API Settings](https://supabase.com/dashboard/project/ntzcqfphhsuddtbugiqd/settings/api) | ⬜ |
| `SUPABASE_SERVICE_ROLE_KEY` | [Get from API Settings](https://supabase.com/dashboard/project/ntzcqfphhsuddtbugiqd/settings/api) | ⬜ |

**STRIPE_PRICE_MAP format** (paste your Price IDs):
```json
{
  "Starter:monthly": "price_YOUR_STARTER_MONTHLY",
  "Starter:annual": "price_YOUR_STARTER_ANNUAL",
  "Professional:monthly": "price_YOUR_PRO_MONTHLY",
  "Professional:annual": "price_YOUR_PRO_ANNUAL",
  "Enterprise:monthly": "price_YOUR_ENT_MONTHLY",
  "Enterprise:annual": "price_YOUR_ENT_ANNUAL"
}
```

---

### 2.2 Configure Auth URLs

Go to [Supabase Auth URL Config](https://supabase.com/dashboard/project/ntzcqfphhsuddtbugiqd/auth/url-configuration)

| Setting | Value |
|---------|-------|
| **Site URL** | `https://YOUR_PRODUCTION_DOMAIN.com` |
| **Redirect URLs** | Add: `https://YOUR_PRODUCTION_DOMAIN.com/**` |

---

### 2.3 Run Database Migrations (if not already done)

Migrations are in `supabase/migrations/`. If using Supabase CLI locally:
```bash
supabase db push
```

Or verify tables exist in [Table Editor](https://supabase.com/dashboard/project/ntzcqfphhsuddtbugiqd/editor):
- [x] `user_profiles`
- [x] `usage_stats`
- [x] `user_preferences`
- [x] `subscribers`

---

## Phase 3: GitHub Secrets (Human Required)

### 3.1 Create Supabase Access Token

Go to [Supabase Account Access Tokens](https://supabase.com/dashboard/account/tokens)

1. Click **Generate new token**
2. Name: `subject-ai-ci`
3. Copy the token

---

### 3.2 Add GitHub Repository Secrets

Go to [GitHub Repo Secrets](https://github.com/Axovia-AI/subject-ai/settings/secrets/actions)

Click **New repository secret** for each:

| Secret Name | Value | Status |
|-------------|-------|--------|
| `SUPABASE_ACCESS_TOKEN` | Token from step 3.1 | ⬜ |
| `SUPABASE_PROJECT_REF` | `ntzcqfphhsuddtbugiqd` | ⬜ |

---

## Phase 4: Vercel Setup (Human Required)

### 4.1 Connect Repository

Go to [Vercel New Project](https://vercel.com/new)

1. Import `Axovia-AI/subject-ai` from GitHub
2. Framework Preset: **Vite**
3. Root Directory: `.` (default)

---

### 4.2 Add Environment Variables

In [Vercel Project Settings → Environment Variables](https://vercel.com/dashboard):

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://ntzcqfphhsuddtbugiqd.supabase.co` | Production |
| `VITE_SUPABASE_ANON_KEY` | Your anon key from Supabase | Production |
| `VITE_STRIPE_PUBLIC_KEY` | Your Stripe Publishable key (`pk_live_...`) | Production |

---

### 4.3 (Optional) Add Custom Domain

In Vercel Project Settings → Domains:
1. Add your custom domain
2. Follow DNS configuration instructions
3. Update Supabase Auth URLs (Phase 2.2) with the domain

---

## Phase 5: Deploy & Verify

### 5.1 Deploy Backend (Edge Functions)

Push to main branch to trigger CI deploy:
```bash
git checkout main
git pull origin main
git push origin main
```

Or manually deploy:
```bash
supabase functions deploy --project-ref ntzcqfphhsuddtbugiqd
```

---

### 5.2 Deploy Frontend

Vercel auto-deploys on push to main (if GitHub integration connected).

---

### 5.3 Verification Checklist

| Test | How to Verify | Status |
|------|---------------|--------|
| **Landing page loads** | Visit your domain | ⬜ |
| **Sign up works** | Create new account | ⬜ |
| **Sign in works** | Log in with account | ⬜ |
| **Pricing page shows** | Navigate to pricing section | ⬜ |
| **Annual toggle works** | Click Annual, prices update | ⬜ |
| **Checkout redirects to Stripe** | Click "Get Started" on a plan | ⬜ |
| **Payment completes** | Use Stripe test card `4242424242424242` | ⬜ |
| **Subscription saved** | Check `subscribers` table in Supabase | ⬜ |
| **Billing portal works** | Dashboard → Manage Subscription | ⬜ |
| **AI optimization works** | Dashboard → Optimize a subject line | ⬜ |

---

## Summary: What's Already Done ✅

| Component | Status |
|-----------|--------|
| Frontend code (React + Vite) | ✅ Complete |
| Backend Edge Functions (5 functions) | ✅ Complete |
| Database schema + RLS policies | ✅ Complete |
| CI/CD Pipeline (GitHub Actions) | ✅ Complete |
| Stripe integration code | ✅ Complete |
| Auth integration code | ✅ Complete |
| OpenAI integration code | ✅ Complete |
| Unit tests (Vitest) | ✅ Complete |
| E2E tests (Playwright) | ✅ Complete |
| Documentation | ✅ Complete |

---

## Summary: What You Need to Do 📋

| Task | Time Estimate | Link |
|------|---------------|------|
| Create Stripe products/prices | 10 min | [Stripe Products](https://dashboard.stripe.com/products) |
| Create Stripe webhook | 5 min | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |
| Add Supabase secrets | 10 min | [Supabase Secrets](https://supabase.com/dashboard/project/ntzcqfphhsuddtbugiqd/settings/vault/secrets) |
| Configure Auth URLs | 2 min | [Auth Config](https://supabase.com/dashboard/project/ntzcqfphhsuddtbugiqd/auth/url-configuration) |
| Add GitHub secrets | 5 min | [GitHub Secrets](https://github.com/Axovia-AI/subject-ai/settings/secrets/actions) |
| Connect Vercel | 5 min | [Vercel Import](https://vercel.com/new) |
| Add Vercel env vars | 5 min | Vercel Project Settings |
| Verify everything works | 15 min | Your production URL |

**Total estimated time: ~1 hour**

---

## Quick Reference: All Your IDs

| Item | Value |
|------|-------|
| **Supabase Project Ref** | `ntzcqfphhsuddtbugiqd` |
| **Supabase URL** | `https://ntzcqfphhsuddtbugiqd.supabase.co` |
| **Edge Functions Base URL** | `https://ntzcqfphhsuddtbugiqd.supabase.co/functions/v1/` |
| **Stripe Webhook URL** | `https://ntzcqfphhsuddtbugiqd.supabase.co/functions/v1/stripe-webhook` |
| **GitHub Repo** | `Axovia-AI/subject-ai` |

---

## Need Help?

- **Stripe Docs:** https://stripe.com/docs/billing/subscriptions/checkout
- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Vercel Docs:** https://vercel.com/docs/frameworks/vite

---

*Last updated: 2026-05-26*
