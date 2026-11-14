import { Hono } from "hono";
import type { Context } from "hono";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getAuth } from "./auth";
import { getDb } from "./db";
import { sendReceiptEmail } from "./emails";
import { getEnv } from "./env";
import { getProvider, WebhookVerificationError } from "./payments";
import type { NormalizedPaymentEvent } from "./payments";
import { getNewsletterProvider } from "./newsletter";
import { getAnalytics } from "./analytics";
import { consumeCredits, getOrCreateEntitlement, grantCredits } from "./entitlements";
import { buildPlans } from "../config/pricing";
import { rateLimit } from "./rate-limit";
import {
  apiKey,
  entitlement,
  notification,
  stripeEvent,
  usageEvent,
  user,
  userFile,
  waitlistEntry,
} from "../db/schema";
import {
  chatRequestSchema,
  checkoutRequestSchema,
  createKeyRequestSchema,
  editImageRequestSchema,
  imageRequestSchema,
  summarizeRequestSchema,
  translateRequestSchema,
} from "./api";
import type { Env } from "./env";

/**
 * Hono app for the SaaS API.
 *
 * Mounted in the custom server entry (`src/server-entry.ts`):
 *   - `/api/auth/*`    → Better Auth handler (sign-up, sign-in, OAuth, sessions)
 *   - `/api/webhooks/stripe` → Stripe webhook (raw body, signature verified)
 *   - `/api/*`         → the app's own JSON API (see api.ts routes table)
 *
 * Everything else falls through to the TanStack Start SSR handler.
 */

type Bindings = { Bindings: Env };
const app = new Hono<Bindings>();

// ── Rate limiting ───────────────────────────────────────────────────────────
// Abuse-prone endpoints get a per-IP cap. In production this also consults the
// Cloudflare Rate Limiting binding; in dev an in-memory sliding window
// enforces the same policy (see src/server/rate-limit.ts).

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}

async function limitOrReply(c: Context, key: string, limit: number, windowMs: number) {
  const retryAfter = await rateLimit(key, limit, windowMs);
  if (retryAfter === null) return null;
  return c.json({ error: "rate limit exceeded" }, 429, { "Retry-After": String(retryAfter) });
}

/**
 * Per-endpoint policies: first match wins. Limits are keyed by client IP —
 * auth endpoints have no session yet, and for the rest IP is the cheapest
 * abuse dimension (per-user limits on top would defeat the point for free
 * accounts sharing an IP is rare enough to accept).
 */
const RATE_LIMIT_RULES: Array<{
  match: (path: string) => boolean;
  key: string;
  limit: number;
  windowMs: number;
}> = [
  { match: (p) => p.startsWith("/api/auth/"), key: "auth", limit: 30, windowMs: 60_000 },
  {
    match: (p) => p === "/api/keys" || p.startsWith("/api/keys/"),
    key: "keys",
    limit: 20,
    windowMs: 60_000,
  },
  { match: (p) => p === "/api/credits/consume", key: "credits", limit: 10, windowMs: 60_000 },
  { match: (p) => p.startsWith("/api/ai/"), key: "ai", limit: 20, windowMs: 60_000 },
  { match: (p) => p === "/api/waitlist", key: "waitlist", limit: 10, windowMs: 60_000 },
  { match: (p) => p.startsWith("/api/cache/"), key: "cache", limit: 30, windowMs: 60_000 },
  {
    match: (p) => p === "/api/notifications" || p.startsWith("/api/notifications/"),
    key: "notifications",
    limit: 30,
    windowMs: 60_000,
  },
];

app.use("/api/*", async (c, next) => {
  const path = new URL(c.req.raw.url).pathname;
  const rule = RATE_LIMIT_RULES.find((r) => r.match(path));
  if (rule) {
    const res = await limitOrReply(
      c,
      `${rule.key}:${clientIp(c.req.raw)}`,
      rule.limit,
      rule.windowMs,
    );
    if (res) return res;
  }
  await next();
});

// ── Auth (Better Auth) ────────────────────────────────────────────────────
// Better Auth owns every method under /api/auth/*. We mount it with `on` so
// GET (session fetch, OAuth callbacks) and POST (sign-up, sign-in, sign-out)
// all reach the same handler.
app.on(["GET", "POST"], "/api/auth/*", (c) => getAuth().handler(c.req.raw));

