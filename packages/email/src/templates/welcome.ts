/** Welcome email sent after sign-up. */
export function welcomeEmail(input: { name?: string; siteUrl: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const greeting = input.name ? `Hi ${input.name},` : "Hi,";
  const subject = "Welcome to Sextant";
  const text = `${greeting}\n\nThanks for signing up. You can log in here: ${input.siteUrl}\n\n— The Sextant team`;
  const html = `<p>${greeting}</p><p>Thanks for signing up. You can <a href="${input.siteUrl}">log in here</a>.</p><p>— The Sextant team</p>`;
  return { subject, html, text };
}
