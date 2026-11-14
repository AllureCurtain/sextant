import { getEnv } from "../env";
import { beehiivProvider } from "./beehiiv";
import { localProvider } from "./local";
import { mailcheapProvider } from "./mailcheap";
import { resendProvider } from "./resend";
import type { NewsletterProvider } from "./types";

export type { NewsletterProvider } from "./types";

/**
 * Registry of newsletter providers. To add one: implement `NewsletterProvider`
 * in a sibling file (usually wrapping `createLocalProvider` so the D1 row
 * stays the source of truth), add it here, and point `NEWSLETTER_PROVIDER`
 * at it.
 */
const providers: Record<string, NewsletterProvider> = {
  local: localProvider,
  resend: resendProvider,
  beehiiv: beehiivProvider,
  mailcheap: mailcheapProvider,
};

/**
 * Resolve the active provider. Reads `NEWSLETTER_PROVIDER` (default "local");
 * an explicit `name` argument overrides the env var.
 */
export function getNewsletterProvider(name?: string): NewsletterProvider {
  const key = name ?? getEnv().NEWSLETTER_PROVIDER ?? "local";
  const provider = providers[key];
  if (!provider) {
    throw new Error(
      `Unknown newsletter provider "${key}". Available: ${Object.keys(providers).join(", ")}`,
    );
  }
  return provider;
}
