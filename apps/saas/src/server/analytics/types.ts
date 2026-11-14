/**
 * Server-side analytics provider abstraction.
 *
 * All event/page-view tracking goes through `AnalyticsProvider` so swapping
 * the backend (Cloudflare Analytics Engine, Plausible, PostHog) is a config
 * change, not a code change. Implementations live next to this file.
 *
 * Calls are always fire-and-forget from request handlers — `track*` methods
 * must never throw and should resolve fast.
 */

export interface TrackEventParams {
  /** Event name, dot-namespaced, e.g. "user.signup", "credits.consume". */
  name: string;
  /** Owning user id, when the event is user-scoped. */
  userId?: string;
  /** Small set of scalar props attached to the event (model name, plan, …). */
  props?: Record<string, string | number | boolean | undefined>;
}

export interface TrackPageViewParams {
  /** Request path, e.g. "/pricing". */
  path: string;
  userId?: string;
}

export interface AnalyticsProvider {
  /** Short identifier, e.g. "cloudflare", "plausible". */
  readonly name: string;

  trackEvent(params: TrackEventParams): Promise<void> | void;

  trackPageView(params: TrackPageViewParams): Promise<void> | void;
}
