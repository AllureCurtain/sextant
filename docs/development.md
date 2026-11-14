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

| Command                                    | What it does                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `pnpm dev:content`                         | Content site at http://localhost:4321                                                                |
| `pnpm dev:saas`                            | SaaS app at http://localhost:3000                                                                    |
| `pnpm build`                               | Build both apps                                                                                      |
| `pnpm build:content` / `pnpm build:saas`   | Build one app                                                                                        |
| `pnpm typecheck`                           | Typecheck both apps                                                                                  |
| `pnpm lint`                                | ESLint                                                                                               |
| `pnpm format` / `pnpm format:check`        | Prettier write / check                                                                               |
| `pnpm test`                                | Vitest unit tests                                                                                    |
| `pnpm test:e2e`                            | Playwright smoke tests                                                                               |
| `pnpm deploy:content` / `pnpm deploy:saas` | Deploy one app to Workers                                                                            |
| `pnpm deploy:setup`                        | First-deploy CLI: provision D1/R2/KV, patch `wrangler.jsonc`, migrate, deploy (`--dry-run` previews) |

SaaS database (run inside `apps/saas`):

| Command                  | What it does                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `pnpm db:generate`       | Generate a new migration from `src/db/schema`                                        |
| `pnpm db:migrate:local`  | Apply D1 migrations to the local database                                            |
| `pnpm db:migrate:remote` | Apply D1 migrations to the remote database                                           |
| `pnpm generate:commits`  | Regenerate `src/data/commits.json` for `/commits` (also runs on `predev`/`prebuild`) |

Equivalent wrangler form: `wrangler d1 migrations apply DB --local` / `--remote`.

## Environment variables

Content app: `PUBLIC_SITE_URL` (optional) — sets the canonical origin used for
`site`, the sitemap, and JSON-LD. Defaults to `https://example.com` when unset.

SaaS app (see `apps/saas/.dev.vars.example` for names and comments):

| Variable                                     | Used for                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`                         | Better Auth session signing                                                                       |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`  | Google OAuth login                                                                                |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`  | GitHub OAuth login (optional)                                                                     |
| `REQUIRE_EMAIL_VERIFICATION`                 | Set to `"true"` to require email verification before login (optional, default off)                |
| `STRIPE_SECRET_KEY`                          | Stripe API (test mode keys while developing)                                                      |
| `STRIPE_WEBHOOK_SECRET`                      | Stripe webhook signature verification                                                             |
| `STRIPE_PRICE_ID`                            | Recurring price id for the Pro plan — served to the client via `/api/config`                      |
| `STRIPE_CREDIT_PACK_PRICE_ID`                | One-time price id for the credit pack — must be a non-recurring Stripe price                      |
| `PAYMENT_PROVIDER`                           | Payment provider key (optional, "stripe")                                                         |
| `EMAIL_PROVIDER`                             | Transactional email provider (optional, "resend"; also "cloudflare" via the `send_email` binding) |
| `RESEND_API_KEY`                             | Transactional email (provider "resend")                                                           |
| `NEWSLETTER_PROVIDER`                        | Newsletter provider (optional, "local")                                                           |
| `BEEHIIV_API_KEY` / `BEEHIIV_PUBLICATION_ID` | Beehiiv sync (provider "beehiiv")                                                                 |
| `MAILCHEAP_API_URL` / `MAILCHEAP_API_KEY`    | MailCheap sync (provider "mailcheap")                                                             |
| `ANALYTICS_PROVIDER`                         | Server-side analytics provider (optional, "cloudflare")                                           |
| `PUBLIC_SITE_URL`                            | Callbacks and email links                                                                         |
| `CRISP_WEBSITE_ID`                           | Crisp Chat widget (optional)                                                                      |

Never commit real values. Never print a secret in logs.

## Features

The SaaS app ships with:

- **Auth** — Better Auth (email/password + Google/GitHub OAuth), sessions on D1
- **Billing** — Stripe checkout, billing portal, webhook → entitlement (test mode)
- **Usage credits** — integer balances, paywalled action consumes 1 credit
- **API keys** — `sk_live_` + 32 hex, SHA-256 hashed, Bearer auth on `/api/credits/consume`
- **Usage history** — `usage_event` table, last 50 actions in settings
- **File storage** — R2 bucket, upload/download/delete via `/api/files`
- **Newsletter** — subscribe/unsubscribe endpoints, D1 table, `src/server/newsletter/` provider registry (`local` default, `resend`, `beehiiv`, `mailcheap` stubs)
- **KV cache** — `KV` binding, `GET`/`PUT /api/cache/:key` demo, 60s cache on `/api/config`
- **Rate limiting** — Cloudflare `RATE_LIMITER` binding (prod) + in-memory sliding window (dev)
- **Payment abstraction** — `src/server/payments/` provider registry, Stripe implemented
- **Email** — provider switch via `EMAIL_PROVIDER`: Resend (default) or Cloudflare `send_email` binding; welcome, receipt, password-reset templates
- **Admin** — user list with plan/credits/role
- **Legal pages** — privacy, terms, cookies (both apps)
- **AI playground** — Workers AI: summarize, translate, chat, image generation (1 credit per call)
- **Blog** — markdown posts in `src/content/blog/`, rendered at `/blog` and `/blog/[slug]`
- **Docs** — `/docs` with quickstart/env vars/structure/troubleshooting plus subpages for authentication, billing, database, storage, and deployment
- **Changelog** — `/changelog` timeline of releases
- **Showcase** — `/showcase` grid of sample projects (replace with real ones)
- **Free tools** — `/tools` hub plus two client-side utilities (`/tools/og-image`, `/tools/logo-icon`: SVG composed in the browser, rasterized to PNG via canvas; no server) and a `/tools/video-intro` coming-soon page that collects interest via `/api/waitlist`
- **Commits** — `/commits` lists the latest repo commits, baked into the bundle as `src/data/commits.json` by `scripts/generate-commits.mjs` (runs on `predev`/`prebuild`; a Worker cannot shell out to `git`)
- **FAQ sections** — native `<details>` accordions on the homepage and `/pricing`
- **Theme toggle** — light/dark mode, `.dark` class on `<html>`, persisted to `localStorage["sextant-theme"]`
- **i18n** — English-only; typed `t()` + `useLocale()` + `<LocaleProvider>` in `src/lib/i18n.ts` backed by `src/locales/en.ts`, keeping UI copy centralized
- **Crisp Chat** — optional support widget injected when `CRISP_WEBSITE_ID` is set (see `src/components/crisp-chat.tsx`)
- **User profile** — settings tab: update name, change password, delete account
- **Waitlist** — `POST /api/waitlist` public endpoint + homepage signup form
- **Notifications** — `notification` D1 table, `GET /api/notifications` + mark-read endpoints, topbar bell with unread badge and dropdown (`src/components/notification-bell.tsx`); welcome / credits-exhausted / API-key notifications wired in
- **Analytics** — server-side provider registry `src/server/analytics/` (`ANALYTICS_PROVIDER`, default "cloudflare" writes to the `ANALYTICS_ENGINE` Analytics Engine binding; no-ops when unbound); signup/login/credit/key/upload/AI events fired fire-and-forget
- **SEO/OG meta** — OpenGraph + Twitter Card tags in root document head

## Deploy

Each app deploys independently at `<app>.<subdomain>.workers.dev` (or a custom
domain). `apps/content` uses `wrangler.toml`; `apps/saas` uses `wrangler.jsonc`
(it holds the D1 binding). CI deploys on push to main and then verifies each
deployed URL returns 200. Preview deploys run for PRs.

Before the first SaaS deploy:

1. Create the D1 database: `wrangler d1 create sextant-saas` (run inside
   `apps/saas`) and paste the printed `database_id` into `apps/saas/wrangler.jsonc`,
   replacing the all-zeros placeholder. Wrangler does not reliably interpolate
   env vars into `database_id`, so the real id lives in that file — it is not a
   secret.
2. Set `vars.PUBLIC_SITE_URL` in `apps/saas/wrangler.jsonc` to your deployed
   URL, e.g. `https://sextant-saas.<subdomain>.workers.dev`.
