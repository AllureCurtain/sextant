import { createFileRoute } from "@tanstack/react-router";
import { Code, DocsPageIntro, SectionHeading } from "./index";

export const Route = createFileRoute("/docs/storage")({
  component: DocsStorage,
});

function DocsStorage() {
  return (
    <div className="min-w-0 max-w-2xl">
      <DocsPageIntro
        kicker="Docs"
        title="Storage & bindings"
        blurb="R2 file uploads, the KV cache namespace, the Workers AI binding, and the rate limiter."
      />

      <section className="mt-14">
        <SectionHeading id="r2-uploads">R2 file uploads</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          User files land in the <code className="font-mono text-xs">BUCKET</code> R2 binding;
          metadata (name, key, content type, size) is tracked in the{" "}
          <code className="font-mono text-xs">user_file</code> table. The{" "}
          <code className="font-mono text-xs">/api/files</code> endpoints handle upload, download,
          and delete.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Provision a bucket and bind it in{" "}
          <code className="font-mono text-xs">wrangler.jsonc</code>:
        </p>
        <div className="mt-4">
          <Code>{`wrangler r2 bucket create sextant-saas-files

# wrangler.jsonc
"r2_buckets": [
  { "binding": "BUCKET", "bucket_name": "sextant-saas-files" }
]`}</Code>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading id="kv-cache">KV cache namespace</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          The optional <code className="font-mono text-xs">KV</code> binding backs the{" "}
          <code className="font-mono text-xs">GET</code>/
          <code className="font-mono text-xs">PUT /api/cache/:key</code> demo endpoints and the
          60-second cache on <code className="font-mono text-xs">/api/config</code>. In dev,
          wrangler serves a local namespace for any id.
        </p>
        <div className="mt-4">
          <Code>{`wrangler kv namespace create sextant-kv

# wrangler.jsonc
"kv_namespaces": [{ "binding": "KV", "id": "<printed-id>" }]`}</Code>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading id="ai-binding">Workers AI binding</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          The optional <code className="font-mono text-xs">AI</code> binding powers the playground
          (summarize, translate, chat, image generation — 1 credit per call). In dev, wrangler stubs
          canned responses; real inference runs when deployed.
        </p>
        <div className="mt-4">
          <Code>{`# wrangler.jsonc
"ai": { "binding": "AI" }`}</Code>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading id="rate-limiter">Rate limiter binding</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          The optional <code className="font-mono text-xs">RATE_LIMITER</code> binding delegates
          per-key counting to Cloudflare. When absent,{" "}
          <code className="font-mono text-xs">src/server/rate-limit.ts</code> falls back to an
          in-memory sliding window with the same policy, so dev behaves the same.{" "}
          <code className="font-mono text-xs">period</code> is limited to 10 or 60 seconds.
        </p>
        <div className="mt-4">
          <Code>{`# wrangler.jsonc
"ratelimits": [
  {
    "name": "RATE_LIMITER",
    "namespace_id": "sextant-saas",
    "simple": { "limit": 100, "period": 60 }
  }
]`}</Code>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading id="send-email">Send Email binding</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          When <code className="font-mono text-xs">EMAIL_PROVIDER=cloudflare</code>, transactional
          email goes through a <code className="font-mono text-xs">send_email</code> binding instead
          of Resend. See the commented example in{" "}
          <code className="font-mono text-xs">wrangler.jsonc</code>; the binding name is{" "}
          <code className="font-mono text-xs">SEND_EMAIL</code>.
        </p>
        <div className="mt-4">
          <Code>{`# wrangler.jsonc
"send_email": [{ "name": "SEND_EMAIL" }]`}</Code>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          If the binding isn't configured, sends log a warning and no-op — the app never crashes on
          a missing email binding.
        </p>
      </section>
    </div>
  );
}
