import { createD1Provider } from "./resend";
import type { NewsletterProvider } from "./types";

/**
 * "local" provider: D1-backed store with no external sync. Alias for the
 * resend implementation with `notifyOnSubscribe` off — the D1 row is the
 * source of truth either way.
 */
export const localProvider: NewsletterProvider = createD1Provider();
