# @sextant/saas

The SaaS app. TanStack Start + Hono, React 19, deploys to Cloudflare Workers.

Sign-up, login, password reset (Better Auth on D1), a dashboard with usage
credits, a paywalled action that consumes 1 credit, Stripe test-mode billing
(Checkout + portal + webhook), and an admin console.

## Commands

```bash
pnpm dev                # http://localhost:3000
pnpm build              # vite build
pnpm typecheck          # tsc --noEmit
pnpm deploy             # wrangler deploy
pnpm db:generate        # generate a D1 migration from src/db/schema.ts
pnpm db:migrate:local   # apply migrations to the local D1
pnpm db:migrate:remote  # apply migrations to the remote D1
```

## Setup

```bash
cp .dev.vars.example .dev.vars   # fill in your own values; never commit it
pnpm db:migrate:local            # create the local D1 schema
```

`.dev.vars` needs `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_PRICE_ID`, `RESEND_API_KEY`, `PUBLIC_SITE_URL` — see `.dev.vars.example`
for comments. Before deploying, create the real D1 database
(`wrangler d1 create sextant-saas`) and paste its `database_id` into
`wrangler.jsonc`.

Rules for this app live in `AGENTS.md` in this directory.
