/**
 * Payment provider abstraction.
 *
 * All billing operations go through `PaymentProvider` so swapping Stripe for
 * another provider (e.g. Creem, Waffo — not yet implemented) is a config
 * change, not a code change. Implementations live next to this file.
 */

export interface CheckoutParams {
  /** App user id — propagated into provider metadata. */
  userId: string;
  email: string;
  name: string;
  /** Provider-side price/product id for the plan being purchased. */
  priceId: string;
  /**
   * Checkout mode: "subscription" (default) starts a recurring subscription;
   * "payment" is a one-time charge (e.g. a credit pack). The provider must use
   * a price configured for the matching mode.
   */
  mode?: "subscription" | "payment";
  /** Existing provider customer id to reuse, if we created one before. */
  customerId?: string | null;
  /** Absolute URL the provider redirects to on success. */
  successUrl: string;
  /** Absolute URL the provider redirects to on cancel. */
  cancelUrl: string;
}

export interface PortalParams {
  /** Provider customer id. */
  customerId: string;
  /** Absolute URL the portal returns the user to. */
  returnUrl: string;
}

/** Provider-side customer reference created ahead of (or during) checkout. */
export interface CustomerRef {
  customerId: string;
}

/**
 * Normalized webhook outcome. `event.id` must be unique per event for dedup;
 * `type` is the provider's own event name. The remaining fields are populated
 * on the specific events the app cares about.
 */
export interface NormalizedPaymentEvent {
  /** Provider event id — used as the webhook dedup key. */
  id: string;
  /** Provider event name, e.g. "checkout.session.completed". */
  type: string;
  /** App user id recovered from provider metadata, when present. */
  userId?: string;
  /** Provider customer id, when the event carries one. */
  customerId?: string | null;
  /** Provider subscription id, when the event carries one. */
  subscriptionId?: string | null;
  /** Plan key resolved by the provider (e.g. "pro"), if determinable. */
  plan?: string | null;
  /** Provider subscription status string (e.g. "active"). */
  status?: string;
  /** Credits to grant for this event (e.g. a renewal top-up). */
  credits?: number;
  /** Receipt details for a completed checkout — feeds the receipt email. */
  receipt?: {
    amountCents: number;
    currency: string;
    planName: string;
  };
}

export interface PaymentProvider {
  /** Short identifier, e.g. "stripe". */
  readonly name: string;

  /** Create (or return an existing) provider customer for a user. */
  createCustomer(params: { userId: string; email: string; name: string }): Promise<CustomerRef>;

  /** Start a hosted checkout; returns the URL to redirect the user to. */
  createCheckout(params: CheckoutParams): Promise<{ url: string }>;

  /** Open the self-service billing portal; returns the URL. */
  createPortal(params: PortalParams): Promise<{ url: string }>;

  /**
   * Verify the webhook signature and normalize the event. Throws
   * `WebhookVerificationError` when the signature is missing/invalid so the
   * caller can return 400 without touching the DB.
   */
  handleWebhook(request: Request): Promise<NormalizedPaymentEvent>;
}

export class WebhookVerificationError extends Error {
  constructor(message = "invalid webhook signature") {
    super(message);
    this.name = "WebhookVerificationError";
  }
}
