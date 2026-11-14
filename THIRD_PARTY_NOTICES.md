# Third-party notices

Sextant is built from official starters and libraries installed as dependencies
— not by copying third-party boilerplate. Every runtime and build dependency is
listed here with its license. All are MIT, Apache-2.0, BSD, or ISC licensed, as
required by `AGENTS.md` and `docs/PLAN.md`.

Reused open-source code keeps its original LICENSE / NOTICE files in
`node_modules`; this file is the index of what we depend on and under what terms.
Versions below are the resolved versions recorded in `pnpm-lock.yaml`.

## Dependencies

| Package                  | Version  | License    | Used for                               |
| ------------------------ | -------- | ---------- | -------------------------------------- |
| astro                    | ^7.4.12  | MIT        | Content site framework                 |
| @astrojs/cloudflare      | ^14.4.8  | MIT        | Cloudflare adapter for Astro           |
| @astrojs/check           | ^0.9.12  | MIT        | `astro check` typechecking             |
| @tanstack/react-start    | 1.169.5  | MIT        | SaaS full-stack framework              |
| @tanstack/react-router   | 1.170.46 | MIT        | Type-safe routing                      |
| @tanstack/react-query    | ^5.107.1 | MIT        | Server-state / data fetching           |
| react                    | ^19.3.1  | MIT        | UI (SaaS app)                          |
| react-dom                | ^19.3.1  | MIT        | UI (SaaS app)                          |
| hono                     | ^4.13.18 | MIT        | HTTP API for the SaaS app              |
| better-auth              | ^1.7.23  | MIT        | Auth (email/password, OAuth, sessions) |
| drizzle-orm              | ^0.45.4  | Apache-2.0 | Typed D1 ORM                           |
| drizzle-kit              | ^0.31.11 | MIT        | D1 migration generation                |
| stripe                   | ^23.1.0  | MIT        | Payments (test mode)                   |
| resend                   | ^6.38.0  | MIT        | Transactional email                    |
| zod                      | ^4.6.7   | MIT        | Validation everywhere                  |
| react-hook-form          | ^7.92.0  | MIT        | Forms                                  |
| @hookform/resolvers      | ^5.9.2   | MIT        | react-hook-form + Zod bridge           |
| marked                   | ^18.2.0  | MIT        | Markdown → HTML for blog posts         |
| tailwindcss              | ^4.3.5   | MIT        | Styling                                |
| @tailwindcss/vite        | ^4.3.5   | MIT        | Tailwind Vite integration              |
| lucide-react             | ^0.562.0 | ISC        | Icons                                  |
| clsx                     | ^2.1.1   | MIT        | Class-name composition                 |
| tailwind-merge           | ^3.7.0   | MIT        | Tailwind class merging                 |
| class-variance-authority | ^0.7.1   | Apache-2.0 | shadcn-style component variants        |
| pagefind                 | ^1.6.0   | MIT        | Build-time content search              |

## Build / dev tooling

| Package                   | Version        | License           | Used for                        |
| ------------------------- | -------------- | ----------------- | ------------------------------- |
| wrangler                  | ^4.162.0       | MIT OR Apache-2.0 | Cloudflare deploys + local dev  |
| @cloudflare/vite-plugin   | ^1.69.1        | MIT               | Workers runtime for Vite        |
| @cloudflare/workers-types | ^5.20261114.1  | MIT OR Apache-2.0 | Worker type definitions         |
| vite                      | ^8.3.8         | MIT               | Build tool                      |
| @vitejs/plugin-react      | ^6.3.0         | MIT               | React fast-refresh              |
| typescript                | ^6.0.3         | Apache-2.0        | Language                        |
| vitest                    | ^4.1.12        | MIT               | Unit tests                      |
| @playwright/test          | ^1.65.0        | Apache-2.0        | Smoke/e2e tests                 |
| eslint                    | ^9.39.5        | MIT               | Linting                         |
| @eslint/js                | ^9.39.5        | MIT               | ESLint base rules               |
| typescript-eslint         | ^8.72.2        | MIT               | TS rules for ESLint             |
| eslint-config-prettier    | ^10.1.8        | MIT               | Disables stylistic ESLint rules |
| globals                   | ^16.5.0        | MIT               | Shared globals for ESLint       |
| prettier                  | ^3.10.1        | MIT               | Formatting                      |
| @types/node               | ^22.20.5       | MIT               | Node types                      |
| @types/react              | ^19.3.0        | MIT               | React types                     |
| @types/react-dom          | ^19.3.0        | MIT               | React DOM types                 |
| miniflare                 | (via wrangler) | MIT               | Local Workers emulation         |
| sharp                     | (via wrangler) | Apache-2.0        | Image processing (Astro assets) |

## Notes

- No third-party starter, boilerplate, or paid template code is vendored into
  this repo. The two apps were scaffolded from the official `create-astro` and
  `@tanstack/cli` minimal starters; everything else is written by us.
- Drizzle ORM is Apache-2.0; its NOTICE obligations are satisfied by retaining
  the LICENSE shipped in `node_modules/drizzle-orm`.
- Stripe, Resend, and Cloudflare are service dependencies, not bundled code —
  only their SDKs/CLIs are dependencies (listed above).
