import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  KeyRound,
  CreditCard,
  Coins,
  FileUp,
  Shield,
  Gauge,
  ArrowRight,
  Check,
  Sparkles,
  Brain,
} from "lucide-react";
import { SiteHeader } from "#/components/site-header";
import { useT } from "#/lib/i18n";

export const Route = createFileRoute("/")({ component: Home });

type Featured = "auth" | "billing" | undefined;
const FEATURES: {
  icon: typeof KeyRound;
  title: string;
  description: string;
  featured?: Featured;
}[] = [
  {
    icon: KeyRound,
    title: "Auth included",
    description:
      "Email/password, Google and GitHub OAuth on Better Auth. Sessions on D1, no external auth vendor.",
    featured: "auth",
  },
  {
    icon: CreditCard,
    title: "Stripe billing",
    description:
      "Checkout, webhooks, and a billing portal wired in test mode. Entitlement state on D1.",
    featured: "billing",
  },
  {
    icon: Coins,
    title: "Usage credits",
    description:
      "Integer credit balances with a paywalled action ready to make your own. No floating point.",
  },
  {
    icon: Brain,
    title: "AI playground",
    description:
      "Summarize, translate, chat, generate, and edit images via Cloudflare Workers AI — credit-gated.",
  },
  {
    icon: FileUp,
    title: "File storage",
    description: "R2 bucket with upload/download/delete endpoints and per-user metadata on D1.",
  },
  {
    icon: Gauge,
    title: "Rate limiting",
    description: "Cloudflare RATE_LIMITER binding in production, in-memory sliding window in dev.",
  },
];

const STACK = [
  "TanStack Start + Hono on Cloudflare Workers",
  "D1 + Drizzle ORM for users, entitlements, API keys, files",
  "R2 for file storage with per-user namespacing",
  "Better Auth for sessions, Google OAuth, password reset",
  "Stripe test-mode billing with webhook entitlement sync",
  "Workers AI for summarize, translate, chat, and image",
  "React Hook Form + Zod for forms, TanStack Query for server state",
  "Tailwind CSS v4 + shadcn/ui components",
  "Newsletter + transactional email via Resend",
  "KV cache, rate limiting, analytics engine bindings",
];

// SAMPLE placeholders — replace with real customer quotes before publishing.
// These are deliberately generic and clearly marked so a fork never ships
// fabricated testimonials that read as real users.
const TESTIMONIALS = [
  {
    quote:
      "Replace this with a real quote from someone who shipped on the template — keep it specific to what they built.",
    name: "Sample testimonial",
    role: "Placeholder — swap in a real user",
    initials: "S1",
  },
  {
    quote:
      "Another real quote goes here. Concrete beats generic: mention the feature that saved them time.",
    name: "Sample testimonial",
    role: "Placeholder — swap in a real user",
    initials: "S2",
  },
  {
    quote:
      "A third real quote. If you don't have users yet, delete this section rather than invent endorsements.",
    name: "Sample testimonial",
    role: "Placeholder — swap in a real user",
    initials: "S3",
  },
];

const FAQ_ITEMS = [
  {
    q: "Is this really production-ready?",
    a: "The plumbing is — auth, Stripe webhooks, entitlement state, hashed API keys, rate limiting, and D1 migrations all work end to end. It is still a template: review the security surface (session settings, OAuth redirect URIs, CORS), swap in your own copy and branding, and run your own audit before charging real money.",
  },
  {
    q: "What does the free plan include?",
    a: "The demo app ships with a free tier: 10 credits on sign-up, access to core features, and community support. It's there to show how entitlements and credit consumption work — tune the numbers in the entitlement code to match your product.",
  },
  {
    q: "Can I use this for commercial projects?",
    a: "Yes. Sextant is MIT licensed — use it for client work, commercial SaaS, or internal tools. The bundled dependencies are MIT, Apache-2.0, BSD, or ISC; see THIRD_PARTY_NOTICES.md for the full list.",
  },
  {
    q: "How do I deploy?",
    a: "Each app deploys independently to Cloudflare Workers: pnpm deploy:saas and pnpm deploy:content. You need a Cloudflare account, a D1 database, an R2 bucket, and secrets set via wrangler. docs/development.md walks through the full setup, including Stripe and Resend keys.",
  },
  {
    q: "What if I need a feature that isn't included?",
    a: "The codebase is meant to be forked, not extended by plugin. The scaffold covers the common SaaS loop; everything else — extra OAuth providers, team workspaces, additional payment providers — you add the same way the existing features are built: Zod contract first, then a Hono route, then the UI.",
  },
  {
    q: "Does it work outside Cloudflare?",
    a: "No — Sextant is deliberately Cloudflare-native. D1, R2, Queues, Cron, and Workers AI are all Cloudflare bindings. Porting to another platform means replacing the data layer, so pick it if you're happy living on the edge network.",
  },
];

