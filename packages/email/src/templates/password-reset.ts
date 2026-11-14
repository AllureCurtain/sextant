/** Password-reset email sent by Better Auth's `sendResetPassword`. */
export function passwordResetEmail(input: { resetUrl: string; name?: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const greeting = input.name ? `Hi ${input.name},` : "Hi,";
  const subject = "Reset your password";
  const text = `${greeting}\n\nReset your password using this link (it expires soon): ${input.resetUrl}\n\nIf you did not request a reset, you can ignore this email.\n\n— The Sextant team`;
  const html = `<p>${greeting}</p><p>Reset your password using this link (it expires soon): <a href="${input.resetUrl}">${input.resetUrl}</a></p><p>If you did not request a reset, you can ignore this email.</p><p>— The Sextant team</p>`;
  return { subject, html, text };
}
