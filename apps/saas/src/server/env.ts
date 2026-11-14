/**
 * Typed access to the Worker environment (bindings + secrets).
 *
 * In TanStack Start server functions and the Hono API, Cloudflare bindings are
 * reached via `import { env } from "cloudflare:workers"`. This module types that
 * import once so the rest of the server code gets autocompletion and a single
 * place to document each variable.
 */

import { env } from "cloudflare:workers";

export interface Env {
  /** D1 database binding (configured in wrangler.jsonc). */
  DB: D1Database;
  /** R2 bucket for user file storage. */
  BUCKET: R2Bucket;
  /** Cloudflare Rate Limiting binding (optional — see wrangler.jsonc). */
  RATE_LIMITER?: RateLimit;
  /** Cloudflare Workers AI binding (optional — see wrangler.jsonc). */
  AI?: Ai;
  /** Workers KV namespace for cache/demo endpoints (optional — see wrangler.jsonc). */
  KV?: KVNamespace;
  /** Analytics Engine dataset for server-side event tracking (optional — see wrangler.jsonc). */
  ANALYTICS_ENGINE?: AnalyticsEngineDataset;

  // Secrets / vars — see .dev.vars.example
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  /** GitHub OAuth app credentials (optional — enables "Continue with GitHub"). */
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  /** Set to "true" to require email verification before sign-in (default off). */
  REQUIRE_EMAIL_VERIFICATION?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_ID: string;
  /** One-time price id for the credit pack (must be a non-recurring price). */
  STRIPE_CREDIT_PACK_PRICE_ID?: string;
  RESEND_API_KEY: string;
  PUBLIC_SITE_URL: string;

  /** Active payment provider for the payments abstraction (default "stripe"). */
  PAYMENT_PROVIDER?: string;

  /**
   * Active newsletter provider for the newsletter abstraction. "local" (the
   * default) keeps subscribers in D1 only; "resend", "beehiiv", and
   * "mailcheap" additionally sync to the provider.
   */
  NEWSLETTER_PROVIDER?: string;
  /** Beehiiv REST API key (provider "beehiiv"). */
  BEEHIIV_API_KEY?: string;
  /** Beehiiv publication id (provider "beehiiv"). */
  BEEHIIV_PUBLICATION_ID?: string;
  /** MailCheap API base URL (provider "mailcheap"). */
  MAILCHEAP_API_URL?: string;
  /** MailCheap API key (provider "mailcheap"). */
  MAILCHEAP_API_KEY?: string;

  /** Analytics provider for the server-side abstraction (default "cloudflare"). */
  ANALYTICS_PROVIDER?: string;

  /** Cloudflare Web Analytics token (optional). */
  PUBLIC_CF_ANALYTICS_TOKEN?: string;

  /** Crisp Chat website id (optional — when set, the widget is injected). */
  CRISP_WEBSITE_ID?: string;

  /**
   * Active transactional email provider: "resend" (default) uses
   * RESEND_API_KEY via @sextant/email; "cloudflare" sends through the
   * SEND_EMAIL binding below.
   */
  EMAIL_PROVIDER?: string;
  /**
   * Cloudflare Email Workers `send_email` binding (optional — configure in
   * wrangler.jsonc). Used when EMAIL_PROVIDER=cloudflare; when absent, sends
   * log a warning and no-op.
   */
  SEND_EMAIL?: SendEmail;
}

/**
 * The Worker env, typed. Secrets absent in local dev surface as `undefined`
 * until `.dev.vars` is filled in.
 */
export function getEnv(): Env {
  return env as unknown as Env;
}
