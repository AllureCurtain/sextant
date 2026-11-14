# Sextant build plan (for the implementing agent)

Read this file once, top to bottom, then work through it in order. Do not redesign the shape in section 2. If a step cannot be done as written, do the closest working alternative and record the deviation in `docs/BUILD-REPORT.md`.

## 1. Goal

Build Sextant into a working, open-source, Cloudflare-native template for outbound sites, so that starting a new site means forking this repo, changing a keyword table or a product config, and deploying — not rebuilding auth, billing, SEO, or deploy plumbing.

## 2. Shape (decided, do not redesign)

- One repo, two decoupled apps + shared plumbing.
- `apps/content` — content / GEO site. Astro. Static-first. Its job is to turn a keyword table into hundreds of overview + Q&A pages that search engines and AI answers can find (SEO + GEO).
- `apps/saas` — SaaS app. TanStack Start + Hono, React 19. Its job is a working tool with sign-up, login, Stripe billing, usage credits, and an admin console.
- `packages/*` — shared plumbing only: email, analytics snippet, SEO/GEO generators (sitemap, llms.txt, FAQ JSON-LD), deploy scripts. No app logic in packages.
- Each app deploys independently to Cloudflare Workers, has its own `wrangler.toml` and its own D1 database. Deleting one app must not break the other. The content app must not import auth or billing code. The SaaS app must not import the content pipeline.

## 3. Non-goals

- No real product, no real demand, no real content. Use small sample data (10 sample keywords, 1 sample paid plan) that proves the machinery works.
- No SandBase Lab content, code, or branding anywhere in this repo.
- Stripe stays in test mode. Email uses Resend free tier or Cloudflare Email. The template is built on services that offer free tiers; a site may move to a paid tier when it outgrows the free one.
- Do not buy or copy code from paid templates (TanStarter, TanLaunch, ShipKit, or similar). Reuse only MIT / Apache-2.0 open-source code, and keep its LICENSE / NOTICE files.

## 4. Stack (TypeScript everywhere)

- Language: TypeScript, strict mode. Package manager: pnpm workspaces. Runtime: Node 22 LTS or newer.
- Runtime: Cloudflare Workers, deployed with Wrangler. Node APIs only where Workers supports them.
- Content: Astro (latest stable) + `@astrojs/cloudflare` adapter. Content collections for pages. Content search: Pagefind (build-time, no backend).
- SaaS: TanStack Start + Hono, React 19, TanStack Router.
- Database: Cloudflare D1 + Drizzle ORM. Migrations in each app's `drizzle/` directory.
- Files: Cloudflare R2.
- Auth: Better Auth (email + password, Google OAuth, sessions on D1).
- Payments: Stripe Checkout + Billing + webhooks (test mode). The webhook handler must verify the signature, deduplicate by event id, and translate the event into one internal entitlement change.
- Email: Resend (free tier) with react-email templates; fall back to Cloudflare Email if Resend is unavailable. Transactional mail only (welcome, receipt, password reset).
- Analytics: Cloudflare Web Analytics snippet (no cookies, no extra account).
- Styling: Tailwind CSS v4. Components: shadcn/ui (SaaS app, Radix primitives). Icons: lucide-react.
- Forms: React Hook Form + Zod. Server state: TanStack Query. Validation: Zod everywhere.
- Background jobs: Cloudflare Queues. Scheduled work: Cloudflare Cron Triggers. No extra job vendor in v1.
- Testing: Vitest (unit) + Playwright smoke (section 7).
- Lint/format: ESLint (flat config) + Prettier.
- CI: GitHub Actions — typecheck + build on every PR; deploy to Workers on push to main; verify the deployed URL returns 200 after each deploy.

## 5. Start from official starters only (no third-party template)

- Do not fork, copy, or point to any third-party starter, boilerplate, or reference template. This template is written by us, from the official minimal starters and the libraries' own documentation.
- Content app: start from the Astro official starter (`npm create astro@latest`) + `@astrojs/cloudflare` docs. Write the content pipeline (keyword table, page generation, SEO/GEO outputs) yourself.
- SaaS app: start from the official TanStack Start starter (follow the scaffolding command in the TanStack Start documentation at build time). Write the auth, billing, dashboard, and admin wiring yourself, using the Better Auth, Drizzle, and Stripe documentation.
- Libraries are dependencies, not templates: install Better Auth, Drizzle, Stripe SDK, and the rest as packages and use them as documented. Do not re-implement them. Do not copy code from other people's projects, templates, or example apps.
- Record every dependency and its license in `THIRD_PARTY_NOTICES.md`. If a library's license is not MIT, Apache-2.0, BSD, or ISC, flag it in the final report and do not use it without noting the exception.

## 6. Repo layout (target)

```
sextant/
  README.md
  AGENTS.md               # operating manual (standing rules, not a build brief)
  TODO.md                 # index of open issues, one row each
  THIRD_PARTY_NOTICES.md
  package.json            # pnpm workspaces + root scripts (section 11, step 1)
  .github/workflows/ci.yml
  docs/
    PLAN.md               # this file
    BUILD-REPORT.md       # written at the end (section 12)
    development.md        # commands, env vars, deploy, release
    decisions.md          # append-only technical decisions
  apps/
    content/              # Astro content / GEO site
      AGENTS.md           # content-app rules
      src/content/        # page content (collections)
      src/data/keywords.ts  # sample keyword table (10 rows)
      src/lib/geo.ts      # sitemap / llms.txt / FAQ JSON-LD generation
      wrangler.toml
    saas/                 # TanStack Start SaaS app
      AGENTS.md           # SaaS-app rules
      .dev.vars.example   # env var names + comments, no values
      src/routes/         # marketing, auth, dashboard, admin, billing
      src/server/         # Hono API, auth, Stripe webhooks
      drizzle/            # D1 migrations
      wrangler.toml
  packages/
    email/                # Resend wrapper + react-email templates
    analytics/            # Web Analytics snippet
    seo/                  # shared SEO/GEO generators
    deploy/               # shared deploy scripts
```

