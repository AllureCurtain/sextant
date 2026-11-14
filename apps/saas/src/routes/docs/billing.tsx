import { createFileRoute } from "@tanstack/react-router";
import { Code, DocsPageIntro, SectionHeading } from "./index";

export const Route = createFileRoute("/docs/billing")({
  component: DocsBilling,
});

function DocsBilling() {
  return (
    <div className="min-w-0 max-w-2xl">
      <DocsPageIntro
        kicker="Docs"
        title="Billing"
        blurb="Stripe checkout, the payment-provider abstraction, and how webhook events become entitlements."
      />

      <section className="mt-14">
        <SectionHeading id="stripe-setup">Stripe setup</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Everything runs in test mode while developing — use test keys and never charge a real
          card.
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              1. Create test keys
            </p>
            <p className="text-sm leading-relaxed text-ink-2">
              In the{" "}
              <a
                href="https://dashboard.stripe.com/test/apikeys"
                className="font-medium text-accent-700 transition-colors hover:text-accent-800"
              >
                Stripe dashboard → Developers → API keys
              </a>
              , copy the <em>Secret key</em> (starts with{" "}
              <code className="font-mono text-xs">sk_test_</code>) into{" "}
              <code className="font-mono text-xs">STRIPE_SECRET_KEY</code>.
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              2. Create the price
            </p>
            <p className="text-sm leading-relaxed text-ink-2">
              Under <em>Products</em>, create a product with a recurring price. Copy the price id (
              <code className="font-mono text-xs">price_...</code>) into{" "}
              <code className="font-mono text-xs">STRIPE_PRICE_ID</code>. The checkout flow in{" "}
              <code className="font-mono text-xs">src/server/payments/stripe.ts</code> builds a
              subscription checkout session with this price.
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              3. Webhook secret
            </p>
            <p className="mb-2 text-sm leading-relaxed text-ink-2">
              For local dev, the Stripe CLI prints a signing secret when you start forwarding:
            </p>
            <Code>{`stripe listen --forward-to localhost:3000/api/webhooks/stripe
# > Ready! Your webhook signing secret is whsec_...
# put whsec_... in .dev.vars as STRIPE_WEBHOOK_SECRET`}</Code>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              In production, create a webhook endpoint in the Stripe dashboard pointing at{" "}
              <code className="font-mono text-xs">https://your-worker/api/webhooks/stripe</code> and
              use its signing secret instead.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading id="webhook-to-entitlement">
          checkout.session.completed → entitlement
        </SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          The webhook handler verifies the Stripe signature, deduplicates by event id via the{" "}
          <code className="font-mono text-xs">stripe_event</code> table, and normalizes the event
          into one entitlement change.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-2">
          <li>
            <code className="font-mono text-xs">checkout.session.completed</code> carries{" "}
            <code className="font-mono text-xs">metadata.userId</code> (set at session creation)
            plus the new customer and subscription ids.
          </li>
          <li>
            The handler retrieves the subscription to read its price id, maps it to the plan name (
            <code className="font-mono text-xs">planNameForPrice</code> →{" "}
            <code className="font-mono text-xs">"pro"</code>), and records customer/subscription
            ids, plan, status, and the period's credits on the{" "}
            <code className="font-mono text-xs">entitlement</code> row.
          </li>
          <li>
            <code className="font-mono text-xs">customer.subscription.updated</code> keeps plan and
            status in sync; <code className="font-mono text-xs">customer.subscription.deleted</code>{" "}
            clears the plan; <code className="font-mono text-xs">invoice.payment_succeeded</code>{" "}
            tops up credits each billing cycle.
          </li>
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Credits are integers in minor units — the sample plan grants 100 credits per period.
        </p>
      </section>

      <section className="mt-14">
        <SectionHeading id="payment-provider">Payment provider abstraction</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          <code className="font-mono text-xs">src/server/payments/</code> is a provider registry.{" "}
          <code className="font-mono text-xs">PAYMENT_PROVIDER</code> (default{" "}
          <code className="font-mono text-xs">"stripe"</code>) selects the implementation at
          runtime; every provider implements the same{" "}
          <code className="font-mono text-xs">PaymentProvider</code> interface —{" "}
          <code className="font-mono text-xs">createCustomer</code>,{" "}
          <code className="font-mono text-xs">createCheckout</code>,{" "}
          <code className="font-mono text-xs">createPortal</code>, and{" "}
          <code className="font-mono text-xs">handleWebhook</code> returning a normalized event.
        </p>
        <div className="mt-5">
          <Code>{`// src/server/payments/index.ts
const providers: Record<string, PaymentProvider> = {
  stripe: stripeProvider,
  // add yours here, then set PAYMENT_PROVIDER=<key>
};`}</Code>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          To add a provider (e.g. Creem or Paddle): implement{" "}
          <code className="font-mono text-xs">PaymentProvider</code> in a sibling file, register it
          in <code className="font-mono text-xs">providers</code>, and set{" "}
          <code className="font-mono text-xs">PAYMENT_PROVIDER</code>. Downstream billing code stays
          untouched.
        </p>
      </section>

      <section className="mt-14">
        <SectionHeading id="testing">Testing locally</SectionHeading>
        <div className="mt-3">
          <Code>{`# terminal 1
pnpm dev:saas

# terminal 2 — forward webhooks to the dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# test a checkout with Stripe's test card
# 4242 4242 4242 4242, any future expiry, any CVC`}</Code>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          After checkout completes, the webhook grants the plan and credits; check the user's row in
          the <code className="font-mono text-xs">entitlement</code> table or the settings page.
        </p>
      </section>
    </div>
  );
}
