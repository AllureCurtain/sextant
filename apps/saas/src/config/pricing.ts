/**
 * Pricing configuration — the single source of truth for the marketing
 * pricing table and the client-side checkout calls.
 *
 * `stripePriceId` is resolved at runtime from `/api/config` (served from the
 * server env, so the client bundle needs no PUBLIC_* vars); the server side
 * maps the provider price id back to a plan in `src/server/payments/stripe.ts`.
 * When a plan has no `stripePriceId`, its CTA renders as a plain link.
 */

export type PlanInterval = "month" | "year" | "once";

export interface Plan {
  /** Stable id used as React key and for analytics. */
  id: string;
  name: string;
  /** Short tagline shown under the plan name. */
  description: string;
  /** Price in minor units (cents). Never floating point. */
  priceCents: number;
  interval: PlanInterval;
  /** Provider price id sent to /api/checkout. Omit for free/signup-only plans. */
  stripePriceId?: string;
  /** Bullet list rendered on the card. */
  features: string[];
  /** Entitlement numbers — displayed on the card, enforced server-side. */
  limits: {
    credits: number;
    apiKeys: number;
    fileStorageMb: number;
  };
  cta: {
    label: string;
    /** TanStack Router path used when the plan has no stripePriceId. */
    to: string;
  };
}

/** Shape of the price map served by GET /api/config. */
export interface PlanPrices {
  pro: string | null;
  creditPack: string | null;
}

/**
 * Static plan definitions — everything except the provider price id, which is
 * environment-specific. The server reads this to map a checkout's price id back
 * to a plan; the client merges in live price ids from `/api/config`.
 */
const BASE_PLANS: Omit<Plan, "stripePriceId">[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started",
    priceCents: 0,
    interval: "month",
    features: [
      "10 credits on sign-up",
      "2 API keys",
      "100 MB file storage",
      "Core features",
      "Community support",
    ],
    limits: { credits: 10, apiKeys: 2, fileStorageMb: 100 },
    cta: { label: "Sign up free", to: "/signup" },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Most popular",
    priceCents: 1900,
    interval: "month",
    features: [
      "1,000 credits per month",
      "10 API keys",
      "10 GB file storage",
      "All features",
      "Priority support",
    ],
    limits: { credits: 1000, apiKeys: 10, fileStorageMb: 10_240 },
    cta: { label: "Subscribe", to: "/signup" },
  },
  {
    id: "credit-pack",
    name: "Credit pack",
    description: "Top up without a subscription",
    priceCents: 900,
    interval: "once",
    features: [
      "+100 credits on your current plan",
      "Never expires while your account is active",
      "Stacks with any plan",
    ],
    limits: { credits: 100, apiKeys: 0, fileStorageMb: 0 },
    cta: { label: "Buy credits", to: "/signup" },
  },
];

/**
 * Merge the static plans with a price map. `prices` may be the `prices` field
 * from `useAppConfig()`, or a map built on the server from env — either way a
 * null id means "not configured" and that CTA degrades to a plain link.
 *
 * One-time note: `STRIPE_CREDIT_PACK_PRICE_ID` must point to a Stripe
 * *one-time* price (not recurring), because its checkout runs in mode
 * "payment" — recurring prices are rejected there.
 */
export function buildPlans(prices: PlanPrices): Plan[] {
  return BASE_PLANS.map((p) => {
    const stripePriceId =
      p.id === "pro"
        ? (prices.pro ?? undefined)
        : p.id === "credit-pack"
          ? (prices.creditPack ?? undefined)
          : undefined;
    return { ...p, stripePriceId };
  });
}

/** Format a plan price as `$X` (prices are whole-dollar in this template). */
export function formatPlanPrice(plan: Plan): string {
  return `$${(plan.priceCents / 100).toLocaleString("en-US")}`;
}

/** `/mo`, `/yr`, or `one-time` — the suffix rendered next to the price. */
export function intervalLabel(interval: PlanInterval): string {
  switch (interval) {
    case "month":
      return "/mo";
    case "year":
      return "/yr";
    case "once":
      return " one-time";
  }
}