3. Apply migrations: `wrangler d1 migrations apply DB --remote`.

For the content site, set `PUBLIC_SITE_URL` in the environment before
`pnpm build:content` / `pnpm deploy:content` so canonical URLs, the sitemap,
and JSON-LD point at your deployed origin.

### CI deploy prerequisites

The `deploy` job in `.github/workflows/ci.yml` runs only on pushes to `main`
and needs four values configured in the repo, plus a real `database_id`. If any
is missing the job fails loudly — the wrangler steps error on a missing/invalid
`CLOUDFLARE_API_TOKEN`, and `verify-url.mjs` exits non-zero on an empty URL —
so a red deploy means something is unset, never a silent skip.

1. **Create the D1 database and paste its id.** Inside `apps/saas`:
   `wrangler d1 create sextant-saas`, then paste the printed `database_id` into
   `apps/saas/wrangler.jsonc` (replacing the all-zeros placeholder). Not a
   secret — it is committed.
2. **Repo secrets** (GitHub → Settings → Secrets and variables → Actions →
   Secrets):
   - `CLOUDFLARE_API_TOKEN` — a **minimal-scope token** for this repo only (see
     below), not the account-global key.
   - `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard sidebar.
3. **Repo variables** (same page → Variables):
   - `CONTENT_SITE_URL` — the content site's deployed URL, e.g.
     `https://sextant-content.<subdomain>.workers.dev`.
   - `SAAS_SITE_URL` — the SaaS app's deployed URL, e.g.
     `https://sextant-saas.<subdomain>.workers.dev`.

**Minimal API-token scope.** Create a fresh token (Cloudflare → My Profile →
API Tokens → Create Token → "Custom token") scoped to this account with only:

- `Account` → `Cloudflare Workers Scripts` → `Edit`
- `Account` → `D1` → `Edit`
- `Account` → `Account Settings` → `Read`

That covers deploys and D1 migrations. If a deploy errors over a missing
permission, add exactly that permission and retry — do not grant a broad token
up front. Use a dedicated token for this repo; never reuse a full-access token.

**Verifying.** There is no "test secret" button — a green deploy _is_ the
verification. Push to `main` (or re-run the failed job) and confirm `checks`
and `deploy` both pass; then record the two `*.workers.dev` URLs in
`docs/BUILD-REPORT.md`.

## Testing

- Vitest for unit tests. While iterating, run the affected app's suite only.
- Playwright smoke tests: pages return 200; sign-up, login, and a paywalled action consuming 1 credit (Stripe test mode).
- Run the full suite before a release, not on every iteration.

## Release

Releases are GitHub releases cut from main. Before a release: full test suite green, both apps deployed and returning 200, `docs/BUILD-REPORT.md` updated if behavior changed.
