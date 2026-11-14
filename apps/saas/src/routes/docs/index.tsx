import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/")({ component: DocsIndex });

const TOC = [
  { id: "quickstart", label: "Quickstart" },
  { id: "env-vars", label: "Environment variables" },
  { id: "structure", label: "Project structure" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

const ENV_VARS: { name: string; required: boolean; description: string }[] = [
  { name: "BETTER_AUTH_SECRET", required: true, description: "Random secret for session signing" },
  {
    name: "PUBLIC_SITE_URL",
    required: true,
    description:
      "Public app URL, e.g. http://localhost:3000 — used for auth callbacks and email links",
  },
  { name: "GOOGLE_CLIENT_ID", required: false, description: "Google OAuth client id" },
  { name: "GOOGLE_CLIENT_SECRET", required: false, description: "Google OAuth client secret" },
  { name: "STRIPE_SECRET_KEY", required: true, description: "Stripe test-mode secret key" },
  { name: "STRIPE_WEBHOOK_SECRET", required: true, description: "Stripe webhook signing secret" },
  { name: "STRIPE_PRICE_ID", required: true, description: "Stripe price id for the Pro plan" },
  {
    name: "PAYMENT_PROVIDER",
    required: false,
    description: 'Payment provider key (default "stripe")',
  },
  {
    name: "EMAIL_PROVIDER",
    required: false,
    description: 'Transactional email provider (default "resend"; also "cloudflare")',
  },
  {
    name: "RESEND_API_KEY",
    required: false,
    description: "Resend API key for transactional email",
  },
];

const TROUBLESHOOTING = [
  {
    title: "Google OAuth isn't working",
    body: "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .dev.vars, and add http://localhost:3000/api/auth/callback/google as an authorized redirect URI in the Google Cloud console. In production, use your deployed Worker's URL.",
  },
  {
    title: "Database not migrated",
    body: "Run `pnpm db:migrate:local` to apply migrations to the local D1 database. For the deployed database, run `pnpm db:migrate:remote` after setting the correct Cloudflare account.",
  },
  {
    title: "File uploads return 500",
    body: "The R2 bucket binding is missing. Check that `wrangler.jsonc` has an `r2_buckets` entry and that the bucket exists (`wrangler r2 bucket create sextant-uploads` if it doesn't).",
  },
  {
    title: "Stripe webhook not receiving events",
    body: "Use `stripe listen --forward-to localhost:3000/api/webhooks/stripe` in dev. The webhook secret printed by the CLI goes in .dev.vars as STRIPE_WEBHOOK_SECRET.",
  },
  {
    title: "Emails aren't sending",
    body: "With EMAIL_PROVIDER=resend (the default), RESEND_API_KEY is optional — without it, emails are logged to the console instead of sent. With EMAIL_PROVIDER=cloudflare, a send_email binding must be configured in wrangler.jsonc or sends no-op.",
  },
];

export function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-2xl font-semibold tracking-tight text-ink-1">
      {children}
    </h2>
  );
}

export function Code({ children }: { children: string }) {
  // Fixed near-black surface + light ink so blocks read the same in both themes
  // (the app's neutral/accent ramps invert under `.dark`).
  return (
    <pre className="overflow-x-auto rounded-lg border border-white/10 bg-[#0f0e12] p-4 text-sm leading-relaxed text-[#e7e5e4]">
      <code>{children}</code>
    </pre>
  );
}

export function DocsPageIntro({
  kicker,
  title,
  blurb,
}: {
  kicker: string;
  title: string;
  blurb: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-accent-700 uppercase">{kicker}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">{title}</h1>
      <p className="mt-3 text-ink-2">{blurb}</p>
    </div>
  );
}