// ── Helpers ────────────────────────────────────────────────────────────────

async function requireUser(request: Request) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  return session;
}

function isAdmin(session: Awaited<ReturnType<typeof requireUser>>): boolean {
  if (!session) return false;
  const role = (session.user as { role?: string | null }).role ?? "";
  return role.split(",").includes("admin");
}

/**
 * Insert an in-app notification for a user. Fire-and-forget safe: callers may
 * `void` the promise — failures are logged, never surfaced to the request.
 */
async function notify(
  userId: string,
  type: "info" | "success" | "warning" | "billing" | "system",
  title: string,
  body?: string,
) {
  await getDb()
    .insert(notification)
    .values({ id: crypto.randomUUID(), userId, type, title, body: body ?? null });
}

/** Fire-and-forget wrapper — notification writes never fail the request. */
function notifyLater(
  userId: string,
  type: "info" | "success" | "warning" | "billing" | "system",
  title: string,
  body?: string,
) {
  void notify(userId, type, title, body).catch((err) =>
    console.error("notification insert failed", err),
  );
}

/**
 * Fire-and-forget analytics event — resolves the provider once per call and
 * never throws into the request path.
 */
function track(
  name: string,
  opts?: { userId?: string; props?: Record<string, string | number | boolean | undefined> },
) {
  Promise.resolve(
    getAnalytics().trackEvent({ name, userId: opts?.userId, props: opts?.props }),
  ).catch((err) => console.error("[analytics] trackEvent failed", err));
}

// ── API keys ───────────────────────────────────────────────────────────────
// Keys look like `sk_live_` + 32 hex chars. Only the SHA-256 hash is stored;
// the raw key is returned exactly once at creation.

const API_KEY_PREFIX = "sk_live_";

async function hashApiKey(raw: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateApiKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return API_KEY_PREFIX + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify `Authorization: Bearer sk_live_…`. Returns the owning user id, or null
 * when the header is missing/malformed, the key is unknown, or it was revoked.
 * A valid lookup also bumps `lastUsedAt`.
 */
async function verifyApiKey(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const raw = header.slice("Bearer ".length).trim();
  if (!raw.startsWith(API_KEY_PREFIX)) return null;

  const db = getDb();
  const row = await db.query.apiKey.findFirst({ where: eq(apiKey.keyHash, await hashApiKey(raw)) });
  if (!row || row.revokedAt) return null;

  await db.update(apiKey).set({ lastUsedAt: new Date() }).where(eq(apiKey.id, row.id));
  return row.userId;
}

// ── JSON API ───────────────────────────────────────────────────────────────

app.get("/api/session", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  return c.json({ user: session.user, isAdmin: isAdmin(session) });
});

// Public runtime config — which optional integrations are actually configured.
// Cached in KV for 60s when the binding is present.
app.get("/api/config", async (c) => {
  const env = getEnv();
  if (env.KV) {
    const cached = await env.KV.get("config");
    if (cached) return c.json(JSON.parse(cached));
  }
  const config = {
    googleOAuth: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    githubOAuth: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    stripe: Boolean(env.STRIPE_SECRET_KEY),
    resend: Boolean(env.RESEND_API_KEY),
    // Public (not a secret): Crisp puts the website id in the page anyway.
    crisp: env.CRISP_WEBSITE_ID ?? null,
    // Stripe price ids are public — they're sent to /api/checkout by the client
    // and matched back to plans in `payments/stripe.ts`. Served from the server
    // env so the client doesn't need PUBLIC_* vars baked into its bundle.
    prices: {
      pro: env.STRIPE_PRICE_ID ?? null,
      creditPack: env.STRIPE_CREDIT_PACK_PRICE_ID ?? null,
    },
  };
  if (env.KV) {
    await env.KV.put("config", JSON.stringify(config), { expirationTtl: 60 });
  }
  return c.json(config);
});

// ── Cache demo (KV) ────────────────────────────────────────────────────────
// Session-required demo endpoints over the KV binding. Returns 503 when the
// namespace isn't bound (e.g. a fresh clone before wrangler.jsonc applies).