## 7. What each app must do

### 7.1 Content app (apps/content)

- Build 100 pages from the sample keyword table (10 keywords x overview + Q&A variants) with `pnpm build`, no errors.
- Every page: title, meta description, canonical URL, Open Graph tags, FAQ or Article JSON-LD where applicable.
- Generated at build time: `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`.
- The keyword table is the single source of truth: adding a row adds pages; no hand-written pages for sample content.
- Same input generates the same pages (deterministic build; no timestamps or random ids in output).
- One shared layout, fast (no client JS unless a page needs it).
- Deploy to a `*.workers.dev` URL; all sample pages return 200.

### 7.2 SaaS app (apps/saas)

- Marketing landing page, pricing page, sign-up, login (email + password and Google), logout, password reset via email.
- Dashboard after login; usage credits shown; a sample paywalled action consumes 1 credit.
- Stripe test mode: checkout for the sample plan, webhook updates the entitlement, billing portal link works in test mode.
- Admin page: list users, see plan and credit balance.
- D1 migrations apply cleanly from scratch (`wrangler d1 migrations apply --local` then remote).
- Deploy to a `*.workers.dev` URL; `pnpm build` and typecheck pass with zero errors.

## 8. Shared packages

- `packages/email`: send function + templates (welcome, receipt, password reset). No provider key in code; read from env.
- `packages/analytics`: one snippet/component to drop into both apps.
- `packages/seo`: functions that generate sitemap entries, llms.txt, and FAQ JSON-LD from a page list. Used by the content app; available to the SaaS app's marketing pages.
- `packages/deploy`: scripts used by CI for both apps (migrate + deploy).
- `AGENTS.md` files: root (standing rules), `apps/content/AGENTS.md`, `apps/saas/AGENTS.md`. Keep them current as the code changes; they are the manual the next agent reads first.

## 9. Environment variables (names, not values)

- Content app: none required for the sample build.
- SaaS app: `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `RESEND_API_KEY`, `PUBLIC_SITE_URL`. Provide `.dev.vars.example` with empty values and a comment per variable. Never commit real values. Never print a secret in logs.

## 10. Constraints

- TypeScript, strict mode, no `any` in new code unless a library forces it (note it in a comment).
- All English: UI strings, docs, code comments, commit messages, and branch names are in English. No Chinese in the repo.
- No secrets, tokens, or private keys in the repo, in any file, at any time.
- Money and credits are always integers in minor units (cents; 1 credit = 1 unit), never floating point.
- API contract first: Zod schemas + a routes table before handlers. No undocumented endpoint in the SaaS app.
- Cross-platform: dev scripts are pnpm scripts only; no `.sh`-only or `.bat`-only scripts.
- Never commit directly on main; main only receives PR merges. Branch names are `<type>/<kebab-case-description>` with types `feat|fix|docs|refactor|test|chore|build|ci|perf`.
- Documentation is updated in the same PR as the code (see `AGENTS.md` for the per-doc rules).
- Every dependency must be MIT, Apache-2.0, BSD, or ISC licensed. Record exceptions in THIRD_PARTY_NOTICES.md and flag them in the final report.
- Pin the exact versions installed and list them in the final report.

## 11. Build order

1. Monorepo skeleton: workspaces, root scripts, CI, per-app `wrangler.toml`, deploy smoke test (a hello page per app on `*.workers.dev`, verified with a 200 response). Root `package.json` defines these scripts: `dev:content`, `dev:saas`, `build`, `build:content`, `build:saas`, `typecheck`, `lint`, `format`, `format:check`, `test`, `test:e2e`, `deploy:content`, `deploy:saas`.
2. Content app: keyword table, page generation, SEO/GEO outputs, sample build of 100 pages, deploy.
3. SaaS app: auth, dashboard, credits, Stripe test-mode billing, admin, deploy.
4. Shared packages + `AGENTS.md` files + `THIRD_PARTY_NOTICES.md` + `docs/development.md` + `docs/decisions.md` + README quickstart verification.
5. Full verification pass against section 7 + section 10. Fix failures; do not mark the template done with a failing check.

## 12. Final report (write to docs/BUILD-REPORT.md)

- Exact versions installed (every dependency pinned: Astro, TanStack Start, Hono, Better Auth, Drizzle, Stripe SDK, Wrangler, Tailwind, shadcn/ui, Vitest, Playwright, ESLint, Prettier).
- The two deployed `*.workers.dev` URLs.
- Each acceptance check from section 7: pass / fail, with the command or URL that proves it.
- Every dependency and its license.
- Known limitations and what is intentionally not done.

## 13. Review

After the build, the reviewer checks this repo against this plan and `AGENTS.md`. Do not publish or announce the template as finished until the review passes. Do not push anything to any other org or repo.

## 14. Operating norms after the scaffold

Once the scaffold in this plan is done, work is issue-driven:

- Direction is settled in a GitHub issue first, with completion criteria written down, before touching code. `TODO.md` is the index of open issues, one row each.
- One PR does one thing: a minimal feature, or the complete closure of one issue. Split unrelated changes.
- One worktree per task, created from the latest main. Never commit directly on main.
- Before pushing, run the fast tier for the apps the change touched: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (affected), `pnpm build` (affected app). Never bypass checks.
- The standing rules live in `AGENTS.md`, not in this plan. This plan describes the one-time scaffold; `AGENTS.md` describes how the repo is operated afterwards.
