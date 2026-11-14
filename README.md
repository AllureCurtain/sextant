# Sextant

**Sextant** （六分仪 — the navigator's instrument) is a Cloudflare-native template for building outbound sites fast: one repo, two decoupled apps, shared plumbing.

- `apps/content` — a content / GEO site (Astro). Hundreds of overview + Q&A pages generated from a keyword table, built for search engines and AI answers (SEO + GEO).
- `apps/saas` — a SaaS app (TanStack Start). Sign-up, login, Stripe billing, usage credits, admin console.

Each app deploys on its own to Cloudflare Workers. They share only the plumbing (`packages/*`): email, analytics, SEO/GEO helpers, deploy scripts. Delete one app and the other still works.

## Status

Scaffold. The plan is in [`docs/PLAN.md`](docs/PLAN.md); implementation is in progress. Do not treat this repo as a finished template yet. The quickstart below describes the target; it works once the build in `docs/PLAN.md` is complete.

## Stack

| Layer | Choice |
| --- | --- |
| Language | TypeScript |
| Content site | Astro + `@astrojs/cloudflare` |
| SaaS app | TanStack Start + Hono, React 19 |
| Runtime | Cloudflare Workers (Wrangler) |
| Database | Cloudflare D1 + Drizzle ORM |
| Files | Cloudflare R2 |
| Auth | Better Auth |
| Payments | Stripe (test mode by default) |
| Email | Resend (free tier) or Cloudflare Email |
| Analytics | Cloudflare Web Analytics |
| Package manager | pnpm workspaces |

## Quickstart

```bash
git clone https://github.com/AllureCurtain/sextant.git
cd sextant
pnpm install
pnpm dev:content   # content site at http://localhost:4321
pnpm dev:saas      # SaaS app at http://localhost:3000
```

Copy `.dev.vars.example` to `.dev.vars` and fill in your own keys. Never commit `.dev.vars`.

Deploy:

```bash
pnpm deploy:content
pnpm deploy:saas
```

Each app has its own `wrangler.toml` and its own D1 database. See `docs/PLAN.md` for the full deploy and environment-variable list.

## Starting a new site from Sextant

1. Fork this repo.
2. Keep the app you need (`apps/content`, `apps/saas`, or both) and delete the other.
3. Replace the keyword table in `apps/content/src/data/keywords.*` (content site) or the product/plan config in `apps/saas` (SaaS app).
4. Set your domain in `wrangler.toml` and deploy.

## Rules

- MIT licensed. Reused open-source code keeps its original LICENSE / NOTICE files.
- No secrets in the repo. Ever. Keys live in `.dev.vars` (local) and Cloudflare secrets (production).
- Free tiers only. The template must run without any paid service.
- English-first: UI, docs, and generated pages are in English.

## License

MIT. See [LICENSE](LICENSE).