app.get("/api/cache/:key", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const kv = getEnv().KV;
  if (!kv) return c.json({ error: "KV binding not configured" }, 503);

  const value = await kv.get(c.req.param("key"));
  return c.json({ value });
});

app.put("/api/cache/:key", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const kv = getEnv().KV;
  if (!kv) return c.json({ error: "KV binding not configured" }, 503);

  const body = await c.req.json().catch(() => null);
  const value = body?.value;
  if (typeof value !== "string") return c.json({ error: "invalid request" }, 400);

  await kv.put(c.req.param("key"), value);
  return c.json({ ok: true });
});

app.get("/api/entitlement", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);
  const row = await getOrCreateEntitlement(session.user.id);
  return c.json({
    plan: row.plan,
    status: row.status,
    credits: row.credits,
    stripeCustomerId: row.stripeCustomerId,
  });
});

app.post("/api/checkout", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const body = await c.req.json().catch(() => null);
  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);

  const env = getEnv();
  const payments = getProvider();
  const entitlementRow = await getOrCreateEntitlement(session.user.id);
  const priceId = parsed.data.priceId ?? env.STRIPE_PRICE_ID;

  // The request may set `mode` explicitly; otherwise infer it from the pricing
  // config — a plan with interval "once" (the credit pack) runs a payment-mode
  // checkout even if the client did not send `mode`.
  let mode = parsed.data.mode;
  if (!mode) {
    const plans = buildPlans({
      pro: env.STRIPE_PRICE_ID ?? null,
      creditPack: env.STRIPE_CREDIT_PACK_PRICE_ID ?? null,
    });
    const plan = plans.find((p) => p.stripePriceId === priceId);
    mode = plan?.interval === "once" ? "payment" : "subscription";
  }

  // Reuse the provider customer if we already created one for this user.
  let customerId = entitlementRow.stripeCustomerId;
  if (!customerId) {
    const ref = await payments.createCustomer({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });
    customerId = ref.customerId;
    await getDb()
      .update(entitlement)
      .set({ stripeCustomerId: customerId })
      .where(eq(entitlement.userId, session.user.id));
  }

  const checkout = await payments.createCheckout({
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    priceId,
    mode,
    customerId,
    successUrl: `${env.PUBLIC_SITE_URL}/dashboard?checkout=success`,
    cancelUrl: `${env.PUBLIC_SITE_URL}/pricing?checkout=cancelled`,
  });

  return c.json({ url: checkout.url });
});

app.post("/api/billing-portal", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const env = getEnv();
  const payments = getProvider();
  const row = await getOrCreateEntitlement(session.user.id);
  if (!row.stripeCustomerId) return c.json({ error: "no billing account" }, 400);

  const portal = await payments.createPortal({
    customerId: row.stripeCustomerId,
    returnUrl: `${env.PUBLIC_SITE_URL}/dashboard`,
  });
  return c.json({ url: portal.url });
});

// The sample paywalled action: consumes 1 credit. Accepts either a session
// cookie (dashboard button) or `Authorization: Bearer sk_live_…` (API key).
app.post("/api/credits/consume", async (c) => {
  let userId = await verifyApiKey(c.req.raw);
  if (!userId) {
    const session = await requireUser(c.req.raw);
    userId = session?.user.id ?? null;
  }
  if (!userId) return c.json({ error: "unauthorized" }, 401);

  const result = await consumeCredits(userId, 1);
  if (!result.ok) {
    return c.json({ error: "insufficient credits", credits: result.credits }, 402);
  }

  await getDb()
    .insert(usageEvent)
    .values({ id: crypto.randomUUID(), userId, action: "paywalled-action", creditsUsed: 1 });

  track("credits.consume", {
    userId,
    props: { action: "paywalled-action", remaining: result.credits },
  });
  if (result.credits === 0) {
    notifyLater(
      userId,
      "warning",
      "Credits exhausted",
      "You've used all your credits. Upgrade to keep going.",
    );
  }

  return c.json({ ok: true, credits: result.credits });
});

// ── API keys ────────────────────────────────────────────────────────────────
// Session-only management endpoints. Raw keys are never stored — the hash is —
// and never returned after creation.