function DocsIndex() {
  return (
    <div className="min-w-0 max-w-2xl">
      <DocsPageIntro
        kicker="Docs"
        title="Get Sextant running"
        blurb="From a clean clone to a deployed SaaS on Cloudflare Workers."
      />

      {/* Quickstart */}
      <section className="mt-14">
        <SectionHeading id="quickstart">Quickstart</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          You'll need Node 22+, pnpm, and a free Cloudflare account. Stripe and Resend accounts are
          optional for local dev.
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              1. Install
            </p>
            <Code>{`git clone https://github.com/your-org/sextant.git
cd sextant
pnpm install`}</Code>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              2. Configure env vars
            </p>
            <p className="mb-2 text-sm leading-relaxed text-ink-2">
              Copy the example file and fill in your values:
            </p>
            <Code>{`cp apps/saas/.dev.vars.example apps/saas/.dev.vars`}</Code>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              3. Create the D1 database
            </p>
            <Code>{`cd apps/saas
wrangler d1 create sextant-db
# copy the database_id into wrangler.jsonc
pnpm db:migrate:local`}</Code>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              4. Run it
            </p>
            <Code>{`pnpm dev:saas    # http://localhost:3000
pnpm dev:content # http://localhost:4321`}</Code>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              5. Deploy
            </p>
            <Code>{`pnpm deploy:saas
pnpm deploy:content`}</Code>
          </div>
        </div>
      </section>

      {/* Env vars */}
      <section className="mt-14">
        <SectionHeading id="env-vars">Environment variables</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          All variables go in{" "}
          <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs font-mono text-ink-1">
            apps/saas/.dev.vars
          </code>{" "}
          for local dev, and in{" "}
          <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs font-mono text-ink-1">
            wrangler.jsonc
          </code>{" "}
          vars or Cloudflare secrets for production.
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-panel-2">
                <th className="px-4 py-2.5 text-left font-medium text-ink-1">Variable</th>
                <th className="px-4 py-2.5 text-left font-medium text-ink-1">Required</th>
                <th className="px-4 py-2.5 text-left font-medium text-ink-1">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-panel">
              {ENV_VARS.map((v) => (
                <tr key={v.name}>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-1">{v.name}</td>
                  <td className="px-4 py-2.5">
                    {v.required ? (
                      <span className="rounded-full bg-coral-500/10 px-2 py-0.5 text-[11px] font-medium text-coral-600">
                        required
                      </span>
                    ) : (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-700">
                        optional
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-ink-2">{v.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-1.5">
          {TOC.filter((t) => t.id !== "quickstart").map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-sm text-accent-700 transition-colors hover:text-accent-800"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Structure */}
      <section className="mt-14">
        <SectionHeading id="structure">Project structure</SectionHeading>
        <div className="mt-5">
          <Code>{`sextant/
  apps/
    content/          # Astro content / GEO site
      src/pages/      # keyword + Q&A routes
      src/lib/        # content pipeline, SEO helpers
    saas/             # TanStack Start SaaS app
      src/routes/     # file-based routes
      src/server/     # Hono API, auth, Stripe
      src/db/         # Drizzle schema + migrations
      src/components/ # UI + site header
  packages/
    email/            # Resend wrapper + react-email templates
    analytics/        # Cloudflare Web Analytics snippet
    seo/              # shared SEO/GEO generators
    deploy/           # shared deploy scripts
  docs/               # PLAN.md, development.md, decisions.md`}</Code>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mt-14">
        <SectionHeading id="troubleshooting">Troubleshooting</SectionHeading>
        <div className="mt-5 space-y-4">
          {TROUBLESHOOTING.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-panel p-5 shadow-xs"
            >
              <h3 className="text-sm font-semibold tracking-tight text-ink-1">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14 rounded-xl border border-border bg-panel p-6 shadow-xs">
        <h3 className="text-sm font-semibold tracking-tight text-ink-1">Still stuck?</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Open an issue on the tracker or check{" "}
          <Link
            to="/contact"
            className="font-medium text-accent-700 transition-colors hover:text-accent-800"
          >
            the contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
