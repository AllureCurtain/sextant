export interface InvoiceLineItem {
  description: string;
  quantity: number;
  /** Unit price in minor units (cents). Never floating point. */
  unitPriceCents: number;
}

function formatAmount(cents: number, currency: string): string {
  return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
}

/**
 * Invoice email with a line-items table — a fuller alternative to the simple
 * `receiptEmail` for purchases with itemized billing.
 *
 * `taxCents` is added on top of the line-item subtotal; pass `0` for no tax.
 */
export function invoiceEmail(input: {
  name?: string;
  items: InvoiceLineItem[];
  /** Tax in minor units (cents). */
  taxCents?: number;
  currency: string;
  siteUrl: string;
}): { subject: string; html: string; text: string } {
  const currency = input.currency;
  const greeting = input.name ? `Hi ${input.name},` : "Hi,";
  const taxCents = input.taxCents ?? 0;

  const rows = input.items.map((item) => ({
    ...item,
    totalCents: item.unitPriceCents * item.quantity,
  }));
  const subtotalCents = rows.reduce((sum, row) => sum + row.totalCents, 0);
  const totalCents = subtotalCents + taxCents;

  const subject = "Your invoice";

  const textLines = [
    greeting,
    "",
    "Thanks for your purchase. Here is your invoice:",
    "",
    ...rows.map(
      (row) =>
        `${row.description} — ${row.quantity} × ${formatAmount(row.unitPriceCents, currency)} = ${formatAmount(row.totalCents, currency)}`,
    ),
    "",
    `Subtotal: ${formatAmount(subtotalCents, currency)}`,
    `Tax: ${formatAmount(taxCents, currency)}`,
    `Total: ${formatAmount(totalCents, currency)}`,
    "",
    `You can view your account here: ${input.siteUrl}`,
    "",
    "— The Sextant team",
  ];
  const text = textLines.join("\n");

  const itemRows = rows
    .map(
      (row) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${row.description}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${row.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatAmount(row.unitPriceCents, currency)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatAmount(row.totalCents, currency)}</td></tr>`,
    )
    .join("");

  const html = `<p>${greeting}</p><p>Thanks for your purchase. Here is your invoice:</p><table style="border-collapse:collapse;width:100%;"><thead><tr><th style="padding:8px;border-bottom:2px solid #000;text-align:left;">Description</th><th style="padding:8px;border-bottom:2px solid #000;text-align:right;">Qty</th><th style="padding:8px;border-bottom:2px solid #000;text-align:right;">Unit price</th><th style="padding:8px;border-bottom:2px solid #000;text-align:right;">Total</th></tr></thead><tbody>${itemRows}</tbody><tfoot><tr><td colspan="3" style="padding:8px;text-align:right;">Subtotal</td><td style="padding:8px;text-align:right;">${formatAmount(subtotalCents, currency)}</td></tr><tr><td colspan="3" style="padding:8px;text-align:right;">Tax</td><td style="padding:8px;text-align:right;">${formatAmount(taxCents, currency)}</td></tr><tr><td colspan="3" style="padding:8px;text-align:right;font-weight:bold;">Total</td><td style="padding:8px;text-align:right;font-weight:bold;">${formatAmount(totalCents, currency)}</td></tr></tfoot></table><p>You can <a href="${input.siteUrl}">view your account here</a>.</p><p>— The Sextant team</p>`;

  return { subject, html, text };
}
