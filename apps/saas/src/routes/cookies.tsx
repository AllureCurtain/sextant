import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/cookies")({ component: Cookies });

function Cookies() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <p className="rise label-caps text-signal">Legal</p>
        <h1 className="rise stagger-1 mt-3 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
          Cookie Policy
        </h1>
        <p className="mt-2 text-sm text-ink-3">Last updated: November 14, 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-2">
          <section>
            <h2 className="font-semibold text-ink-1">What we use</h2>
            <p className="mt-2">
              We use cookies for authentication (session tokens), CSRF protection, and remembering
              your preferences. We do not use third-party advertising cookies.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink-1">Essential cookies</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs">
                  better-auth.session_token
                </code>{" "}
                — keeps you logged in
              </li>
              <li>
                <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs">
                  better-auth.csrf_token
                </code>{" "}
                — protects against cross-site request forgery
              </li>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold text-ink-1">Analytics</h2>
            <p className="mt-2">
              If enabled, Cloudflare Web Analytics collects anonymous usage statistics. No personal
              data is collected and no cookies are set.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
