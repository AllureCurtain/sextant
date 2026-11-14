import { Resend } from "resend";

/**
 * Thin Resend wrapper. The API key comes from `RESEND_API_KEY` (or the
 * `apiKey` argument) — never hard-code it. Use the `send*` helpers for the
 * transactional templates this template ships with, or `send` directly.
 */

export interface SendMailInput {
  /** Sender address, e.g. `"Sextant <hello@example.com>"`. */
  from: string;
  to: string | string[];
  subject: string;
  /** Rendered HTML body. */
  html: string;
  /** Optional plain-text fallback. */
  text?: string;
}

let client: Resend | undefined;

function getClient(apiKey?: string): Resend {
  const key = apiKey ?? process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set; cannot send email.");
  }
  if (!client) client = new Resend(key);
  return client;
}

/** Send a raw email through Resend. */
export async function send(input: SendMailInput, apiKey?: string) {
  return getClient(apiKey).emails.send({
    from: input.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}

// Re-export the bundled transactional templates so callers can use either
// `@sextant/email` or the `@sextant/email/templates/*` subpaths.
export { welcomeEmail } from "./templates/welcome";
export { passwordResetEmail } from "./templates/password-reset";
export { receiptEmail } from "./templates/receipt";
export { magicLinkEmail } from "./templates/magic-link";
export { otpEmail } from "./templates/otp";
export { invoiceEmail } from "./templates/invoice";
export type { InvoiceLineItem } from "./templates/invoice";
export { teamInviteEmail } from "./templates/team-invite";
