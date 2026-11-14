import { createFileRoute } from "@tanstack/react-router";
import { Code, DocsPageIntro, SectionHeading } from "./index";

export const Route = createFileRoute("/docs/database")({
  component: DocsDatabase,
});

const TABLES: { name: string; purpose: string }[] = [
  { name: "user", purpose: "Better Auth accounts, including admin-plugin role/ban columns" },
  { name: "session", purpose: "Active sessions — the cookie token maps to a row here" },
  { name: "account", purpose: "OAuth + credential accounts linked to a user" },
  { name: "verification", purpose: "Password-reset and email-verification tokens" },
  { name: "entitlement", purpose: "Per-user plan, Stripe ids, status, and credit balance" },
  { name: "stripe_event", purpose: "Webhook dedup — one row per processed Stripe event id" },
  { name: "api_key", purpose: "User API keys; only the SHA-256 hash is stored" },
  { name: "usage_event", purpose: "Audit trail of credit-consuming actions" },
  { name: "user_file", purpose: "Metadata for user-uploaded files in R2" },
  { name: "newsletter_subscriber", purpose: "Newsletter opt-ins stored in D1" },
  { name: "waitlist_entry", purpose: "Waitlist signups with optional source" },
];

function DocsDatabase() {
  return (
    <div className="min-w-0 max-w-2xl">
      <DocsPageIntro
        kicker="Docs"
        title="Database"
        blurb="Cloudflare D1 + Drizzle ORM — schema layout, adding tables, and local vs remote migrations."
      />

      <section className="mt-14">
        <SectionHeading id="schema-overview">Schema overview</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          The schema lives in{" "}
          <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs font-mono text-ink-1">
            src/db/schema.ts
          </code>
          . The first four tables are the Better Auth core schema (with the admin plugin's extra
          columns); the rest are app tables.
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-panel-2">
                <th className="px-4 py-2.5 text-left font-medium text-ink-1">Table</th>
                <th className="px-4 py-2.5 text-left font-medium text-ink-1">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-panel">
              {TABLES.map((t) => (
                <tr key={t.name}>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-1">{t.name}</td>
                  <td className="px-4 py-2.5 text-ink-2">{t.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading id="adding-a-table">Adding a table</SectionHeading>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-2">
          <li>
            Define it in <code className="font-mono text-xs">src/db/schema.ts</code> with{" "}
            <code className="font-mono text-xs">sqliteTable</code>. Money and credit amounts are
            always <code className="font-mono text-xs">integer</code> minor units, never floats.
          </li>
          <li>
            Generate a migration from inside <code className="font-mono text-xs">apps/saas</code>:
          </li>
        </ol>
        <div className="mt-4">
          <Code>{`cd apps/saas
pnpm db:generate        # drizzle-kit generate → drizzle/ folder`}</Code>
        </div>
        <ol
          className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-2"
          start={3}
        >
          <li>Review the generated SQL in the new migration file, then apply it:</li>
        </ol>
        <div className="mt-4">
          <Code>{`pnpm db:migrate:local   # wrangler d1 migrations apply DB --local
pnpm db:migrate:remote  # apply to the deployed database`}</Code>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading id="local-vs-remote">Local vs remote migrations</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          <code className="font-mono text-xs">--local</code> applies migrations to the SQLite file
          wrangler serves during <code className="font-mono text-xs">pnpm dev:saas</code> — safe to
          reset by deleting <code className="font-mono text-xs">.wrangler/state</code>.{" "}
          <code className="font-mono text-xs">--remote</code> applies them to the real D1 database
          bound in <code className="font-mono text-xs">wrangler.jsonc</code>; it asks for
          confirmation and should run in CI or from a maintainer machine.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          The binding is <code className="font-mono text-xs">DB</code> in both cases. Queries go
          through the Drizzle client from{" "}
          <code className="font-mono text-xs">src/server/db.ts</code> — call{" "}
          <code className="font-mono text-xs">getDb()</code> inside handlers, never at module scope,
          so the binding resolves per-request.
        </p>
      </section>
    </div>
  );
}
