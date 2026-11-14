/** Team-invite email — sent when an existing member invites someone to an org. */
export function teamInviteEmail(input: {
  /** Name of the person who sent the invite. */
  inviterName: string;
  /** Name of the organization/team being joined. */
  orgName: string;
  /** Accept-invitation URL (carries the invite token). */
  inviteUrl: string;
  name?: string;
}): { subject: string; html: string; text: string } {
  const greeting = input.name ? `Hi ${input.name},` : "Hi,";
  const subject = `${input.inviterName} invited you to join ${input.orgName}`;
  const text = `${greeting}\n\n${input.inviterName} has invited you to join ${input.orgName}.\n\nAccept the invitation: ${input.inviteUrl}\n\nIf you were not expecting this invitation, you can ignore this email.\n\n— The Sextant team`;
  const html = `<p>${greeting}</p><p><strong>${input.inviterName}</strong> has invited you to join <strong>${input.orgName}</strong>.</p><p><a href="${input.inviteUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">Accept invitation</a></p><p>Or paste this link into your browser: <a href="${input.inviteUrl}">${input.inviteUrl}</a></p><p>If you were not expecting this invitation, you can ignore this email.</p><p>— The Sextant team</p>`;
  return { subject, html, text };
}
