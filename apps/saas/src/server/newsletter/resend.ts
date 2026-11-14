import { waitUntil } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { getEnv } from "../env";
import { newsletterSubscriber } from "../../db/schema";
import type {
  NewsletterProvider,
  SubscriberRow,
  SubscribeParams,
  UnsubscribeParams,
} from "./types";

/**
 * D1-backed `NewsletterProvider`. The `newsletter_subscriber` table is the
 * source of truth for every provider — this file is the reference
 * implementation (`local` = this; `resend` = this + a Resend notification).
 *
 * Resend's transactional API has no subscriber-list primitive, so the "resend"
 * provider keeps D1 and fires a fire-and-forget notification to the list owner
 * on each new subscriber, only when `RESEND_API_KEY` is set.
 */

const FROM = "Sextant <noreply@sextant.dev>";

/** Notify the list owner about a new subscriber — fire-and-forget. */
function notifyNewSubscriber(email: string, source?: string) {
  waitUntil(
    (async () => {
      const env = getEnv();
      if (!env.RESEND_API_KEY) return;
      try {
        const { send } = await import("@sextant/email");
        await send(
          {
            from: FROM,
            to: FROM,
            subject: "New newsletter subscriber",
            html: `<p>${email} subscribed${source ? ` via ${source}` : ""}.</p>`,
          },
          env.RESEND_API_KEY,
        );
      } catch (err) {
        console.error("newsletter notification send failed", err);
      }
    })(),
  );
}

/**
 * Build the D1-backed provider. `notifyOnSubscribe` adds the Resend
 * notification; `local` and the remote stubs all wrap this base.
 */
export function createD1Provider(opts?: { notifyOnSubscribe?: boolean }): NewsletterProvider {
  return {
    name: opts?.notifyOnSubscribe ? "resend" : "local",

    async subscribe({ email, source }: SubscribeParams): Promise<{ ok: true }> {
      const db = getDb();
      const existing = await db.query.newsletterSubscriber.findFirst({
        where: eq(newsletterSubscriber.email, email),
      });

      if (existing) {
        if (existing.unsubscribedAt) {
          await db
            .update(newsletterSubscriber)
            .set({ unsubscribedAt: null })
            .where(eq(newsletterSubscriber.id, existing.id));
        }
        return { ok: true }; // idempotent
      }

      await db.insert(newsletterSubscriber).values({
        id: crypto.randomUUID(),
        email,
        confirmedAt: new Date(),
      });
      if (opts?.notifyOnSubscribe) notifyNewSubscriber(email, source);
      return { ok: true };
    },

    async unsubscribe({ email }: UnsubscribeParams): Promise<{ ok: boolean }> {
      const db = getDb();
      const existing = await db.query.newsletterSubscriber.findFirst({
        where: eq(newsletterSubscriber.email, email),
      });
      if (!existing) return { ok: false };

      await db
        .update(newsletterSubscriber)
        .set({ unsubscribedAt: new Date() })
        .where(eq(newsletterSubscriber.id, existing.id));
      return { ok: true };
    },

    async listSubscribers(): Promise<SubscriberRow[]> {
      const rows = await getDb().select().from(newsletterSubscriber);
      return rows.map((r) => ({
        email: r.email,
        confirmedAt: r.confirmedAt instanceof Date ? r.confirmedAt.getTime() : null,
        unsubscribedAt: r.unsubscribedAt instanceof Date ? r.unsubscribedAt.getTime() : null,
      }));
    },
  };
}

/**
 * "resend" provider: the D1-backed store plus a Resend notification to the
 * list owner on each new subscriber.
 */
export const resendProvider: NewsletterProvider = createD1Provider({ notifyOnSubscribe: true });
