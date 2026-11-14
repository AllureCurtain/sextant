import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { entitlement } from "../db/schema";

/**
 * Entitlement helpers — the app's own billing/usage record per user.
 *
 * An entitlement row is created on demand. `plan`/`status` mirror Stripe;
 * `credits` is the integer balance (1 credit = 1 unit, never a float).
 */

/** Free credits granted to every new account so the sample action works. */
export const SIGNUP_CREDITS = 10;

export async function getOrCreateEntitlement(userId: string) {
  const db = getDb();
  const existing = await db.query.entitlement.findFirst({
    where: eq(entitlement.userId, userId),
  });
  if (existing) return existing;
  await db.insert(entitlement).values({ userId, credits: SIGNUP_CREDITS }).onConflictDoNothing();
  const created = await db.query.entitlement.findFirst({
    where: eq(entitlement.userId, userId),
  });
  if (!created) throw new Error("Failed to create entitlement row");
  return created;
}

/** Consume `amount` credits if the balance covers it. Returns the new row. */
export async function consumeCredits(
  userId: string,
  amount: number,
): Promise<{ ok: true; credits: number } | { ok: false; credits: number }> {
  const row = await getOrCreateEntitlement(userId);
  if (row.credits < amount) return { ok: false, credits: row.credits };
  const next = row.credits - amount;
  await getDb().update(entitlement).set({ credits: next }).where(eq(entitlement.userId, userId));
  return { ok: true, credits: next };
}

/** Add `amount` credits (idempotent caller supplies the webhook dedup). */
export async function grantCredits(userId: string, amount: number) {
  const row = await getOrCreateEntitlement(userId);
  const next = row.credits + amount;
  await getDb().update(entitlement).set({ credits: next }).where(eq(entitlement.userId, userId));
  return next;
}