const STATS = [
  { value: "2", label: "decoupled apps" },
  { value: "100+", label: "content pages" },
  { value: "0", label: "config to deploy" },
  { value: "MIT", label: "license" },
];

const AVATARS = [
  { initials: "AL", color: "#44403c" },
  { initials: "BK", color: "#6d64f0" },
  { initials: "CM", color: "#78716c" },
  { initials: "DJ", color: "#574bd9" },
  { initials: "ER", color: "#a8a29e" },
];

/**
 * A pure-CSS miniature of the real dashboard — ink rail, KPI tiles, activity
 * rows — so the hero shows the actual product in both light and dark themes.
 * Uses the same --color-* tokens as the app, so it tracks the theme toggle.
 */
function DashboardMock() {
  const kpis = [
    { label: "Credits", value: "87" },
    { label: "Plan", value: "Pro" },
    { label: "Usage", bars: [40, 65, 30, 80, 55, 95, 70] },
  ];
  const rows = [
    { action: "ai.summarize", credits: "1", time: "2m ago" },
    { action: "ai.translate", credits: "1", time: "14m ago" },
    { action: "file.upload", credits: "0", time: "1h ago" },
  ];
  return (
    <div
      aria-hidden="true"
      className="reveal overflow-hidden rounded-2xl border border-border bg-panel text-left shadow-2xl ring-1 ring-black/5 dark:shadow-black/40"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-panel-2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        <span className="h-2.5 w-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        <span className="ml-3 rounded-md bg-page px-2 py-0.5 text-[10px] text-ink-3">
          sextant-saas.workers.dev/dashboard
        </span>
      </div>
      <div className="flex">
        {/* Ink rail */}
        <div className="hidden w-28 shrink-0 flex-col gap-1 border-r border-border bg-ink-1 p-3 dark:bg-black sm:flex">
          <div className="mb-2 text-[10px] font-semibold text-page">Sextant</div>
          {["Dashboard", "Playground", "Settings", "Admin"].map((n, i) => (
            <div
              key={n}
              className={`rounded-md px-2 py-1.5 text-[10px] ${
                i === 0 ? "bg-white/10 font-medium text-white" : "text-page/50"
              }`}
            >
              {n}
            </div>
          ))}
        </div>
        {/* Content */}
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-medium text-ink-1">Dashboard</span>
            <span className="h-5 w-16 rounded-full bg-panel-2" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-lg border border-border bg-panel-2 p-2.5">
                <p className="text-[8px] font-medium tracking-wide text-ink-3 uppercase">
                  {k.label}
                </p>
                {k.value ? (
                  <p className="mt-1 text-lg font-semibold text-ink-1 tabular-nums">{k.value}</p>
                ) : (
                  <div className="mt-1 flex h-5 items-end gap-0.5">
                    {k.bars!.map((h, i) => (
                      <span
                        key={i}
                        className="flex-1 rounded-sm bg-accent-500/80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            {rows.map((r) => (
              <div
                key={r.action}
                className="flex items-center justify-between border-b border-border px-3 py-2 text-[10px] last:border-b-0"
              >
                <span className="font-medium text-ink-1">{r.action}</span>
                <span className="text-ink-3 tabular-nums">{r.credits} cr</span>
                <span className="text-ink-3">{r.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Grain texture inlined as an SVG data-uri — visible on the dark hero only. */
const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")";

function Home() {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in flex-1">
        {/* ── Hero — pulled up 64px so its glow extends behind the transparent
            sticky header (header is not overlaid; the band reaches the top). ── */}
        <section className="hero-band relative -mt-16 overflow-hidden">
          {/* Soft glows — violet in both themes, stronger on dark. */}
          <div
            aria-hidden="true"
            className="glow pointer-events-none absolute inset-0 bg-[radial-gradient(75%_55%_at_50%_0%,var(--hb-glow-a),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_35%_at_50%_100%,var(--hb-glow-b),transparent_70%)]"
          />
          {/* Grain. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
            style={{ backgroundImage: NOISE_BG }}
          />

          <div className="relative mx-auto max-w-4xl px-4 pt-36 pb-16 text-center sm:pt-44 sm:pb-20">
            <p className="rise hb-panel hb-border hb-ink-2 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium shadow-xs backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-coral-500" />
              {t("home.hero.badge")}
            </p>
            <h1 className="display-type rise stagger-1 hb-ink-1 mt-8 text-5xl font-bold tracking-[-0.03em] sm:text-6xl sm:leading-[1.04] lg:text-7xl">
              {t("home.hero.titleA")}
              <br />
              <span className="bg-gradient-to-r from-[#8b84f7] via-[var(--hb-ink-1)] to-[#8b84f7] bg-clip-text text-transparent dark:from-white dark:via-[#8a8a8a] dark:to-white">
                {t("home.hero.titleB")}
              </span>
            </h1>
            <p className="rise stagger-2 hb-ink-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
              {t("home.hero.subtitle")}
            </p>
            <div className="rise stagger-3 mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/signup"
                className="hb-cta group inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {t("home.hero.getStarted")}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/pricing"
                className="hb-ghost inline-flex h-12 items-center justify-center rounded-full border px-7 text-[15px] font-medium transition-all duration-200 hover:-translate-y-0.5"
              >
                {t("home.hero.viewPricing")}
              </Link>
            </div>

            {/* Avatar stack social proof. */}
            <div className="rise stagger-4 mt-12 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {AVATARS.map((a) => (
                  <span
                    key={a.initials}
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--hb-bg)] text-[10px] font-semibold text-white"
                    style={{ backgroundColor: a.color }}
                  >
                    {a.initials}
                  </span>
                ))}
              </div>
              <p className="hb-ink-3 text-sm">{t("home.hero.socialProof")}</p>
            </div>

            {/* Stats bar. */}
            <dl className="rise stagger-5 hb-panel hb-border mt-14 grid grid-cols-2 divide-x divide-[var(--hb-border)] rounded-2xl border backdrop-blur-sm sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="px-6 py-5">
                  <dd className="hb-ink-1 text-3xl font-bold tracking-tight tabular-nums">
                    {s.value}
                  </dd>
                  <dt className="hb-ink-3 mt-1 text-[11px] tracking-widest uppercase">{s.label}</dt>
                </div>
              ))}
            </dl>

            <p className="rise stagger-6 hb-ink-3 mt-8 text-sm">
              {t("home.hero.haveAccount")}{" "}
              <Link
                to="/login"
                className="hb-ink-1 font-medium underline decoration-[var(--hb-ink-3)] underline-offset-2 transition-colors hover:opacity-80"
              >
                {t("home.hero.login")}
              </Link>
            </p>
          </div>
        </section>

        {/* ── Product visual — real UI, not a mock. A CSS miniature of the
            actual dashboard so the first screen shows the product, in both
            themes. Built from the real KPI tiles / rail / activity table. ── */}
        <section className="relative overflow-hidden pb-20">
          <div className="mx-auto max-w-4xl px-4">
            <DashboardMock />
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section className="border-b border-border bg-panel-2/60">
          <div className="mx-auto max-w-5xl px-4 py-20">
            <div className="reveal mb-12 max-w-xl">
              <p className="text-xs font-semibold tracking-[0.15em] text-accent-700 uppercase">
                Everything included
              </p>
              <h2 className="display-type mt-3 text-3xl font-bold tracking-tight text-ink-1 sm:text-4xl">
                Not a demo — a working SaaS
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-2">
                Auth, billing, credits, API keys, AI playground, file storage, rate limiting,
                transactional email — the plumbing you usually rebuild every project, already done.
              </p>
            </div>
            {/* Bento grid — Auth and Stripe billing take the large cells (they
                carry a UI fragment), the rest are small. Desktop: 6-col bento;
                mobile: single column. */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className={`group rounded-xl border border-border bg-panel p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-md ${
                    f.featured ? "sm:col-span-2 lg:col-span-3" : "lg:col-span-2"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent-600 transition-transform duration-200 group-hover:scale-110">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-ink-1">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{f.description}</p>
                  {f.featured === "auth" && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {["Email/password", "Google OAuth", "GitHub OAuth", "Sessions on D1"].map(
                        (c) => (
                          <span
                            key={c}
                            className="rounded-md bg-panel-2 px-2 py-1 text-[10px] font-medium text-ink-3"
                          >
                            {c}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                  {f.featured === "billing" && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-panel-2 px-3 py-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-[#635bff] text-[10px] font-bold text-white">
                        S
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-ink-1">
                          Checkout → webhook → entitlement
                        </p>
                        <p className="text-[10px] text-ink-3">Signature-verified, deduplicated</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────── */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-20">
            <div className="reveal mb-12 max-w-xl">
              <p className="text-xs font-semibold tracking-[0.15em] text-accent-700 uppercase">
                What users say
              </p>
              <h2 className="display-type mt-3 text-3xl font-bold tracking-tight text-ink-1">
                Built for builders
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-2">
                Sample placeholders — replace these with real customer quotes before publishing, or
                delete the section if there are none yet.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <figure
                  key={t.initials}
                  className="relative flex flex-col rounded-xl border border-dashed border-border-strong bg-panel p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="absolute top-4 right-4 rounded bg-panel-2 px-1.5 py-0.5 text-[9px] font-semibold tracking-widest text-ink-3 uppercase">
                    Sample
                  </span>
                  <blockquote className="flex-1 text-[15px] leading-relaxed text-ink-2">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-700"
                    >
                      {t.initials}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink-1">{t.name}</span>
                      <span className="block text-xs text-ink-3">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── What's included ──────────────────────────────────── */}
        <section className="border-b border-border bg-panel-2/60">
          <div className="reveal mx-auto max-w-5xl px-4 py-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-accent-700 uppercase">
                  The stack
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-1">
                  Everything in one repo
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-2">
                  The SaaS app and the content site share plumbing but deploy independently. One
                  pnpm install, two wrangler configs, no lock-in.
                </p>
                <Link
                  to="/signup"
                  className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-accent-700 transition-colors hover:text-accent-800"
                >
                  Start building <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <ul className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
                {STACK.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                    <span className="text-[15px] leading-relaxed text-ink-2">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Security / ops callout ───────────────────────────── */}
        <section className="border-b border-border">
          <div className="reveal mx-auto max-w-5xl px-4 py-16">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-coral-100 text-coral-600">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink-1">
                  Built to be a template, not a toy
                </h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">
                  API keys are SHA-256 hashed and shown once. Webhooks are signature-verified and
                  deduplicated by event id. Money and credits are integers in minor units. Rate
                  limits degrade gracefully without the Cloudflare binding.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="border-b border-border bg-panel-2/60">
          <div className="mx-auto max-w-3xl px-4 py-20">
            <div className="reveal mb-10 text-center">
              <p className="text-xs font-semibold tracking-[0.15em] text-accent-700 uppercase">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-1">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-base leading-relaxed text-ink-2">
                Honest answers about what this template is — and isn't.
              </p>
            </div>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-border bg-panel shadow-xs transition-shadow duration-200 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-[15px] font-semibold text-ink-1 transition-colors hover:text-accent-700 [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-xl font-light text-ink-3 transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-5 text-[15px] leading-relaxed text-ink-2">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────── */}
        <section className="hero-band relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_100%,var(--hb-glow-a),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
            style={{ backgroundImage: NOISE_BG }}
          />
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center">
            <h2 className="hb-ink-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Start from working code, not a tutorial
            </h2>
            <p className="hb-ink-2 mx-auto mt-4 max-w-xl text-base leading-relaxed">
              The whole SaaS loop — sign up, subscribe, consume credits, manage keys — runs out of
              the box on a free Cloudflare account.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/signup"
                className="hb-cta inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                Create account
              </Link>
              <Link
                to="/pricing"
                className="hb-ghost inline-flex h-12 items-center justify-center rounded-full border px-7 text-[15px] font-medium transition-all duration-200 hover:-translate-y-0.5"
              >
                See pricing
              </Link>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-ink-3">
          <p>Sextant, a Cloudflare-native template.</p>
          <div className="flex items-center gap-5">
            <Link to="/tools" className="transition-colors hover:text-ink-1">
              Free tools
            </Link>
            <Link to="/commits" className="transition-colors hover:text-ink-1">
              Commits
            </Link>
            <Link to="/contact" className="transition-colors hover:text-ink-1">
              Contact
            </Link>
            <Link to="/about" className="transition-colors hover:text-ink-1">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Email capture for launch interest. Posts to /api/waitlist — idempotent on
 * email, so re-subscribing shows the same success state. Rendered inside the
 * dark bottom CTA band, so all controls use the glass-on-dark treatment.
 */
function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "homepage" }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Something went wrong");
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="hb-ink-1 mt-10 text-sm font-medium">You're on the waitlist.</p>;
  }

  return (
    <div className="hb-border mx-auto mt-12 max-w-md border-t pt-10">
      <p className="hb-ink-3 text-sm">Not ready to sign up? Get launch updates instead.</p>
      <form onSubmit={join} className="mt-4 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="hb-ghost h-11 flex-1 rounded-full border bg-transparent px-4 text-sm placeholder:text-[var(--hb-ink-3)] focus:border-[var(--hb-ink-1)] focus:ring-1 focus:ring-[var(--hb-ink-1)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "busy" || !email.trim()}
          className="hb-cta inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-all duration-150 disabled:opacity-50"
        >
          {state === "busy" ? "Joining…" : "Join waitlist"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-down">{error}</p>}
    </div>
  );
}
