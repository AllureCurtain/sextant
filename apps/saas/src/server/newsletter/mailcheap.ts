import { waitUntil } from "cloudflare:workers";
import { getEnv } from "../env";
import { createD1Provider } from "./resend";
import type { NewsletterProvider } from "./types";

/**
 * MailCheap provider stub: D1 stays the source of truth; on subscribe the
 * email is also pushed to MailCheap's REST API (`MAILCHEAP_API_URL` +
 * `MAILCHEAP_API_KEY`). When either env var is missing the call is skipped
 * with a warning so dev never breaks.
 */

function mailcheapConfigured(): { apiUrl: string; apiKey: string } | null {
  const env = getEnv();
  const apiUrl = env.MAILCHEAP_API_URL?.replace(/\/+$/, "");
  const apiKey = env.MAILCHEAP_API_KEY;
  if (!apiUrl || !apiKey) {
    console.warn("mailcheap provider selected but MAILCHEAP_API_URL / MAILCHEAP_API_KEY unset");
    return null;
  }
  return { apiUrl, apiKey };
}

function syncToMailcheap(email: string) {
  const config = mailcheapConfigured();
  if (!config) return;
  waitUntil(
    (async () => {
      try {
        const res = await fetch(`${config.apiUrl}/subscriptions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          console.error("mailcheap subscribe failed", { status: res.status });
        }
      } catch (err) {
        console.error("mailcheap subscribe failed", err);
      }
    })(),
  );
}

const base = createD1Provider();

export const mailcheapProvider: NewsletterProvider = {
  name: "mailcheap",
  listSubscribers: base.listSubscribers?.bind(base),

  async subscribe(params) {
    const result = await base.subscribe(params);
    syncToMailcheap(params.email);
    return result;
  },

  async unsubscribe(params) {
    return base.unsubscribe(params);
  },
};
