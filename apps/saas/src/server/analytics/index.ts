import { getEnv } from "../env";
import { cloudflareProvider } from "./cloudflare";
import type { AnalyticsProvider } from "./types";

export type { AnalyticsProvider } from "./types";
export type { TrackEventParams, TrackPageViewParams } from "./types";

/**
 * Registry of analytics providers. To add one (e.g. Plausible or PostHog):
 * implement `AnalyticsProvider` in a sibling file, add it to `providers`,
 * and point `ANALYTICS_PROVIDER` at it.
 *
 * Stubs to implement later:
 *   plausible: plausibleProvider  — POST https://plausible.io/api/event
 *   posthog:   posthogProvider    — POST https://us.i.posthog.com/capture/
 */
const providers: Record<string, AnalyticsProvider> = {
  cloudflare: cloudflareProvider,
  // plausible: plausibleProvider,
  // posthog: posthogProvider,
};

/**
 * Resolve the active provider. Reads `ANALYTICS_PROVIDER` (default
 * "cloudflare"); an explicit `name` argument overrides the env var.
 * Unknown keys fall back to the cloudflare provider — analytics should never
 * crash a request over a typo'd env var.
 */
export function getAnalytics(name?: string): AnalyticsProvider {
  const key = name ?? getEnv().ANALYTICS_PROVIDER ?? "cloudflare";
  const provider = providers[key];
  if (!provider) {
    console.warn(`[analytics] unknown provider "${key}", falling back to "cloudflare"`);
    return cloudflareProvider;
  }
  return provider;
}
