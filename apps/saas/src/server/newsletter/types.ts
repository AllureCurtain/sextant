/**
 * Newsletter provider abstraction.
 *
 * All subscribe/unsubscribe operations go through `NewsletterProvider` so
 * swapping the backend (local D1, Resend, Beehiiv, MailCheap) is a config
 * change, not a code change. Implementations live next to this file.
 *
 * The D1 `newsletter_subscriber` table stays the source of truth in every
 * implementation — external providers only sync on top of it.
 */

export interface SubscribeParams {
  email: string;
  /** Where the signup came from, e.g. "homepage" or a form id. */
  source?: string;
}

export interface UnsubscribeParams {
  email: string;
}

export interface SubscriberRow {
  email: string;
  confirmedAt: number | null;
  unsubscribedAt: number | null;
}

export interface NewsletterProvider {
  /** Short identifier, e.g. "local", "resend", "beehiiv". */
  readonly name: string;

  /**
   * Subscribe an email. Must be idempotent: re-subscribing an existing,
   * still-active address is a no-op returning `{ ok: true }`; re-subscribing
   * an unsubscribed address reactivates it.
   */
  subscribe(params: SubscribeParams): Promise<{ ok: true }>;

  /**
   * Unsubscribe an email. Resolves `{ ok: true }` when the address is now
   * unsubscribed; `{ ok: false }` when it was never subscribed.
   */
  unsubscribe(params: UnsubscribeParams): Promise<{ ok: boolean }>;

  /** Optional: list current subscribers (D1-backed providers only). */
  listSubscribers?(): Promise<SubscriberRow[]>;
}
