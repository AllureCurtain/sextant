import { getEnv } from "../env";
import { stripeProvider } from "./stripe";
import type { PaymentProvider } from "./types";

export type { PaymentProvider, NormalizedPaymentEvent } from "./types";
export { WebhookVerificationError } from "./types";

/**
 * Registry of implemented payment providers. To add one (e.g. Creem or Waffo):
 * implement `PaymentProvider` in a sibling file, add it to `providers`, and
 * point `PAYMENT_PROVIDER` at it. Everything downstream stays untouched.
 */
const providers: Record<string, PaymentProvider> = {
  stripe: stripeProvider,
};

/**
 * Resolve the active provider. Reads `PAYMENT_PROVIDER` (default "stripe");
 * an explicit `name` argument overrides the env var.
 */
export function getProvider(name?: string): PaymentProvider {
  const key = name ?? getEnv().PAYMENT_PROVIDER ?? "stripe";
  const provider = providers[key];
  if (!provider) {
    throw new Error(
      `Unknown payment provider "${key}". Available: ${Object.keys(providers).join(", ")}`,
    );
  }
  return provider;
}
