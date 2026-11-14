# Decisions

Append-only log. Newest at the bottom. Read this before changing a technology choice.

## 2026-11-14 — Initial stack

- Language: TypeScript. The whole outbound-site ecosystem (TanStack, Astro, Hono, Better Auth, Drizzle, Stripe SDK) is TypeScript-first, and coding agents write TypeScript web code fastest. Rust stays with oxsum and Rove.
- Content site: Astro + `@astrojs/cloudflare`. Content-driven, static-first, fits the GEO playbook (hundreds of pages from a keyword table).
- SaaS app: TanStack Start + Hono, React 19. Type-safe routing, server functions, Cloudflare Workers native.
- Runtime: Cloudflare Workers (Wrangler). D1 + Drizzle for data, R2 for files.
- Auth: Better Auth (email + password, Google OAuth, sessions on D1).
- Payments: Stripe, test mode by default. Money and credits are integers in minor units.
- Email: Resend (free tier) + react-email templates; Cloudflare Email as fallback.
- Analytics: Cloudflare Web Analytics (no cookies).
- Styling: Tailwind CSS v4. Components: shadcn/ui (SaaS app). Icons: lucide-react. Forms: React Hook Form + Zod. Server state: TanStack Query.
- Validation: Zod everywhere; API contract (schemas + routes table) before handlers.
- Background jobs: Cloudflare Queues. Scheduled work: Cloudflare Cron Triggers. No extra job vendor in v1.
- Content search: Pagefind (build-time, no backend).
- Testing: Vitest (unit) + Playwright smoke.
- Lint/format: ESLint (flat config) + Prettier.
- Package manager: pnpm workspaces. Runtime: Node 22 LTS or newer.
- Language of the repo: all English (docs, comments, commits, branches, UI). No Chinese in the repo.
- i18n: English only in v1. No i18n framework bundled; add when a site needs a second language.
- No paid template code (TanStarter, TanLaunch, ShipKit).

## 2026-11-14 — No third-party starter or reference template

- Sextant is written by us, from the official minimal starters (Astro, TanStack Start) and the libraries' own documentation. No forked boilerplate, no reference template.
- Reason: full ownership, no dependency on a small unknown boilerplate, and the build itself is how the stack is learned.
- Cost: more work for the implementing agent (auth, billing, and dashboard wiring are written from scratch instead of adapted), and a higher chance of small mistakes in that wiring. Mitigation: follow the official docs of Better Auth, Drizzle, and Stripe, and the review checks the acceptance list in PLAN.md section 7.
- Libraries stay dependencies: Better Auth, Drizzle, Stripe SDK, and the rest are installed as packages and used as documented, not re-implemented.

## 2026-11-14 — Scaffold implementation choices

- **Custom server entry for the SaaS app.** The default TanStack Start Cloudflare entry (`main = "@tanstack/react-start/server-entry"`) only renders routes. To serve the Hono API (Better Auth + Stripe webhook) alongside SSR on one Worker, `src/server-entry.ts` dispatches `/api/*` to the Hono app and everything else to `createStartHandler(defaultStreamHandler)`. `wrangler.jsonc` `main` points at it.
- **Wrangler config format per app.** `apps/content` uses `wrangler.toml`; `apps/saas` uses `wrangler.jsonc` (what the official TanStack Start + Cloudflare starter emits and what holds the D1 binding). The plan said "each app has its own wrangler.toml" — the file format differs per app but each app has its own single wrangler config; recorded as a deviation.
- **Env/bindings access.** Cloudflare bindings and secrets are read via `import { env } from "cloudflare:workers"` (the `@cloudflare/vite-plugin` runtime), typed once in `src/server/env.ts`. Hono routes use the same env rather than `c.env` so server functions and the API share one source.
- **Better Auth on D1.** Sessions/accounts use the Drizzle adapter (`provider: "sqlite"`) over the `DB` binding; the schema in `src/db/schema.ts` matches `better-auth`'s generated core tables plus the `admin` plugin columns. `trustedOrigins` includes localhost so email/OAuth flows work in dev.
- **100 pages from 10 keywords.** Each keyword row yields an overview page, a Q&A index, and one page per FAQ entry (8 each) — 10 pages per keyword = 100 keyword pages, plus the site index pages (103 HTML pages total). The keyword table stays the single source of truth.
- **pnpm `onlyBuiltDependencies`.** pnpm blocks postinstall build scripts by default in this environment; `esbuild`, `workerd`, `sharp`, and `lightningcss` are allow-listed in `pnpm-workspace.yaml` so installs don't error and the native binaries are provisioned.

## 2026-11-14 — Payment provider abstraction, rate limiting, transactional email

