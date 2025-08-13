# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d258f04a-30ab-4703-a822-9582e17745e8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d258f04a-30ab-4703-a822-9582e17745e8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Quickstart (Local)

1. Copy environment example and fill values:

   ```sh
   cp .env.example .env
   ```

2. Install dependencies and run dev server:

   ```sh
   npm i
   npm run dev
   ```

3. Preview build (used by E2E/CI):

   ```sh
   npm run build
   npm run preview
   ```

## Environment Variables

Create `.env` at repo root for the frontend (Vite). Do not commit secrets.

Required frontend vars (see `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLIC_KEY`

Backend (Supabase Edge Functions) secrets are configured in Supabase, not in this `.env`:

- `STRIPE_API_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_MAP` (JSON map; e.g., {"Starter:monthly":"price_x","Starter:annual":"price_y"})
- `OPENAI_API_KEY`
- (optional) `SUPABASE_SERVICE_ROLE_KEY`

## Testing

- Unit (frontend):

  ```sh
  npm run test
  npm run test:coverage
  ```

- E2E (Playwright + Cucumber) against preview on port 5174:

  ```sh
  npm run build
  npm run e2e:serve &
  E2E_BASE_URL=http://localhost:5174 npm run e2e
  ```

CI runs lint, unit with coverage, build, preview, and E2E. Deno tests for `supabase/functions` also run in CI.
## Supabase Secrets Quickstart

Set these in your Supabase project (Setttings > Config > Secrets):
- STRIPE_API_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_MAP (JSON like {"Starter:monthly":"price_x","Starter:annual":"price_y"})
- OPENAI_API_KEY
- SUPABASE_SERVICE_ROLE_KEY (optional; required for functions writing to DB)

Also set environment variables SUPABASE_URL and SUPABASE_ANON_KEY for functions that authenticate users or perform reads.


## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d258f04a-30ab-4703-a822-9582e17745e8) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
