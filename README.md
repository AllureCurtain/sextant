# Sextant

**Sextant** — the navigator's instrument — is a Cloudflare-native template for building outbound sites fast: one repo, two decoupled apps, shared plumbing.

- `apps/content` — a content / GEO site (Astro). Hundreds of overview + Q&A pages generated from a keyword table, built for search engines and AI answers (SEO + GEO).
- `apps/saas` — a SaaS app (TanStack Start). Sign-up, login, Stripe billing, usage credits, admin console.

Each app deploys on its own to Cloudflare Workers. They share only the plumbing (`packages/*`): email, analytics, SEO/GEO helpers, deploy scripts. Delete one app and the other still works.

## Status

Working scaffold. The build in [`docs/PLAN.md`](docs/PLAN.md) is implemented and verified locally — both apps build, typecheck, lint, and the content site generates 100+ pages with SEO/GEO outputs. Live deploys to `*.workers.dev` require your own Cloudflare account (`wrangler login` or a `CLOUDFLARE_API_TOKEN`); see [`docs/BUILD-REPORT.md`](docs/BUILD-REPORT.md) for the verification matrix.

## Stack

| Layer           | Choice                                 |
| --------------- | -------------------------------------- |
| Language        | TypeScript                             |
| Content site    | Astro + `@astrojs/cloudflare`          |
| SaaS app        | TanStack Start + Hono, React 19        |
| Runtime         | Cloudflare Workers (Wrangler)          |
| Database        | Cloudflare D1 + Drizzle ORM            |
| Files           | Cloudflare R2                          |
| Auth            | Better Auth                            |
| Payments        | Stripe (test mode by default)          |
| Email           | Resend (free tier) or Cloudflare Email |
| Analytics       | Cloudflare Web Analytics               |
| Styling         | Tailwind CSS v4                        |
| Components      | shadcn/ui (SaaS app)                   |
| Icons           | lucide-react                           |
| Forms           | React Hook Form + Zod                  |
| Server state    | TanStack Query                         |
| Validation      | Zod                                    |
| Jobs            | Cloudflare Queues                      |
| Cron            | Cloudflare Cron Triggers               |
| Content search  | Pagefind                               |
| Testing         | Vitest + Playwright smoke              |
| Lint/format     | ESLint + Prettier                      |
| Package manager | pnpm workspaces                        |

## Quickstart

```bash
git clone https://github.com/AllureCurtain/sextant.git
cd sextant
pnpm install
pnpm dev:content   # content site at http://localhost:4321
pnpm dev:saas      # SaaS app at http://localhost:3000
```

Copy `apps/saas/.dev.vars.example` to `apps/saas/.dev.vars` and fill in your own keys. Never commit `.dev.vars`.

Deploy:

```bash
pnpm deploy:content
pnpm deploy:saas
```

Each app has its own Wrangler config — `apps/content` uses `wrangler.toml`, `apps/saas` uses `wrangler.jsonc` (it holds the D1 binding). See `docs/development.md` for the full deploy and environment-variable list.

## Starting a new site from Sextant

1. Fork this repo.
2. Keep the app you need (`apps/content`, `apps/saas`, or both) and delete the other.
3. Replace the keyword table in `apps/content/src/data/keywords.*` (content site) or the product/plan config in `apps/saas` (SaaS app).
4. Set your domain in the app's Wrangler config (`apps/content/wrangler.toml` or `apps/saas/wrangler.jsonc`) and deploy.

## Rules

- MIT licensed. Reused open-source code keeps its original LICENSE / NOTICE files.
- No secrets in the repo. Ever. Keys live in `.dev.vars` (local) and Cloudflare secrets (production).
- All English: UI, docs, code, comments, and commits are in English.
- Money and credits are integers in minor units, never floating point.

## License

MIT. See [LICENSE](LICENSE).