app.post("/api/keys", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const body = await c.req.json().catch(() => null);
  const parsed = createKeyRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);

  const raw = generateApiKey();
  const id = crypto.randomUUID();
  const db = getDb();
  await db.insert(apiKey).values({
    id,
    userId: session.user.id,
    name: parsed.data.name,
    keyHash: await hashApiKey(raw),
    prefix: raw.slice(0, 8),
  });

  const row = await db.query.apiKey.findFirst({ where: eq(apiKey.id, id) });

  track("key.create", { userId: session.user.id });
  notifyLater(
    session.user.id,
    "success",
    "API key created",
    "Store it safely — we won't show it again.",
  );

  return c.json(
    {
      id,
      name: parsed.data.name,
      key: raw, // shown once — never stored, never returned again
      prefix: raw.slice(0, 8),
      createdAt: row?.createdAt instanceof Date ? row.createdAt.getTime() : Date.now(),
    },
    201,
  );
});

app.get("/api/keys", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const rows = await getDb()
    .select({
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
      revokedAt: apiKey.revokedAt,
    })
    .from(apiKey)
    .where(eq(apiKey.userId, session.user.id))
    .orderBy(desc(apiKey.createdAt));

  return c.json({
    keys: rows.map((k) => ({
      ...k,
      lastUsedAt: k.lastUsedAt instanceof Date ? k.lastUsedAt.getTime() : null,
      createdAt: k.createdAt instanceof Date ? k.createdAt.getTime() : Number(k.createdAt),
      revokedAt: k.revokedAt instanceof Date ? k.revokedAt.getTime() : null,
    })),
  });
});

app.delete("/api/keys/:id", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const db = getDb();
  const row = await db.query.apiKey.findFirst({
    where: and(eq(apiKey.id, c.req.param("id")), eq(apiKey.userId, session.user.id)),
  });
  if (!row) return c.json({ error: "not found" }, 404);
  if (row.revokedAt) return c.json({ ok: true }); // already revoked — idempotent

  await db.update(apiKey).set({ revokedAt: new Date() }).where(eq(apiKey.id, row.id));
  return c.json({ ok: true });
});

app.get("/api/usage", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const rows = await getDb()
    .select({
      id: usageEvent.id,
      action: usageEvent.action,
      creditsUsed: usageEvent.creditsUsed,
      metadata: usageEvent.metadata,
      createdAt: usageEvent.createdAt,
    })
    .from(usageEvent)
    .where(eq(usageEvent.userId, session.user.id))
    .orderBy(desc(usageEvent.createdAt))
    .limit(50);

  return c.json({
    events: rows.map((e) => ({
      ...e,
      createdAt: e.createdAt instanceof Date ? e.createdAt.getTime() : Number(e.createdAt),
    })),
  });
});

// ── Notifications ─────────────────────────────────────────────────────────
// In-app notifications shown in the topbar bell. Session-only.

app.get("/api/notifications", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const rows = await getDb()
    .select()
    .from(notification)
    .where(eq(notification.userId, session.user.id))
    .orderBy(desc(notification.createdAt))
    .limit(50);

  const notifications = rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    readAt: n.readAt instanceof Date ? n.readAt.getTime() : n.readAt ? Number(n.readAt) : null,
    createdAt: n.createdAt instanceof Date ? n.createdAt.getTime() : Number(n.createdAt),
  }));

  return c.json({
    notifications,
    unreadCount: notifications.filter((n) => n.readAt === null).length,
  });
});

app.post("/api/notifications/:id/read", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const db = getDb();
  const row = await db.query.notification.findFirst({
    where: and(eq(notification.id, c.req.param("id")), eq(notification.userId, session.user.id)),
  });
  if (!row) return c.json({ error: "not found" }, 404);
  if (row.readAt) return c.json({ ok: true }); // already read — idempotent

  await db.update(notification).set({ readAt: new Date() }).where(eq(notification.id, row.id));
  return c.json({ ok: true });
});

app.post("/api/notifications/read-all", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  await getDb()
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.userId, session.user.id), isNull(notification.readAt)));
  return c.json({ ok: true });
});

