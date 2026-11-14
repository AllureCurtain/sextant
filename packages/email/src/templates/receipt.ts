/** Receipt / order-confirmation email after a Stripe checkout completes. */
export function receiptEmail(input: {
  name?: string;
  amountCents: number;
  currency: string;
  planName: string;
  siteUrl: string;
}): { subject: string; html: string; text: string } {
  const amount = (input.amountCents / 100).toFixed(2);
  const greeting = input.name ? `Hi ${input.name},` : "Hi,";
  const subject = `Your receipt — ${input.planName}`;
  const text = `${greeting}\n\nThanks for your purchase of ${input.planName} for ${input.currency.toUpperCase()} ${amount}.\n\nYou can view your account here: ${input.siteUrl}\n\n— The Sextant team`;
  const html = `<p>${greeting}</p><p>Thanks for your purchase of <strong>${input.planName}</strong> for ${input.currency.toUpperCase()} ${amount}.</p><p>You can <a href="${input.siteUrl}">view your account here</a>.</p><p>— The Sextant team</p>`;
  return { subject, html, text };
}
