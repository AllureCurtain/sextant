import { getEnv } from "./env";

/**
 * Simple request rate limiting.
 *
 * In production this delegates to the Cloudflare Rate Limiting binding
 * (`env.RATE_LIMITER`, configured in `wrangler.jsonc`). The binding's own
 * limit is a fixed per-period count (see the `simple` block in the config) —
 * callers express their policy as `limit`/`windowMs`, and when the binding is
 * absent (local dev, or a window the binding cannot express) an in-memory
 * sliding-window counter enforces it instead.
 *
 * `rateLimit` resolves to `null` when the request is allowed, or the number of
 * seconds until the window resets when it is not.
 */

interface WindowCounter {
  /** Timestamps (ms) of requests seen inside the current window. */
  hits: number[];
}

/** Per-key sliding-window state for the in-memory fallback. */
const memoryStore = new Map<string, WindowCounter>();

function memoryCheck(key: string, limit: number, windowMs: number): number | null {
  const now = Date.now();
  const counter = memoryStore.get(key) ?? { hits: [] };
  counter.hits = counter.hits.filter((t) => now - t < windowMs);
  if (counter.hits.length >= limit) {
    const oldest = counter.hits[0]!;
    memoryStore.set(key, counter);
    return Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
  }
  counter.hits.push(now);
  memoryStore.set(key, counter);
  return null;
}

/**
 * Check `key` against `limit` requests per `windowMs`. Returns `null` when
 * allowed, or seconds until retry when limited.
 *
 * Two layers apply:
 *  - The Cloudflare `RATE_LIMITER` binding, when configured, enforces its own
 *    per-key limit (see `simple` in wrangler.jsonc) — a distributed ceiling
 *    that works across all Workers isolates. Keyed per endpoint.
 *  - The in-memory sliding window always enforces the caller's stricter
 *    `limit`/`windowMs`, per isolate. In dev this is the only layer.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<number | null> {
  const limiter = getEnv().RATE_LIMITER;
  if (limiter) {
    try {
      const outcome = await limiter.limit({ key });
      if (!outcome.success) {
        // The binding does not report a reset time; 60s matches `period` in wrangler.jsonc.
        return 60;
      }
    } catch {
      // Binding misconfigured — fall through to the in-memory limiter.
    }
  }
  return memoryCheck(key, limit, windowMs);
}