// ── Admin ─────────────────────────────────────────────────────────────────

app.get("/api/admin/users", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!isAdmin(session)) return c.json({ error: "forbidden" }, 403);

  const db = getDb();
  const users = await db.select().from(user);
  const entitlements = await db.select().from(entitlement);
  const byUser = new Map(entitlements.map((row) => [row.userId, row]));

  const rows = users.map((u) => {
    const ent = byUser.get(u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role ?? null,
      banned: u.banned ?? false,
      plan: ent?.plan ?? null,
      credits: ent?.credits ?? 0,
      createdAt: u.createdAt instanceof Date ? u.createdAt.getTime() : Number(u.createdAt),
    };
  });
  return c.json({ users: rows });
});

// ── Payment webhook ────────────────────────────────────────────────────────
// Raw body required for signature verification — the provider reads it before
// any JSON parse. The provider normalizes the event; the handler translates it
// into one entitlement change and dedups by provider event id.
app.post("/api/webhooks/stripe", async (c) => {
  const provider = getProvider();
  const db = getDb();

  let event;
  try {
    event = await provider.handleWebhook(c.req.raw);
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return c.json({ error: "invalid signature" }, 400);
    }
    throw err;
  }

  // Deduplicate by provider event id — providers retry webhooks.
  const seen = await db.query.stripeEvent.findFirst({ where: eq(stripeEvent.id, event.id) });
  if (seen) return c.json({ received: true, deduplicated: true });

  try {
    await handlePaymentEvent(event);
    await db.insert(stripeEvent).values({ id: event.id, type: event.type });
  } catch {
    // Return 500 so the provider retries; the event row is only written on success.
    console.error("payment webhook handling failed", { type: event.type, id: event.id });
    return c.json({ error: "handler failed" }, 500);
  }

  return c.json({ received: true });
});

/**
 * Translate a normalized provider event into exactly one internal entitlement
 * change. Unhandled event types are a no-op but still recorded as processed.
 */
async function handlePaymentEvent(event: NormalizedPaymentEvent) {
  const userId = event.userId;
  if (!userId) return;

  if (event.type === "customer.subscription.deleted") {
    await applyEntitlement(userId, { plan: null, status: event.status ?? "canceled" });
    return;
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created"
  ) {
    // One-time checkouts (mode "payment") carry no subscription/plan — they
    // only grant credits below, and must not reset the user's plan.
    const isOneTimePayment = event.type === "checkout.session.completed" && !event.subscriptionId;
    if (isOneTimePayment) {
      await applyEntitlement(userId, {
        stripeCustomerId: event.customerId ?? null,
      });
    } else {
      await applyEntitlement(userId, {
        stripeCustomerId: event.customerId ?? null,
        stripeSubscriptionId: event.subscriptionId ?? null,
        plan: event.plan ?? null,
        status: event.status ?? "free",
      });
    }
  }

  if (event.credits) {
    await grantCredits(userId, event.credits);
  }

  if (event.receipt) {
    const db = getDb();
    const userRow = await db.query.user.findFirst({ where: eq(user.id, userId) });
    if (userRow?.email) {
      sendReceiptEmail(userRow.email, {
        name: userRow.name,
        amountCents: event.receipt.amountCents,
        currency: event.receipt.currency,
        planName: event.receipt.planName,
      });
    }
  }
}

async function applyEntitlement(
  userId: string,
  patch: Partial<{
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    plan: string | null;
    status: string;
  }>,
) {
  const db = getDb();
  await getOrCreateEntitlement(userId);
  await db.update(entitlement).set(patch).where(eq(entitlement.userId, userId));
}

// ── Newsletter ─────────────────────────────────────────────────────────────

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post("/api/newsletter/subscribe", async (c) => {
  const body = await c.req.json().catch(() => null);
  const email = body?.email;
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return c.json({ error: "invalid email" }, 400);
  }

  const provider = getNewsletterProvider();
  const source = typeof body?.source === "string" ? body.source.slice(0, 64) : undefined;
  await provider.subscribe({ email, source });
  return c.json({ ok: true });
});

// ── Waitlist ───────────────────────────────────────────────────────────────
// Public email capture for launch interest. Idempotent on email — rejoining
// returns the same success shape without touching the row.