- **Payment provider abstraction.** Billing operations go through a `PaymentProvider` interface (`src/server/payments/`) with `createCheckout`, `createPortal`, and `handleWebhook` returning a normalized event. `PAYMENT_PROVIDER` (default `"stripe"`) selects the implementation; Stripe is the only one so far — Creem/Waffo are noted as TODOs. The webhook URL keeps `/api/webhooks/stripe` because that is where the Stripe dashboard points.
- **Rate limiting.** A small helper (`src/server/rate-limit.ts`) wraps the Cloudflare `RATE_LIMITER` binding (`ratelimits` in wrangler.jsonc) with an in-memory sliding-window fallback, so local dev works without the binding. Policies are per-IP: `/api/credits/consume` 10/min, `/api/keys` 20/min, `/api/auth/*` 30/min.
- **Transactional email.** Sends go through `@sextant/email` (Resend) via `src/server/emails.ts`, always fire-and-forget with `waitUntil` from `cloudflare:workers` — welcome on sign-up (Better Auth `databaseHooks.user.create.after`), password reset (`sendResetPassword`), and receipt on `checkout.session.completed`.

## 2026-11-14 — API keys, R2 file storage, newsletter, legal pages, design system

- **API keys.** `api_key` table stores SHA-256 hashes (never raw keys); `sk_live_` + 32 hex chars; `verifyApiKey` checks Bearer header, updates `lastUsedAt`. Only `/api/credits/consume` accepts Bearer auth — other endpoints stay session-only. Settings page (`/settings`) manages keys and shows usage history (`usage_event` table, last 50 actions).
- **R2 file storage.** `BUCKET` binding in `wrangler.jsonc`; `user_file` table tracks metadata (name, key, contentType, sizeBytes). Upload/download/delete via `/api/files`; 10 MB cap per file.
- **Newsletter.** `newsletter_subscriber` table (email unique, confirmedAt, unsubscribedAt); subscribe/unsubscribe endpoints are public (no auth) but idempotent. Content site has a `Newsletter.astro` component that posts to the SaaS API.
- **Legal pages.** Static pages in both apps: `/privacy`, `/terms`, `/cookies` — content site uses Astro pages, SaaS uses TanStack routes. Footer links added.
- **Design system.** Two registers under one token system: content site is brand register (warm paper `#f4f1e9`, ink `#1a1714`, terracotta `#a8331f`, Newsreader serif display type, grain texture); SaaS app is product register (teal `#176c6b` + clay `#c4633f`, cool paper `#e9eeed`, dark rail `#10211f` for dashboard/admin, KPI tiles, tabular-nums). Shared token names (`--color-*`) map differently per register.

## 2026-11-14 — AI playground, marketing pages, theme, waitlist, profile

- **AI playground.** Workers AI binding (`ai` in wrangler.jsonc). Four endpoints under `/api/ai/*` (summarize, translate, chat, image) — each consumes 1 credit, logs a `usage_event` row, refunds the credit on failure. `/playground` page has four tabs. Models used: `@cf/meta/llama-3.2-3b-instruct` (summarize/chat), `@cf/meta/m2m100-1.2b` (translate), `@cf/black-forest-labs/flux-1-schnell` (image). `bart-large-cnn` and `llama-3.1-8b-instruct` were requested in the spec but don't exist in the current Workers AI catalog — substituted with what works.
- **Blog + docs + changelog + showcase.** All on the SaaS app as public routes (not the content site — that one is for keyword/GEO pages). Blog posts are markdown files in `src/content/blog/` loaded via `import.meta.glob` with `?raw` at build time, parsed with `marked`. `gray-matter` was avoided — it pulls `Buffer` into the client bundle and breaks hydration; a 10-line frontmatter parser replaces it.
- **Theme toggle.** `.dark` class on `<html>` toggled by a sun/moon button in `SiteHeader` and `AppShell`. Persisted to `localStorage["sextant-theme"]`. Bootstrap script in `__root.tsx` before hydration to avoid flash; falls back to `prefers-color-scheme` on first visit.
- **Settings tabs.** Profile / API Keys / Files / Usage — four tabs in one page instead of three sections stacked vertically. Profile tab supports `authClient.updateUser`, `authClient.changePassword`, `authClient.deleteUser` (two-step danger zone).
- **Waitlist.** `waitlist_entry` table (email unique, source nullable); `POST /api/waitlist` public + idempotent + rate-limited at 10/min. Homepage signup form posts to it with `source: "homepage"`.
- **SEO meta.** `og:title/description/type/image`, `twitter:card`, `description` on the root document — references `/og-image.png` which is a placeholder for a future generated image.
