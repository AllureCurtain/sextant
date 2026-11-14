/** Magic-link sign-in email — the link both verifies and signs the user in. */
export function magicLinkEmail(input: {
  url: string;
  name?: string;
  /** Minutes until the link expires. Shown in the expiry note. */
  expiresInMinutes?: number;
}): { subject: string; html: string; text: string } {
  const greeting = input.name ? `Hi ${input.name},` : "Hi,";
  const expires = input.expiresInMinutes ?? 15;
  const subject = "Your sign-in link";
  const text = `${greeting}\n\nClick the link below to sign in to your account. This link expires in ${expires} minutes.\n\n${input.url}\n\nIf you did not request this link, you can ignore this email.\n\n— The Sextant team`;
  const html = `<p>${greeting}</p><p>Click the button below to sign in to your account. This link expires in ${expires} minutes.</p><p><a href="${input.url}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">Sign in</a></p><p>Or paste this link into your browser: <a href="${input.url}">${input.url}</a></p><p>If you did not request this link, you can ignore this email.</p><p>— The Sextant team</p>`;
  return { subject, html, text };
}
