import { waitUntil } from "cloudflare:workers";
import { getEnv } from "../env";
import { createD1Provider } from "./resend";
import type { NewsletterProvider } from "./types";

/**
 * Beehiiv provider stub: D1 stays the source of truth; on subscribe the email
 * is also pushed to Beehiiv's REST API
 *   POST https://api.beehiiv.com/v2/publications/{pub_id}/subscriptions
 * using `BEEHIIV_API_KEY` + `BEEHIIV_PUBLICATION_ID`. When either env var is
 * missing the call is skipped with a warning so dev never breaks.
 */

function beehiivConfigured(): { apiKey: string; publicationId: string } | null {
  const env = getEnv();
  const apiKey = env.BEEHIIV_API_KEY;
  const publicationId = env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    console.warn("beehiiv provider selected but BEEHIIV_API_KEY / BEEHIIV_PUBLICATION_ID unset");
    return null;
  }
  return { apiKey, publicationId };
}

function syncToBeehiiv(email: string) {
  const config = beehiivConfigured();
  if (!config) return;
  waitUntil(
    (async () => {
      try {
        const res = await fetch(
          `https://api.beehiiv.com/v2/publications/${config.publicationId}/subscriptions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({ email, reactivate_existing: true }),
          },
        );
        if (!res.ok) {
          console.error("beehiiv subscribe failed", { status: res.status });
        }
      } catch (err) {
        console.error("beehiiv subscribe failed", err);
      }
    })(),
  );
}

const base = createD1Provider();

export const beehiivProvider: NewsletterProvider = {
  name: "beehiiv",
  listSubscribers: base.listSubscribers?.bind(base),

  async subscribe(params) {
    const result = await base.subscribe(params);
    syncToBeehiiv(params.email);
    return result;
  },

  async unsubscribe(params) {
    // D1 remains authoritative; Beehiiv has no required unsubscribe call here.
    return base.unsubscribe(params);
  },
};
