# Development

## Prerequisites

- Node 22 LTS or newer
- pnpm
- A Cloudflare account (free tier is enough to start)
- Wrangler (installed as a dev dependency; run via pnpm)

## Setup

```bash
pnpm install
cp apps/saas/.dev.vars.example apps/saas/.dev.vars   # fill in your own values; never commit .dev.vars
```

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev:content` | Content site at http://localhost:4321 |
| `pnpm dev:saas` | SaaS app at http://localhost:3000 |
| `pnpm build` | Build both apps |
| `pnpm build:content` / `pnpm build:saas` | Build one app |
| `pnpm typecheck` | Typecheck both apps |
| `pnpm lint` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier write / check |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright smoke tests |
| `pnpm deploy:content` / `pnpm deploy:saas` | Deploy one app to Workers |
| `wrangler d1 migrations apply --local` | Apply D1 migrations locally (run inside the app dir) |
| `wrangler d1 migrations apply --remote` | Apply D1 migrations to the remote database |

## Environment variables

Content app: none required for the sample build.

SaaS app (see `apps/saas/.dev.vars.example` for names and comments):

| Variable | Used for |
| --- | --- |
| `BETTER_AUTH_SECRET` | Better Auth session signing |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth login |
| `STRIPE_SECRET_KEY` | Stripe API (test mode keys while developing) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `STRIPE_PRICE_ID` | The sample plan price |
| `RESEND_API_KEY` | Transactional email |
| `PUBLIC_SITE_URL` | Callbacks and email links |

Never commit real values. Never print a secret in logs.

## Deploy

Each app has its own `wrangler.toml` and its own D1 database. CI deploys on push to main; after each deploy, verify the deployed URL returns 200. Preview deploys run for PRs.

## Testing

- Vitest for unit tests. While iterating, run the affected app's suite only.
- Playwright smoke tests: pages return 200; sign-up, login, and a paywalled action consuming 1 credit (Stripe test mode).
- Run the full suite before a release, not on every iteration.

## Release

Releases are GitHub releases cut from main. Before a release: full test suite green, both apps deployed and returning 200, `docs/BUILD-REPORT.md` updated if behavior changed.
