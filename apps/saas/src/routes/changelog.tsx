import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/changelog")({ component: Changelog });

type Release = {
  version: string;
  date: string;
  entries: string[];
};

const RELEASES: Release[] = [
  {
    version: "0.2.0",
    date: "2026-11-14",
    entries: [
      "AI playground — Workers AI summarize, translate, chat, and image generation",
      "Blog, docs, changelog, and showcase pages",
      "Light/dark theme toggle persisted to localStorage",
      "Settings split into Profile / API Keys / Files / Usage tabs",
      "User profile: update name, change password, delete account",
      "Waitlist endpoint and homepage signup form",
      "OpenGraph + Twitter Card meta on all pages",
      "SiteHeader public nav expanded",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-11-01",
    entries: [
      "Initial scaffold: TanStack Start + Hono on Cloudflare Workers",
      "Better Auth with email/password and Google OAuth",
      "Stripe test-mode checkout, webhooks, billing portal",
      "Integer credit balances with a paywalled demo action",
      "API keys: sk_live_ + 32 hex, SHA-256 hashed, one-time reveal",
      "R2 file storage with per-user namespacing",
      "D1 + Drizzle migrations for users, entitlements, keys, files",
      "Admin console with user list and entitlement controls",
      "In-memory rate limiter with Cloudflare binding in prod",
    ],
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function Changelog() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <div className="mb-12">
          <p className="rise label-caps text-signal">Changelog</p>
          <h1 className="rise stagger-1 mt-2 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
            What's new
          </h1>
          <p className="rise stagger-2 mt-3 text-ink-2">
            Releases and notable changes to the template.
          </p>
        </div>
        <ol className="relative space-y-10 border-l border-border pl-8">
          {RELEASES.map((release) => (
            <li key={release.version} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full border-2 border-page bg-accent-600"
              />
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-ink-1">
                  v{release.version}
                </h2>
                <time dateTime={release.date} className="text-sm text-ink-3">
                  {formatDate(release.date)}
                </time>
              </div>
              <ul className="mt-4 space-y-2">
                {release.entries.map((entry) => (
                  <li key={entry} className="flex items-start gap-2.5 text-sm text-ink-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-3" />
                    {entry}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
