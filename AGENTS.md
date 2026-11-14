# Sextant

Sextant is a Cloudflare-native template for building outbound sites fast: one repo, two decoupled apps, shared plumbing. `apps/content` is a content / GEO site (Astro). `apps/saas` is a SaaS app (TanStack Start). Each app deploys on its own to Cloudflare Workers.

## Tech stack

| Layer           | Choice                                                          |
| --------------- | --------------------------------------------------------------- |
| Language        | TypeScript, strict mode                                         |
| Content site    | Astro + `@astrojs/cloudflare`                                   |
| SaaS app        | TanStack Start + Hono, React 19                                 |
| Runtime         | Cloudflare Workers (Wrangler); Node 22 LTS or newer for tooling |
| Database        | Cloudflare D1 + Drizzle ORM                                     |
| Files           | Cloudflare R2                                                   |
| Auth            | Better Auth                                                     |
| Payments        | Stripe (test mode by default)                                   |
| Email           | Resend (free tier) or Cloudflare Email                          |
| Analytics       | Cloudflare Web Analytics                                        |
| Styling         | Tailwind CSS v4                                                 |
| Components      | shadcn/ui (SaaS app)                                            |
| Icons           | lucide-react                                                    |
| Forms           | React Hook Form + Zod                                           |
| Server state    | TanStack Query                                                  |
| Validation      | Zod                                                             |
| Jobs            | Cloudflare Queues                                               |
| Cron            | Cloudflare Cron Triggers                                        |
| Content search  | Pagefind                                                        |
| Testing         | Vitest + Playwright smoke                                       |
| Lint/format     | ESLint (flat config) + Prettier                                 |
| Package manager | pnpm workspaces                                                 |

## Layout

```
sextant/
  README.md
  AGENTS.md               # this file
  TODO.md                 # index of open issues, one row each
  THIRD_PARTY_NOTICES.md
  package.json            # pnpm workspaces + root scripts
  .github/workflows/ci.yml
  docs/
    PLAN.md               # one-time scaffold plan (not the operating manual)
    BUILD-REPORT.md       # written at the end of the scaffold
    development.md        # commands, env vars, deploy, release
    decisions.md          # append-only technical decisions
  apps/
    content/              # Astro content / GEO site; rules in apps/content/AGENTS.md
    saas/                 # TanStack Start SaaS app; rules in apps/saas/AGENTS.md
  packages/
    email/                # Resend wrapper + react-email templates
    analytics/            # Web Analytics snippet
    seo/                  # shared SEO/GEO generators
    deploy/               # shared deploy scripts
```

## Common commands

Full command list in `docs/development.md`.

```bash
pnpm install
pnpm dev:content          # content site at http://localhost:4321
pnpm dev:saas             # SaaS app at http://localhost:3000
pnpm build                # both apps
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test                 # Vitest unit tests
pnpm test:e2e             # Playwright smoke tests
pnpm deploy:content
pnpm deploy:saas
```

## Development process

- Issue-driven after the scaffold. Direction is settled in a GitHub issue first, with completion criteria written down, before touching code. `TODO.md` is the index of open issues, one row each.
- One PR does one thing: a minimal feature, or the complete closure of one issue. Split unrelated changes.
- One worktree per task, created from the latest main. Never commit directly on main; main only receives PR merges.
- Branch names are `<type>/<kebab-case-description>` with types `feat|fix|docs|refactor|test|chore|build|ci|perf`. No issue numbers in branch names; link the issue from the PR with `Closes #123` or `Refs #123`.
- Code, tests, and docs go in the same PR.

## Before pushing

Run the fast tier for the apps the change touched:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test                 # affected suites
pnpm build                # affected app
```

Never bypass checks. CI runs the same gates.

## Source of truth

| Information                         | Authority                |
| ----------------------------------- | ------------------------ |
| Template shape and build order      | `docs/PLAN.md`           |
| Commands, env vars, deploy, release | `docs/development.md`    |
| Technical decisions                 | `docs/decisions.md`      |
| Content model and GEO rules         | `apps/content/AGENTS.md` |
| SaaS API, auth, billing             | `apps/saas/AGENTS.md`    |
| Current progress                    | `TODO.md`                |
| Reused code and licenses            | `THIRD_PARTY_NOTICES.md` |

## Hard rules

- All English: docs, code comments, commit messages, branch names, UI copy. No Chinese in the repo. Conversation with the agent may be in Chinese; the written artifacts stay English.
- Never commit secrets. New environment variables go in `.dev.vars.example` in the same change.
- Money and credits are always integers in minor units (cents; 1 credit = 1 unit), never floating point.
- API contract first: Zod schemas + a routes table before handlers. No undocumented endpoint in the SaaS app.
- Webhook handlers verify the provider signature and deduplicate by event id.
- Cross-platform: dev scripts are pnpm scripts only; no `.sh`-only or `.bat`-only scripts.
- Read `docs/decisions.md` before changing a technology choice or overturning an existing one.
- The content app must not import auth or billing code. The SaaS app must not import the content pipeline.
- Reused open-source code keeps its LICENSE / NOTICE files; dependencies must be MIT, Apache-2.0, BSD, or ISC licensed.

## Documentation index

| When                                | Read                     |
| ----------------------------------- | ------------------------ |
| Starting any task                   | `TODO.md`                |
| Template shape and build order      | `docs/PLAN.md`           |
| Commands, env vars, deploy, release | `docs/development.md`    |
| Technical decisions                 | `docs/decisions.md`      |
| Content model and GEO rules         | `apps/content/AGENTS.md` |
| SaaS API, auth, billing             | `apps/saas/AGENTS.md`    |
| Reused code and licenses            | `THIRD_PARTY_NOTICES.md` |

## Documentation update rules

- Documentation is updated in the same PR as the code.
- Starting or finishing a task: update `TODO.md`.
- A technical decision made: append an entry to `docs/decisions.md`.
- New command or environment variable: update `docs/development.md` and `.dev.vars.example`.
- A user-visible behavior change: update `README.md`.
