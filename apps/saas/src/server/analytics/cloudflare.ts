import { getEnv } from "../env";
import type { AnalyticsProvider, TrackEventParams, TrackPageViewParams } from "./types";

/**
 * "cloudflare" provider: writes data points to the Workers Analytics Engine
 * binding `ANALYTICS_ENGINE` (see wrangler.jsonc `analytics_engine_datasets`).
 * When the binding is not configured the provider is a no-op — it logs at
 * debug level so local dev still shows the event stream.
 *
 * Schema per data point:
 *   blobs[0]   event name ("pageview" for trackPageView)
 *   blobs[1]   path, or flattened "k=v" props string
 *   doubles[0] reserved numeric payload (0 for now)
 *   indexes[0] userId — Analytics Engine samples on indexes
 */
function propsToBlob(props: TrackEventParams["props"]): string {
  if (!props) return "";
  return Object.entries(props)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(" ");
}

export const cloudflareProvider: AnalyticsProvider = {
  name: "cloudflare",

  trackEvent({ name, userId, props }: TrackEventParams) {
    const engine = getEnv().ANALYTICS_ENGINE;
    if (!engine) {
      console.debug("[analytics] event", name, userId ?? "anonymous", propsToBlob(props));
      return;
    }
    try {
      engine.writeDataPoint({
        blobs: [name, propsToBlob(props)],
        doubles: [0],
        indexes: [userId ?? "anonymous"],
      });
    } catch (err) {
      console.error("[analytics] writeDataPoint failed", err);
    }
  },

  trackPageView({ path, userId }: TrackPageViewParams) {
    const engine = getEnv().ANALYTICS_ENGINE;
    if (!engine) {
      console.debug("[analytics] pageview", path, userId ?? "anonymous");
      return;
    }
    try {
      engine.writeDataPoint({
        blobs: ["pageview", path],
        doubles: [0],
        indexes: [userId ?? "anonymous"],
      });
    } catch (err) {
      console.error("[analytics] writeDataPoint failed", err);
    }
  },
};
