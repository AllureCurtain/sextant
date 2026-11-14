import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import { SiteHeader } from "#/components/site-header";
import { buildPlans, formatPlanPrice, intervalLabel, type Plan } from "#/config/pricing";
import { useAppConfig } from "#/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";

export const Route = createFileRoute("/pricing")({ component: Pricing });

const PRICING_FAQ = [
  {
    q: "Is this a subscription?",
    a: "Pro is a monthly Stripe subscription in test mode; the credit pack is a one-time payment. For a real deployment you can swap price IDs or intervals — the checkout and webhook plumbing stays the same.",
  },
  {
    q: "Can I get a refund?",
    a: "The template never charges a real card — Stripe runs in test mode, so there is nothing to refund. If you take it live, refunds are handled from your own Stripe dashboard; the billing portal link is already wired for customers to self-serve cancellations.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Whatever Stripe Checkout supports for your account: cards, Apple Pay, Google Pay, and local payment methods. In test mode, use Stripe's 4242 test card — no real money moves.",
  },
  {
    q: "Do I own the code?",
    a: "Yes. Sextant is MIT licensed. Fork it, rename it, ship it as your own product — no attribution required, no licensing fees. Third-party dependencies keep their own permissive licenses; see THIRD_PARTY_NOTICES.md.",
  },
];

function Pricing() {
  const { data: session } = authClient.useSession();
  const { data: config } = useAppConfig();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Merge the static plan copy with the live Stripe price ids the server
  // resolved from its env — no PUBLIC_* vars needed in the client bundle.
  const plans = buildPlans(config?.prices ?? { pro: null, creditPack: null });

  async function checkout(plan: Plan) {
    setError(null);
    if (!session) {
      navigate({ to: "/signup" });
      return;
    }
    if (!plan.stripePriceId) {
      navigate({ to: plan.cta.to });
      return;
    }
    setLoadingPlan(plan.id);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.stripePriceId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoadingPlan(null);
    }
  }

  const [subscriptionPlans, oneTimePlans] = [
    plans.filter((p) => p.interval !== "once"),
    plans.filter((p) => p.interval === "once"),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in flex-1">
        {/* ── Hero band ──────────────────────────────────────── */}
        <section className="hero-band relative -mt-16 overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,var(--hb-glow-a),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_100%,var(--hb-glow-b),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-4xl px-4 pt-32 pb-14 text-center sm:pt-36">
            <p className="rise hb-panel hb-border hb-ink-2 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
              Test mode — no real charges
            </p>
            <h1 className="rise stagger-1 hb-ink-1 mt-6 text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Simple, honest pricing
            </h1>
            <p className="rise stagger-2 hb-ink-2 mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              Start free with 10 credits. Upgrade when you need more — or top up once with the
              credit pack.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-4xl px-4 py-16">
          <div className="grid max-w-2xl items-start gap-6 sm:grid-cols-2 mx-auto">
            {subscriptionPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                highlighted={plan.id === "pro"}
                loading={loadingPlan === plan.id}
                loggedIn={Boolean(session)}
                onCheckout={() => checkout(plan)}
              />
            ))}
          </div>

          {/* ── One-time credits ─────────────────────────────────── */}
          {oneTimePlans.length > 0 && (
            <div className="mx-auto mt-8 max-w-2xl">
              <h2 className="text-center text-sm font-medium tracking-wide text-ink-3 uppercase">
                One-time credits
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-1">
                {oneTimePlans.map((plan) => (
                  <CreditPackCard
                    key={plan.id}
                    plan={plan}
                    loading={loadingPlan === plan.id}
                    loggedIn={Boolean(session)}
                    onCheckout={() => checkout(plan)}
                  />
                ))}
              </div>
            </div>
          )}
          {error && <p className="mt-4 text-center text-sm text-down">{error}</p>}

          {/* ── Pricing FAQ ──────────────────────────────────────── */}
          <section className="mx-auto mt-20 max-w-2xl">
            <h2 className="text-center text-xl font-semibold tracking-tight text-ink-1">
              Pricing questions
            </h2>
            <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-panel shadow-xs">
              {PRICING_FAQ.map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink-1 [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-ink-3 transition-transform duration-150 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

interface PlanCardProps {
  plan: Plan;
  highlighted?: boolean;
  loading: boolean;
  loggedIn: boolean;
  onCheckout: () => void;
}

function PlanCard({ plan, highlighted, loading, loggedIn, onCheckout }: PlanCardProps) {
  const paid = Boolean(plan.stripePriceId);
  return (
    <Card
      className={
        highlighted
          ? "relative border-accent-600/60 shadow-md ring-1 ring-accent-600/20"
          : undefined
      }
    >
      {highlighted && (
        <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-accent-600 px-2.5 py-0.5 text-xs font-medium text-on-accent shadow-xs">
          Most popular
        </span>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight text-ink-1 tabular-nums">
          {formatPlanPrice(plan)}
          <span className="text-base font-normal text-ink-3">{intervalLabel(plan.interval)}</span>
        </p>
        <ul className="mt-5 space-y-2.5 text-sm text-ink-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <Check className="h-4 w-4 shrink-0 text-accent-600" /> {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {paid ? (
          <Button variant="primary" className="w-full" onClick={onCheckout} disabled={loading}>
            {loading
              ? "Redirecting…"
              : loggedIn
                ? plan.cta.label
                : `Sign up & ${plan.cta.label.toLowerCase()}`}
          </Button>
        ) : (
          <Link
            to={plan.cta.to}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border-strong bg-panel px-4 text-sm font-medium text-ink-1 shadow-xs transition-all duration-150 hover:border-ink-3 hover:bg-panel-2"
          >
            {plan.cta.label}
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

/** Smaller horizontal card for one-time purchases (e.g. credit packs). */
function CreditPackCard({ plan, loading, loggedIn, onCheckout }: PlanCardProps) {
  const paid = Boolean(plan.stripePriceId);
  return (
    <Card>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-ink-1">{plan.name}</h3>
            <p className="text-sm text-ink-3">{plan.description}</p>
          </div>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-ink-1 tabular-nums">
            {formatPlanPrice(plan)}
            <span className="text-sm font-normal text-ink-3">{intervalLabel(plan.interval)}</span>
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-accent-600" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="shrink-0 sm:self-center">
          {paid ? (
            <Button variant="outline" onClick={onCheckout} disabled={loading}>
              {loading ? "Redirecting…" : loggedIn ? plan.cta.label : `Sign up & buy`}
            </Button>
          ) : (
            <Link
              to={plan.cta.to}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border-strong bg-panel px-4 text-sm font-medium text-ink-1 shadow-xs transition-all duration-150 hover:border-ink-3 hover:bg-panel-2"
            >
              {plan.cta.label}
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
