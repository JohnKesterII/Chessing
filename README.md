# KnightShift

KnightShift is a production-structured chess platform built with Next.js App Router, TypeScript, Tailwind CSS, Supabase, Stripe, chess.js, and a Stockfish worker integration. The product direction is analysis-first: fast play surfaces, deeper review for paid users, and strict server-side ownership and subscription checks.

## Architecture Summary

- Frontend: Next.js App Router with server components for data access and client components for board interaction, auth UX, Stripe redirects, and Stockfish worker orchestration.
- Styling: Tailwind CSS with a small shadcn-style component layer in `components/ui`.
- Auth and data: Supabase Auth plus Postgres tables with RLS. Profile, settings, subscription, game, move, analysis, and review data are persisted in Postgres.
- Billing: Stripe Checkout, Billing Portal, and webhook sync back into `subscriptions`.
- Chess domain: `chess.js` for legal move validation and PGN/FEN state; browser worker-based Stockfish for bot play and analysis.
- Security boundaries: server-only Stripe and service-role access, route-level auth checks, DB-backed rate limiting for auth/OTP, and webhook signature verification.

## Core Feature Coverage

- Landing page, pricing, legal pages
- Email/password auth, email OTP, phone OTP, Google sign-in, Apple sign-in
- Auth callback handling, password reset, logout, global logout
- Auto-created profile, settings, subscription, and stats rows via Supabase trigger
- Self-play board with legal move handling, promotion, clocks, move list, themes, sounds, save to history
- Bot play backed by Stockfish worker policy and side/difficulty controls
- Analysis board with FEN/PGN import, eval bar, candidate lines, engine policy by plan, and move stepping
- Game replay page and review pipeline with stored classifications
- Dashboard, public profile, billing, settings, recent game history
- Stripe subscription sync and server-side plan enforcement

## Project Structure

```text
app/
  (marketing)/               landing page
  (auth)/                    login, signup, verify
  (app)/                     dashboard, play, bot, analysis, billing, settings, game, review, profile
  api/                       auth, games, analysis, reviews, stripe
  auth/callback/             Supabase auth exchange route
components/
  chess/                     board workspace, bot/analysis/review clients
  forms/                     auth, billing, settings forms
  history/                   saved game table
  layout/                    site shell and brand header
  profile/                   public profile summary
  ui/                        buttons, cards, inputs, badges, skeleton
hooks/
  use-stockfish-engine.ts
  use-move-sounds.ts
lib/
  analysis/                  engine types
  auth/                      session guards
  chess/                     openings, replay helpers, online scaffolding, piece renderers
  config/                    env validation
  constants/                 plan, brand, theme constants
  db/                        queries and shared types
  quotas/                    plan policy mapping
  rate-limit/                DB-backed auth throttling
  review/                    move classification
  stripe/                    checkout and sync helpers
  supabase/                  browser/server/admin clients
  validators/                auth, chess, online schemas
supabase/migrations/
  0001_initial_schema.sql
workers/
  stockfish.worker.ts
tests/
  review.test.ts
  utils.test.ts
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Apply the SQL migration in Supabase:

```sql
-- Run supabase/migrations/0001_initial_schema.sql in the Supabase SQL editor
```

3. In Supabase Auth:
- enable email/password
- enable email OTP and phone OTP
- configure Google and Apple providers
- set the site URL and redirect URL to `http://localhost:3000/auth/callback`

4. In Stripe:
- create monthly and yearly recurring prices
- copy the price IDs into `.env.local`
- point the webhook endpoint to `http://localhost:3000/api/stripe/webhook`
- subscribe webhook events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

5. Start the app:

```bash
npm run dev
```

6. Optional verification:

```bash
npm run typecheck
npm run lint
npm run test
```

## Deployment

### Vercel + Supabase + Stripe

1. Push the repository to Git.
2. Create a Vercel project and import the repo.
3. Add the same environment variables from `.env.local` into Vercel.
4. Run the SQL migration in the production Supabase project.
5. Set production Supabase redirect URLs to:
   - `https://your-domain.com/auth/callback`
6. Set the Stripe webhook endpoint to:
   - `https://your-domain.com/api/stripe/webhook`
7. Deploy.

## Security Notes

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` or Stripe secret keys to the client.
- Subscription access is read from the database, not trusted from client state.
- OTP and password reset flows are rate-limited through `security_events`.
- User-owned tables are protected with RLS. Public profile reads are explicitly allowed.
- Stripe webhook verification is mandatory before writing billing state.

## Online Play Scaffold

Full matchmaking and synced clocks are not fully shipped in this pass, but the codebase includes:

- shared online room state types in `lib/chess/online.ts`
- online move and presence validators in `lib/validators/online.ts`
- persisted games and moves suitable for realtime room extension
- UI messaging that keeps online play out of the primary flow until the room layer is finished

The core shipped flows in this repository are account, billing, self-play, bot play, analysis, replay, review, profile, settings, and history.
