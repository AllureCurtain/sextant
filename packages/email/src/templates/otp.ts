/** One-time passcode email — the code rendered large for quick reading. */
export function otpEmail(input: {
  code: string;
  name?: string;
  /** Minutes until the code expires. Shown in the expiry note. */
  expiresInMinutes?: number;
}): { subject: string; html: string; text: string } {
  const greeting = input.name ? `Hi ${input.name},` : "Hi,";
  const expires = input.expiresInMinutes ?? 10;
  const subject = `${input.code} is your verification code`;
  const text = `${greeting}\n\nYour verification code is:\n\n${input.code}\n\nIt expires in ${expires} minutes. If you did not request this code, you can ignore this email.\n\n— The Sextant team`;
  const html = `<p>${greeting}</p><p>Your verification code is:</p><p style="font-family:monospace;font-size:32px;font-weight:bold;letter-spacing:4px;">${input.code}</p><p>It expires in ${expires} minutes. If you did not request this code, you can ignore this email.</p><p>— The Sextant team</p>`;
  return { subject, html, text };
}
