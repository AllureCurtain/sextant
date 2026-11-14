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
- Bases: johanguse/cloudflare-fullstack-boilerplate (MIT) for SaaS structure; qianshuixia/shrimpreel as the one-site-per-keyword reference. No paid template code (TanStarter, TanLaunch, ShipKit).