app.post("/api/waitlist", async (c) => {
  const body = await c.req.json().catch(() => null);
  const email = body?.email;
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return c.json({ error: "invalid email" }, 400);
  }
  const source = typeof body?.source === "string" ? body.source.slice(0, 64) : null;

  const db = getDb();
  const existing = await db.query.waitlistEntry.findFirst({
    where: eq(waitlistEntry.email, email),
  });
  if (existing) return c.json({ ok: true }); // idempotent

  await db.insert(waitlistEntry).values({ id: crypto.randomUUID(), email, source });
  return c.json({ ok: true }, 201);
});

app.post("/api/newsletter/unsubscribe", async (c) => {
  const body = await c.req.json().catch(() => null);
  const email = body?.email;
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return c.json({ error: "invalid email" }, 400);
  }

  const provider = getNewsletterProvider();
  const result = await provider.unsubscribe({ email });
  if (!result.ok) return c.json({ error: "not found" }, 404);
  return c.json({ ok: true });
});

// ── File storage (R2) ──────────────────────────────────────────────────────

app.post("/api/files/upload", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const form = await c.req.formData();
  const file = form.get("file") as File | null;
  if (!file) return c.json({ error: "no file" }, 400);
  if (file.size > 10 * 1024 * 1024) return c.json({ error: "file too large (10 MB max)" }, 400);

  const env = getEnv();
  const key = `${session.user.id}/${crypto.randomUUID()}/${file.name}`;
  await env.BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(userFile).values({
    id,
    userId: session.user.id,
    name: file.name,
    key,
    contentType: file.type,
    sizeBytes: file.size,
  });

  track("file.upload", { userId: session.user.id, props: { contentType: file.type } });

  return c.json({ id, name: file.name, sizeBytes: file.size }, 201);
});

app.get("/api/files", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const rows = await getDb()
    .select()
    .from(userFile)
    .where(eq(userFile.userId, session.user.id))
    .orderBy(desc(userFile.createdAt))
    .limit(100);

  return c.json({
    files: rows.map((f) => ({
      id: f.id,
      name: f.name,
      contentType: f.contentType,
      sizeBytes: f.sizeBytes,
      createdAt: f.createdAt instanceof Date ? f.createdAt.getTime() : Number(f.createdAt),
    })),
  });
});

app.get("/api/files/:id/download", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const db = getDb();
  const row = await db.query.userFile.findFirst({
    where: and(eq(userFile.id, c.req.param("id")), eq(userFile.userId, session.user.id)),
  });
  if (!row) return c.json({ error: "not found" }, 404);

  const env = getEnv();
  const object = await env.BUCKET.get(row.key);
  if (!object) return c.json({ error: "file missing" }, 404);

  const headers = new Headers();
  headers.set("Content-Type", row.contentType);
  headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(row.name)}"`);
  headers.set("ETag", object.httpEtag);
  return new Response(object.body, { headers });
});

app.delete("/api/files/:id", async (c) => {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const db = getDb();
  const row = await db.query.userFile.findFirst({
    where: and(eq(userFile.id, c.req.param("id")), eq(userFile.userId, session.user.id)),
  });
  if (!row) return c.json({ error: "not found" }, 404);

  const env = getEnv();
  await env.BUCKET.delete(row.key);
  await db.delete(userFile).where(eq(userFile.id, row.id));
  return c.json({ ok: true });
});

// ── AI playground (Workers AI) ─────────────────────────────────────────────
// Each endpoint consumes 1 credit and records a usage_event. The `Ai` binding
// is optional: when absent (e.g. a fresh dev clone without wrangler.jsonc
// changes applied) handlers return 503 instead of a cryptic TypeError.

type AiRun = (model: string, inputs: Record<string, unknown>) => Promise<unknown>;

function aiBinding(): AiRun | null {
  const ai = getEnv().AI;
  if (!ai || typeof ai.run !== "function") return null;
  return (model, inputs) => ai.run(model, inputs);
}

/**
 * Shared flow for /api/ai/*: require session → charge 1 credit → run model →
 * record usage. `action` is the usage_event label; `model` is the Workers AI
 * model id for analytics; `run` shapes the response.
 */
