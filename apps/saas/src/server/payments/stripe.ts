import Stripe from "stripe";
import { getEnv } from "../env";
import type {
  CheckoutParams,
  CustomerRef,
  NormalizedPaymentEvent,
  PaymentProvider,
  PortalParams,
} from "./types";
import { WebhookVerificationError } from "./types";

/**
 * Stripe implementation of `PaymentProvider`. Test mode by default — keys
 * come from `.dev.vars` / Worker secrets.
 *
 * The price-id → plan mapping and the per-plan credit amounts are the app's
 * own billing policy: they live here because the provider is the only place
 * that sees provider-side price ids.
 */

/** The sample plan grants 100 credits per billing period. */
const PLAN_CREDITS_PER_PERIOD = 100;
/** Credits granted by the one-time credit pack (see `src/config/pricing.ts`). */
const CREDIT_PACK_CREDITS = 100;

function getStripe(): Stripe {
  return new Stripe(getEnv().STRIPE_SECRET_KEY, {
    // Pinned to the SDK's bundled API version; upgrade with the SDK.
    apiVersion: "2025-11-17.clover" as Stripe.LatestApiVersion,
    typescript: true,
  });
}

/** Map a Stripe price id to a plan name. Single sample plan in v1. */
function planNameForPrice(priceId: string | null): string | null {
  return priceId ? "pro" : null;
}

/**
 * Map a one-time purchase's price id to the credits it grants. Single credit
 * pack in v1 — any one-time payment tops up `CREDIT_PACK_CREDITS`.
 */
function creditsForOneTimePrice(_priceId: string | null): number {
  return CREDIT_PACK_CREDITS;
}

export const stripeProvider: PaymentProvider = {
  name: "stripe",

  async createCustomer({ userId, email, name }): Promise<CustomerRef> {
    const customer = await getStripe().customers.create({
      email,
      name,
      metadata: { userId },
    });
    return { customerId: customer.id };
  },

  async createCheckout(params: CheckoutParams): Promise<{ url: string }> {
    const stripe = getStripe();
    const mode = params.mode ?? "subscription";
    const session = await stripe.checkout.sessions.create({
      mode,
      customer: params.customerId ?? undefined,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: { userId: params.userId },
      // `subscription_data` is only valid on subscription-mode sessions.
      ...(mode === "subscription"
        ? { subscription_data: { metadata: { userId: params.userId } } }
        : { payment_intent_data: { metadata: { userId: params.userId } } }),
    });
    return { url: session.url ?? "" };
  },

  async createPortal(params: PortalParams): Promise<{ url: string }> {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
    return { url: portal.url };
  },

  async handleWebhook(request: Request): Promise<NormalizedPaymentEvent> {
    const env = getEnv();
    const stripe = getStripe();
    const signature = request.headers.get("stripe-signature");
    if (!signature) throw new WebhookVerificationError("missing stripe-signature header");

    const payload = await request.text();
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      throw new WebhookVerificationError();
    }

    const out: NormalizedPaymentEvent = { id: event.id, type: event.type };

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;
        out.userId = userId;
        out.customerId = typeof session.customer === "string" ? session.customer : null;
        out.subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

        if (session.mode === "payment") {
          // One-time purchase (credit pack). No subscription or plan change —
          // resolve the purchased price to learn how many credits to grant.
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
            limit: 1,
          });
          const priceId = lineItems.data[0]?.price?.id ?? null;
          out.credits = creditsForOneTimePrice(priceId);
          out.receipt = {
            amountCents: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            planName: "Credit pack",
          };
          break;
        }

        // Subscription checkout: look up the subscription to learn the plan;
        // grant the period's credits.
        if (out.subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(out.subscriptionId);
          const priceId = subscription.items.data[0]?.price.id ?? null;
          out.plan = planNameForPrice(priceId);
          out.status = subscription.status;
          out.credits = PLAN_CREDITS_PER_PERIOD;
          const lineItem = subscription.items.data[0];
          out.receipt = {
            amountCents: lineItem?.price.unit_amount ?? session.amount_total ?? 0,
            currency: lineItem?.price.currency ?? session.currency ?? "usd",
            planName: out.plan ?? "pro",
          };
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;
        const priceId = subscription.items.data[0]?.price.id ?? null;
        out.userId = userId;
        out.subscriptionId = subscription.id;
        out.customerId = typeof subscription.customer === "string" ? subscription.customer : null;
        out.plan = subscription.status === "active" ? planNameForPrice(priceId) : null;
        out.status = subscription.status;
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;
        out.userId = userId;
        out.subscriptionId = subscription.id;
        out.plan = null;
        out.status = "canceled";
        break;
      }
      case "invoice.payment_succeeded": {
        // Recurring renewal — top up the period's credits for active subscribers.
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.parent?.subscription_details?.metadata?.userId;
        if (userId && invoice.billing_reason === "subscription_cycle") {
          out.userId = userId;
          out.credits = PLAN_CREDITS_PER_PERIOD;
        }
        break;
      }
      default:
        break; // unhandled event types are recorded but change nothing
    }

    return out;
  },
};
