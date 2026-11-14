import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Drizzle schema for the SaaS D1 database.
 *
 * The `user`, `session`, `account`, and `verification` tables are the Better
 * Auth core schema (including the admin plugin's extra columns), generated to
 * match `better-auth/adapters/drizzle` with `provider: "sqlite"`. `stripeEvent`
 * is app-specific: it deduplicates incoming Stripe webhooks by event id.
 */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
  role: text("role"),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/**
 * App tables below.
 */

/** One row per user holding the app's own billing/usage state. */
export const entitlement = sqliteTable("entitlement", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  /** Stripe customer id, once a checkout or subscription creates one. */
  stripeCustomerId: text("stripe_customer_id"),
  /** Active Stripe subscription id, if any. */
  stripeSubscriptionId: text("stripe_subscription_id"),
  /** Plan key, e.g. "pro". Null when on the free plan. */
  plan: text("plan"),
  /** Subscription status string reported by Stripe (e.g. "active"). */
  status: text("status").default("free").notNull(),
  /** Usage credits remaining. Integer minor units — 1 credit = 1 unit. */
  credits: integer("credits").default(0).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

/** Deduplication for Stripe webhooks — one row per processed event id. */
export const stripeEvent = sqliteTable("stripe_event", {
  /** Stripe event id (e.g. `evt_...`), used as the dedup key. */
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: integer("processed_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

/**
 * User-generated API keys for Bearer auth against the JSON API.
 *
 * Only the SHA-256 hash of the key is stored — the raw key is returned once at
 * creation and never persisted. `prefix` holds the first 8 characters so the
 * settings UI can label each key without exposing it.
 */
export const apiKey = sqliteTable(
  "api_key",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Human label, e.g. "CI pipeline". */
    name: text("name").notNull(),
    /** SHA-256 hex digest of the raw key — never store the raw key itself. */
    keyHash: text("key_hash").notNull().unique(),
    /** First 8 characters of the raw key (e.g. `sk_live_`), display only. */
    prefix: text("prefix").notNull(),
    lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("api_key_userId_idx").on(table.userId)],
);

/** Audit trail of credit-consuming actions — one row per action. */
export const usageEvent = sqliteTable(
  "usage_event",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** What ran, e.g. "paywalled-action". */
    action: text("action").notNull(),
    /** Credits spent. Integer minor units — 1 credit = 1 unit. */
    creditsUsed: integer("credits_used").notNull(),
    /** JSON blob for extra context (request id, params, …). */
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("usage_event_userId_idx").on(table.userId)],
);

/** Newsletter subscribers — email + opt-in timestamp. */
export const newsletterSubscriber = sqliteTable("newsletter_subscriber", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  confirmedAt: integer("confirmed_at", { mode: "timestamp_ms" }),
  unsubscribedAt: integer("unsubscribed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

/** Waitlist signups — email + optional acquisition source. */
export const waitlistEntry = sqliteTable("waitlist_entry", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  /** Where the signup came from, e.g. "homepage". Null when omitted. */
  source: text("source"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

/**
 * In-app notifications for the bell dropdown. `type` is a free-form label —
 * "info" | "success" | "warning" | "billing" | "system" — that the UI maps to
 * a left-border color. `readAt` doubles as the read flag (null = unread).
 */
export const notification = sqliteTable(
  "notification",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Category label: "info" | "success" | "warning" | "billing" | "system". */
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    readAt: integer("read_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("notification_userId_idx").on(table.userId)],
);

/** User-uploaded files stored in R2. */
export const userFile = sqliteTable(
  "user_file",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Original filename. */
    name: text("name").notNull(),
    /** R2 object key. */
    key: text("key").notNull().unique(),
    /** MIME type. */
    contentType: text("content_type").notNull(),
    /** Size in bytes. */
    sizeBytes: integer("size_bytes").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("user_file_userId_idx").on(table.userId)],
);
