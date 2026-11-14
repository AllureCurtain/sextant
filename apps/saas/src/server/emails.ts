import { waitUntil } from "cloudflare:workers";
import { getEnv } from "./env";

/**
 * Transactional email sends — thin wrappers that dispatch through the active
 * provider and send fire-and-forget: the promise is registered with the
 * Worker's `waitUntil` so the response is not blocked and the send still
 * completes.
 *
 * Provider selection: `EMAIL_PROVIDER` env var.
 *   - "resend" (default) — sends via the Resend API through @sextant/email.
 *     Without RESEND_API_KEY the send throws inside the waitUntil'd promise and
 *     is logged, never crashing the request.
 *   - "cloudflare" — sends via the `send_email` binding (`env.SEND_EMAIL`).
 *     When the binding is absent the send logs a warning and no-ops.
 */

const FROM = "Sextant <noreply@sextant.dev>";

interface MailInput {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function sendLater(mail: Promise<unknown>) {
  // Never let an email failure surface as a request failure.
  waitUntil(mail.catch((err) => console.error("email send failed", err)));
}

/**
 * Send one email through the configured provider. Resolves once the provider
 * has accepted the message; a missing binding or key resolves after logging.
 */
async function dispatch(input: MailInput) {
  const env = getEnv();
  const provider = env.EMAIL_PROVIDER ?? "resend";

  if (provider === "cloudflare") {
    const binding = env.SEND_EMAIL;
    if (!binding) {
      console.warn(
        "EMAIL_PROVIDER=cloudflare but no send_email binding is configured; skipping send",
      );
      return;
    }
    await binding.send({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return;
  }

  // Default: Resend via @sextant/email. Dynamic imports keep the SDK out of the
  // bundle when EMAIL_PROVIDER=cloudflare.
  const { send } = await import("@sextant/email");
  await send(input, env.RESEND_API_KEY);
}

export function sendWelcomeEmail(to: string, name?: string) {
  sendLater(
    (async () => {
      const { welcomeEmail } = await import("@sextant/email/templates/welcome");
      const mail = welcomeEmail({ name, siteUrl: getEnv().PUBLIC_SITE_URL });
      await dispatch({ from: FROM, to, ...mail });
    })(),
  );
}

/**
 * Password-reset email for Better Auth's `sendResetPassword`. The callback is
 * awaited by Better Auth, so this resolves as soon as the send is *queued*
 * with `waitUntil` — the HTTP response is never held up by the provider.
 */
export function sendPasswordResetEmail(to: string, resetUrl: string, name?: string) {
  sendLater(
    (async () => {
      const { passwordResetEmail } = await import("@sextant/email/templates/password-reset");
      const mail = passwordResetEmail({ resetUrl, name });
      await dispatch({ from: FROM, to, ...mail });
    })(),
  );
}

/**
 * Email-verification message for Better Auth's
 * `emailVerification.sendVerificationEmail`. Sent when sign-up requires a
 * verified email (REQUIRE_EMAIL_VERIFICATION=true). Fire-and-forget like the
 * other transactional sends; there is no shared template yet, so the body is
 * built inline in the same plain style as the password-reset template.
 */
export function sendVerificationEmail(to: string, verifyUrl: string, name?: string) {
  sendLater(
    (async () => {
      const greeting = name ? `Hi ${name},` : "Hi,";
      const subject = "Verify your email address";
      const text = `${greeting}\n\nConfirm your email address using this link: ${verifyUrl}\n\nIf you did not create an account, you can ignore this email.\n\n— The Sextant team`;
      const html = `<p>${greeting}</p><p>Confirm your email address using this link: <a href="${verifyUrl}">${verifyUrl}</a></p><p>If you did not create an account, you can ignore this email.</p><p>— The Sextant team</p>`;
      await dispatch({ from: FROM, to, subject, html, text });
    })(),
  );
}

export function sendReceiptEmail(
  to: string,
  receipt: { name?: string; amountCents: number; currency: string; planName: string },
) {
  sendLater(
    (async () => {
      const { receiptEmail } = await import("@sextant/email/templates/receipt");
      const mail = receiptEmail({ ...receipt, siteUrl: getEnv().PUBLIC_SITE_URL });
      await dispatch({ from: FROM, to, ...mail });
    })(),
  );
}

/**
 * Magic-link sign-in email. The template is available in @sextant/email even
 * if the app does not wire it into auth yet — callers pass the signed URL.
 */
export function sendMagicLinkEmail(
  to: string,
  url: string,
  opts?: { name?: string; expiresInMinutes?: number },
) {
  sendLater(
    (async () => {
      const { magicLinkEmail } = await import("@sextant/email/templates/magic-link");
      const mail = magicLinkEmail({ url, ...opts });
      await dispatch({ from: FROM, to, ...mail });
    })(),
  );
}

/** One-time passcode email — a numeric code rendered large for quick typing. */
export function sendOtpEmail(
  to: string,
  code: string,
  opts?: { name?: string; expiresInMinutes?: number },
) {
  sendLater(
    (async () => {
      const { otpEmail } = await import("@sextant/email/templates/otp");
      const mail = otpEmail({ code, ...opts });
      await dispatch({ from: FROM, to, ...mail });
    })(),
  );
}
