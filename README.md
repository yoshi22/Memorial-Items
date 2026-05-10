# Pet Custom Framed Art MVP

## Overview
This repository is a pre-PMF MVP for a pet custom framed-art service.

Customers:
1. visit the landing page,
2. review examples and FAQ,
3. submit an order with pet photos and preferences,
4. receive a proof,
5. request revisions or approve,
6. get a framed physical product.

This project is **not** a general-purpose AI art product.
It is an **order intake + proof management + print-master management + admin operations** system.

## Core principles
- manual-first
- one product category only
- no future-proof abstractions
- proof and print master must be stored separately
- customer trust > code elegance

## Tech stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Supabase (Auth / Postgres / Storage)
- Resend
- PostHog
- Vercel

## Main directories
- `app/` - customer and admin pages
- `components/` - UI and feature components
- `lib/` - utilities, validation, analytics, auth, email, art helpers
- `docs/` - direction, specs, ops, runbooks
- `.claude/` - project rules and Claude Code skills
- `supabase/` - migrations and seed files

## Required environment variables
Create `.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL=`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- `SUPABASE_SERVICE_ROLE_KEY=`
- `APP_BASE_URL=http://localhost:3000`
- `ADMIN_EMAILS=your-admin@example.com`
- `ADMIN_BASIC_AUTH_USERNAME=`
- `ADMIN_BASIC_AUTH_PASSWORD=`
- `ADMIN_ALLOWED_IPS=`
- `SECURITY_ALERT_EMAILS=`
- `ADMIN_LOCKOUT_THRESHOLD=10`
- `ADMIN_LOCKOUT_MINUTES=30`
- `ADMIN_MAGIC_LINK_MAX_REQUESTS=5`
- `ADMIN_MAGIC_LINK_WINDOW_MINUTES=15`
- `EMAIL_FROM=onboarding@resend.dev`
- `RESEND_API_KEY=`
- `POSTHOG_KEY=`
- `BANK_TRANSFER_BANK_NAME=`（Phase 1〜）
- `BANK_TRANSFER_BRANCH_NAME=`（Phase 1〜・任意）
- `BANK_TRANSFER_ACCOUNT_TYPE=普通`（Phase 1〜・任意）
- `BANK_TRANSFER_ACCOUNT_NUMBER=`（Phase 1〜）
- `BANK_TRANSFER_ACCOUNT_HOLDER=`（Phase 1〜）
- `BANK_TRANSFER_REFERENCE=`（Phase 1〜・任意）
- `PAYPAY_PAYMENT_URL=`（Phase 2〜・任意）
- `PAYPAY_QR_IMAGE_URL=`（Phase 2〜・任意）
- `STRIPE_PAYMENT_LINK_URL=`（Phase 3〜）

## Local setup
1. Install dependencies
2. Set `.env.local`
3. Apply Supabase migration
4. Seed initial data if needed
5. Start development server

## Commands
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Vercel test deploy
For an internet-accessible test deployment:

1. Import the repo into Vercel.
2. Add the same environment variables used locally.
3. Set `APP_BASE_URL` to your Vercel deployment URL such as `https://your-project.vercel.app`.
4. In Supabase Auth settings, add:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URL: `https://your-project.vercel.app/auth/callback`
5. Set admin security envs:
   - `ADMIN_BASIC_AUTH_USERNAME`
   - `ADMIN_BASIC_AUTH_PASSWORD`
   - `SECURITY_ALERT_EMAILS`
   - lockout-related envs if you want to override defaults
6. Confirm the Storage buckets exist:
   - `customer-uploads`
   - `proofs`
   - `print-masters`
   - `examples`

Use `EMAIL_FROM=onboarding@resend.dev` for temporary testing, or switch to your own verified sender later.
Phase 1: add `BANK_TRANSFER_*` env vars to enable bank transfer instructions.
Phase 2/3: add `PAYPAY_PAYMENT_URL` / `PAYPAY_QR_IMAGE_URL` or `STRIPE_PAYMENT_LINK_URL` to enable additional payment options.

For the minimum production-style setup on the current public URL, see:
- `docs/runbooks/minimum_production_setup.md`
- `docs/runbooks/security_ops.md`

## Database migration
Run the SQL in:
- `supabase/migrations/20260417_initial_schema.sql`

Optional seed:
- `supabase/seed.sql`

## Admin login
Admin access is restricted by authenticated Supabase users whose email exists in `ADMIN_EMAILS`.
The app should enforce this check on admin routes.

## Important architectural note
Art production is **manual-first** and performed using external tools.
This repo should manage:
- orders
- uploads
- proofs
- revisions
- print masters
- content
- notifications

This repo should **not** implement a built-in AI generation pipeline.