async function runAiEndpoint(
  c: Context,
  action: string,
  model: string,
  run: (ai: AiRun) => Promise<Record<string, unknown>>,
) {
  const session = await requireUser(c.req.raw);
  if (!session) return c.json({ error: "unauthorized" }, 401);

  const ai = aiBinding();
  if (!ai) return c.json({ error: "AI binding not configured" }, 503);

  const charged = await consumeCredits(session.user.id, 1);
  if (!charged.ok) {
    return c.json({ error: "insufficient credits", credits: charged.credits }, 402);
  }

  try {
    const payload = await run(ai);
    await getDb()
      .insert(usageEvent)
      .values({ id: crypto.randomUUID(), userId: session.user.id, action, creditsUsed: 1 });
    track("ai.call", { userId: session.user.id, props: { model, action } });
    if (charged.credits === 0) {
      notifyLater(
        session.user.id,
        "warning",
        "Credits exhausted",
        "You've used all your credits. Upgrade to keep going.",
      );
    }
    return c.json(payload);
  } catch (err) {
    // Refund on model failure so users don't pay for errors.
    await grantCredits(session.user.id, 1);
    console.error(`AI endpoint ${action} failed`, err);
    return c.json({ error: "AI request failed" }, 500);
  }
}

app.post("/api/ai/summarize", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = summarizeRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);
  const text = parsed.data.text;

  return runAiEndpoint(c, "ai-summarize", "@cf/meta/llama-3.2-3b-instruct", async (ai) => {
    // No dedicated summarization model on Workers AI — use an instruct LLM
    // with a fixed summarization prompt.
    const out = (await ai("@cf/meta/llama-3.2-3b-instruct", {
      messages: [
        {
          role: "user",
          content: `Summarize the following text in 1-2 concise sentences.\n\n${text}`,
        },
      ],
    })) as { response?: string };
    return { summary: out.response ?? "" };
  });
});

app.post("/api/ai/translate", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = translateRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);
  const { text, targetLang } = parsed.data;

  return runAiEndpoint(c, "ai-translate", "@cf/meta/m2m100-1.2b", async (ai) => {
    const out = (await ai("@cf/meta/m2m100-1.2b", { text, target_lang: targetLang })) as {
      translated_text?: string;
    };
    return { translated: out.translated_text ?? "" };
  });
});

app.post("/api/ai/chat", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);
  const messages = parsed.data.messages;

  return runAiEndpoint(c, "ai-chat", "@cf/meta/llama-3.2-3b-instruct", async (ai) => {
    const out = (await ai("@cf/meta/llama-3.2-3b-instruct", { messages })) as {
      response?: string;
    };
    return { response: out.response ?? "" };
  });
});

app.post("/api/ai/image", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = imageRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);
  const { prompt } = parsed.data;

  return runAiEndpoint(c, "ai-image", "@cf/black-forest-labs/flux-1-schnell", async (ai) => {
    // flux-1-schnell returns { image: "<base64>" } for PNG bytes.
    const out = (await ai("@cf/black-forest-labs/flux-1-schnell", { prompt })) as {
      image?: string;
    };
    const b64 = out.image ?? "";
    return { image: b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}` };
  });
});

app.post("/api/ai/edit-image", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = editImageRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);
  const { image, prompt } = parsed.data;

  // Decode the base64 data URI ("data:<mime>;base64,<data>") into raw bytes.
  // For img2img, flux-1-schnell accepts `image` as an array of byte values.
  const comma = image.indexOf(",");
  const b64Payload = comma === -1 ? image : image.slice(comma + 1);
  let bytes: Uint8Array;
  try {
    const bin = atob(b64Payload);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } catch {
    return c.json({ error: "invalid image data" }, 400);
  }

  return runAiEndpoint(c, "ai-edit-image", "@cf/black-forest-labs/flux-1-schnell", async (ai) => {
    const out = (await ai("@cf/black-forest-labs/flux-1-schnell", {
      prompt,
      image: Array.from(bytes),
    })) as { image?: string };
    const b64 = out.image ?? "";
    return { image: b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}` };
  });
});

export default app;
export type { Env };
