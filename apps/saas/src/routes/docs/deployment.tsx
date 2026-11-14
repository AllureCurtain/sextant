import { createFileRoute } from "@tanstack/react-router";
import { Code, DocsPageIntro, SectionHeading } from "./index";

export const Route = createFileRoute("/docs/deployment")({
  component: DocsDeployment,
});

function DocsDeployment() {
  return (
    <div className="min-w-0 max-w-2xl">
      <DocsPageIntro
        kicker="Docs"
        title="Deployment"
        blurb="deploy:setup, wrangler deploy, GitHub Actions CI/CD, and promoting dev → staging → prod."
      />

      <section className="mt-14">
        <SectionHeading id="deploy-setup">First deploy: deploy:setup</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          The repo ships a first-deploy CLI in{" "}
          <code className="font-mono text-xs">packages/deploy</code>. It provisions D1/R2/KV,
          patches the ids into <code className="font-mono text-xs">wrangler.jsonc</code>, applies
          migrations, and deploys. Run it from the repo root;{" "}
          <code className="font-mono text-xs">--dry-run</code> previews every step.
        </p>
        <div className="mt-4">
          <Code>{`pnpm deploy:setup
pnpm deploy:setup --dry-run   # preview without side effects`}</Code>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Manual equivalent, from inside <code className="font-mono text-xs">apps/saas</code>:
        </p>
        <div className="mt-4">
          <Code>{`wrangler d1 create sextant-saas          # paste database_id into wrangler.jsonc
wrangler r2 bucket create sextant-saas-files
wrangler kv namespace create sextant-kv
wrangler d1 migrations apply DB --remote`}</Code>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading id="wrangler-deploy">wrangler deploy</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Each app deploys on its own to{" "}
          <code className="font-mono text-xs">&lt;app&gt;.&lt;subdomain&gt;.workers.dev</code> (or a
          custom domain). The SaaS app uses{" "}
          <code className="font-mono text-xs">wrangler.jsonc</code>; the content app uses{" "}
          <code className="font-mono text-xs">wrangler.toml</code>.
        </p>
        <div className="mt-4">
          <Code>{`pnpm deploy:saas       # wrangler deploy inside apps/saas
pnpm deploy:content    # wrangler deploy inside apps/content`}</Code>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Before the first SaaS deploy, set{" "}
          <code className="font-mono text-xs">vars.PUBLIC_SITE_URL</code> in{" "}
          <code className="font-mono text-xs">wrangler.jsonc</code> to the deployed URL and paste
          the real D1 <code className="font-mono text-xs">database_id</code> — neither is a secret,
          and wrangler does not reliably interpolate env vars into{" "}
          <code className="font-mono text-xs">database_id</code>.
        </p>
      </section>

      <section className="mt-14">
        <SectionHeading id="ci-cd">CI/CD via GitHub Actions</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          <code className="font-mono text-xs">.github/workflows/ci.yml</code> runs the same gates as
          local development: format check, lint, typecheck, unit tests, and a build of both apps. On
          push to <code className="font-mono text-xs">main</code> it deploys each app and verifies
          the deployed URL returns 200; PRs get preview deploys.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Required GitHub secrets for the deploy job:{" "}
          <code className="font-mono text-xs">CLOUDFLARE_API_TOKEN</code> and{" "}
          <code className="font-mono text-xs">CLOUDFLARE_ACCOUNT_ID</code>, plus the app secrets (
          <code className="font-mono text-xs">BETTER_AUTH_SECRET</code>,{" "}
          <code className="font-mono text-xs">STRIPE_*</code>,{" "}
          <code className="font-mono text-xs">RESEND_API_KEY</code>, …) configured as Worker
          secrets.
        </p>
      </section>

      <section className="mt-14">
        <SectionHeading id="environment-promotion">Environment promotion</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Keep three environments with separate bindings and secrets:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-2">
          <li>
            <strong className="font-medium text-ink-1">dev</strong> — local wrangler +
            <code className="font-mono text-xs"> .dev.vars</code>. Local D1/KV/R2, Stripe test keys,
            emails logged without <code className="font-mono text-xs">RESEND_API_KEY</code>.
          </li>
          <li>
            <strong className="font-medium text-ink-1">staging</strong> — a second Worker name (e.g.{" "}
            <code className="font-mono text-xs">sextant-saas-staging</code>) with its own D1
            database and R2 bucket, still on Stripe test keys. Deploy manually or from a{" "}
            <code className="font-mono text-xs">staging</code> branch.
          </li>
          <li>
            <strong className="font-medium text-ink-1">prod</strong> — the main Worker. Promote by
            merging to <code className="font-mono text-xs">main</code>; CI deploys and smoke-checks.
            Switch Stripe to live keys only when the site owner is ready.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Every environment needs its own <code className="font-mono text-xs">PUBLIC_SITE_URL</code>
          , <code className="font-mono text-xs">database_id</code>, and webhook endpoints (Stripe
          and Google OAuth redirect URIs included).
        </p>
      </section>
    </div>
  );
}
