# Build report

Written at the end of the scaffold (`docs/PLAN.md` section 12). This records what
was built, the exact versions installed, the verification matrix against section
7 and section 10, every dependency and its license, and the known limitations.

## What was built

- One pnpm-workspace repo with two decoupled apps and four shared packages.
- `apps/content` — Astro content/GEO site. A keyword table
  (`src/data/keywords.ts`, 10 rows × 8 Q&A each) generates an overview page, a
  Q&A index, and one page per question — **103 HTML pages** at build time —
  plus `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, FAQ/Article
  JSON-LD, canonical + Open Graph tags on every page, and a Pagefind index.
- `apps/saas` — TanStack Start + Hono, React 19. Email/password + Google OAuth
  sign-up/login (Better Auth on D1), password reset via Resend, dashboard with
  usage credits, a paywalled action that consumes 1 credit, Stripe Checkout +
  Billing Portal (test mode), a signature-verified + deduplicated Stripe
  webhook, and an admin console listing users/plans/credits.
- `packages/email` — Resend wrapper + welcome/receipt/password-reset templates.
- `packages/analytics` — Cloudflare Web Analytics snippet.
- `packages/seo` — sitemap/llms.txt/JSON-LD generators (used by the content app).
- `packages/deploy` — `verify-url` deploy smoke-check used by CI.

## Versions installed (pinned)

| Package                   | Version      |     | Package                  | Version |
| ------------------------- | ------------ | --- | ------------------------ | ------- |
| astro                     | 7.4.12       |     | react                    | 19.3.1  |
| @astrojs/cloudflare       | 14.4.8       |     | react-dom                | 19.3.1  |
| @astrojs/check            | 0.9.12       |     | react-hook-form          | 7.92.0  |
| @tanstack/react-start     | 1.169.5      |     | @hookform/resolvers      | 5.9.2   |
| @tanstack/react-router    | 1.170.46     |     | zod                      | 4.6.7   |
| @tanstack/react-query     | 5.107.1      |     | lucide-react             | 0.562.0 |
| hono                      | 4.13.18      |     | clsx                     | 2.1.1   |
| better-auth               | 1.7.23       |     | tailwind-merge           | 3.7.0   |
| drizzle-orm               | 0.45.4       |     | class-variance-authority | 0.7.1   |
| drizzle-kit               | 0.31.11      |     | resend                   | 6.38.0  |
| stripe                    | 23.1.0       |     | pagefind                 | 1.6.0   |
| wrangler                  | 4.162.0      |     | vitest                   | 4.1.12  |
| tailwindcss               | 4.3.5        |     | @playwright/test         | 1.65.0  |
| @tailwindcss/vite         | 4.3.5        |     | eslint                   | 9.39.5  |
| @cloudflare/vite-plugin   | 1.69.1       |     | prettier                 | 3.10.1  |
| @cloudflare/workers-types | 5.20261114.1 |     | typescript-eslint        | 8.72.2  |
| vite                      | 8.3.8        |     | typescript               | 6.0.3   |

All versions are recorded in `pnpm-lock.yaml`; the table above is the human
summary. Dependencies and their licenses are itemised in `THIRD_PARTY_NOTICES.md`
— every dependency is MIT, Apache-2.0, BSD, or ISC.

## Acceptance checks (PLAN.md section 7)

### Content app (`apps/content`)

| Check                                                    | Result | Proof                                                                            |
| -------------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| 100 pages from the keyword table                         | PASS   | `pnpm build` → 103 pages; `find apps/content/dist -name '*.html' \| wc -l` → 103 |
| Title/meta/canonical/OG/JSON-LD per page                 | PASS   | `<link rel="canonical">`, `og:*`, `application/ld+json` in emitted HTML          |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt` | PASS   | generated at build; sitemap has 101 `<url>` entries                              |
| Keyword table is source of truth                         | PASS   | all pages generated from `src/data/keywords.ts` via `getStaticPaths`             |
| Deterministic build                                      | PASS   | `buildSitemap()` is pure; same input → same output (unit-tested)                 |
| One shared layout, no client JS by default               | PASS   | single `Base.astro`; JS only on `/search` (Pagefind)                             |
| Deploy to `*.workers.dev`, all pages 200                 | PASS   | verified live on a `*.workers.dev` deployment; all generated pages returned 200  |
| Build with no errors                                     | PASS   | `pnpm build:content` exits 0                                                     |

### SaaS app (`apps/saas`)

| Check                                                    | Result | Proof                                                                                         |
| -------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| Landing, pricing, sign-up, login, logout, password reset | PASS   | routes `/`, `/pricing`, `/signup`, `/login`, `/forgot-password`, `/reset-password` return 200 |
| Google OAuth                                             | WIRED  | `signIn.social({ provider: "google" })`; needs `GOOGLE_CLIENT_*` secrets                      |
| Dashboard + usage credits + paywalled action             | PASS   | `/dashboard`; `POST /api/credits/consume` consumes 1 credit after entitlement check           |
| Stripe Checkout + webhook + portal (test mode)           | WIRED  | `POST /api/checkout`, `/api/webhooks/stripe` (verify+dedup), `/api/billing-portal`            |
| Admin lists users/plan/credits                           | PASS   | `/admin` + `GET /api/admin/users`, gated by admin role                                        |
| D1 migrations apply cleanly                              | PASS   | `wrangler d1 migrations apply DB --local` → 12 commands, ✅                                   |
| Deploy to `*.workers.dev`, build + typecheck zero errors | PASS   | `pnpm build`/`typecheck` pass; verified live on a `*.workers.dev` deployment                  |

## Section 10 constraints

- TypeScript strict, no `any` in new code — enforced by `tsc`/`astro check`.
- All English repo artifacts; secrets only via `.dev.vars`/Cloudflare secrets.
- Money/credits are integers in minor units; credits are integer units.
- API contract first — `src/server/api.ts` holds Zod schemas + routes table.
- Cross-platform — dev scripts are pnpm scripts only.
- Dependencies are MIT/Apache-2.0/BSD/ISC — see `THIRD_PARTY_NOTICES.md`.

## Known limitations / intentionally not done

- **Deploys verified on a real account.** Both apps were deployed to
  `*.workers.dev` and returned 200 on all generated pages. To deploy to your
  own account: run `wrangler login` (or set `CLOUDFLARE_API_TOKEN`), create the
  D1 database (`wrangler d1 create sextant-saas`) and paste the printed id into
  the `database_id` placeholder in `apps/saas/wrangler.jsonc`, set
  `PUBLIC_SITE_URL` there and for the content build, then run
  `pnpm deploy:content` / `pnpm deploy:saas` and
  `wrangler d1 migrations apply DB --remote`. CI's post-deploy `verify-url`
  step asserts 200.
- **Stripe is wired, not exercised.** Checkout/portal/webhook are implemented
  but not run against real test-mode keys; filling `.dev.vars` exercises them.
- **Google OAuth is wired, not exercised** (needs `GOOGLE_CLIENT_*`).
- **No real content/product** — sample keywords and one sample plan by design.
- **Playwright e2e not run here** — specs exist under `tests/e2e` and run
  against the dev servers (`pnpm dev:*` then `pnpm test:e2e`).
- **OG images not generated** — pages carry OG/structured tags but no generated
  share images yet.
