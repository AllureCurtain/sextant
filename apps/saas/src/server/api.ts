import { z } from "zod";

/**
 * API contract for the SaaS app's own JSON endpoints (auth lives under
 * `/api/auth/*` and is owned by Better Auth; the Stripe webhook is a special
 * case documented below). Zod schemas come first; handlers validate against
 * them. No undocumented endpoint.
 */

// ── Schemas ───────────────────────────────────────────────────────────────

export const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable().optional(),
});
export type PublicUser = z.infer<typeof publicUserSchema>;

export const entitlementSchema = z.object({
  plan: z.string().nullable(),
  status: z.string(),
  credits: z.number().int(),
  stripeCustomerId: z.string().nullable(),
});
export type Entitlement = z.infer<typeof entitlementSchema>;

export const sessionPayloadSchema = z.object({
  user: publicUserSchema,
  isAdmin: z.boolean(),
});
export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export const checkoutRequestSchema = z.object({
  priceId: z.string().min(1),
  /**
   * Checkout mode: "subscription" starts a recurring plan; "payment" is a
   * one-time charge (e.g. a credit pack) and the price id must be a one-time
   * price, not a recurring one. Optional — when omitted, the server infers
   * the mode from the plan's interval in `src/config/pricing.ts`.
   */
  mode: z.enum(["subscription", "payment"]).optional(),
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const checkoutResponseSchema = z.object({
  url: z.string().url(),
});
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;

export const createKeyRequestSchema = z.object({
  name: z.string().min(1).max(64),
});
export type CreateKeyRequest = z.infer<typeof createKeyRequestSchema>;

/** Returned once at creation — the only time the raw key is ever exposed. */
export const createKeyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  prefix: z.string(),
  createdAt: z.number(),
});
export type CreateKeyResponse = z.infer<typeof createKeyResponseSchema>;

export const apiKeyRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  lastUsedAt: z.number().nullable(),
  createdAt: z.number(),
  revokedAt: z.number().nullable(),
});
export type ApiKeyRow = z.infer<typeof apiKeyRowSchema>;

export const usageEventRowSchema = z.object({
  id: z.string(),
  action: z.string(),
  creditsUsed: z.number().int(),
  metadata: z.string().nullable(),
  createdAt: z.number(),
});
export type UsageEventRow = z.infer<typeof usageEventRowSchema>;

export const adminUserRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().nullable(),
  banned: z.boolean().nullable(),
  plan: z.string().nullable(),
  credits: z.number().int(),
  createdAt: z.number(),
});
export type AdminUserRow = z.infer<typeof adminUserRowSchema>;

export const apiErrorSchema = z.object({
  error: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

// ── Notifications ─────────────────────────────────────────────────────────

export const notificationRowSchema = z.object({
  id: z.string(),
  type: z.enum(["info", "success", "warning", "billing", "system"]),
  title: z.string(),
  body: z.string().nullable(),
  readAt: z.number().nullable(),
  createdAt: z.number(),
});
export type NotificationRow = z.infer<typeof notificationRowSchema>;

export const notificationListSchema = z.object({
  notifications: z.array(notificationRowSchema),
  unreadCount: z.number().int(),
});
export type NotificationList = z.infer<typeof notificationListSchema>;

// ── AI playground ─────────────────────────────────────────────────────────
// Requests to /api/ai/*; each consumes 1 credit on success.

export const summarizeRequestSchema = z.object({
  text: z.string().min(1).max(10_000),
});
export type SummarizeRequest = z.infer<typeof summarizeRequestSchema>;

export const translateRequestSchema = z.object({
  text: z.string().min(1).max(10_000),
  targetLang: z.enum(["french", "spanish", "german", "chinese", "japanese"]),
});
export type TranslateRequest = z.infer<typeof translateRequestSchema>;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4_000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const imageRequestSchema = z.object({
  prompt: z.string().min(1).max(1_000),
});
export type ImageRequest = z.infer<typeof imageRequestSchema>;

export const editImageRequestSchema = z.object({
  /** Base64 data URI of the source image, e.g. "data:image/png;base64,…". */
  image: z.string().min(1).max(15_000_000),
  prompt: z.string().min(1).max(1_000),
});
export type EditImageRequest = z.infer<typeof editImageRequestSchema>;

// ── Routes table ──────────────────────────────────────────────────────────
//
// Auth endpoints are provided by Better Auth under `/api/auth/*` (sign-up,
// sign-in, sign-out, session, OAuth, password reset). The Stripe webhook is a
// raw-body POST. The routes below are the app's own JSON API.

export const API_ROUTES = {
  session: { method: "GET", path: "/api/session" },
  entitlement: { method: "GET", path: "/api/entitlement" },
  checkout: { method: "POST", path: "/api/checkout" },
  billingPortal: { method: "POST", path: "/api/billing-portal" },
  consumeCredit: { method: "POST", path: "/api/credits/consume" },
  createKey: { method: "POST", path: "/api/keys" },
  listKeys: { method: "GET", path: "/api/keys" },
  revokeKey: { method: "DELETE", path: "/api/keys/:id" },
  listUsage: { method: "GET", path: "/api/usage" },
  listNotifications: { method: "GET", path: "/api/notifications" },
  markNotificationRead: { method: "POST", path: "/api/notifications/:id/read" },
  markAllNotificationsRead: { method: "POST", path: "/api/notifications/read-all" },
  adminUsers: { method: "GET", path: "/api/admin/users" },
  stripeWebhook: { method: "POST", path: "/api/webhooks/stripe" },
  newsletterSubscribe: { method: "POST", path: "/api/newsletter/subscribe" },
  newsletterUnsubscribe: { method: "POST", path: "/api/newsletter/unsubscribe" },
  cacheGet: { method: "GET", path: "/api/cache/:key" },
  cachePut: { method: "PUT", path: "/api/cache/:key" },
  uploadFile: { method: "POST", path: "/api/files/upload" },
  listFiles: { method: "GET", path: "/api/files" },
  downloadFile: { method: "GET", path: "/api/files/:id/download" },
  deleteFile: { method: "DELETE", path: "/api/files/:id" },
  aiSummarize: { method: "POST", path: "/api/ai/summarize" },
  aiTranslate: { method: "POST", path: "/api/ai/translate" },
  aiChat: { method: "POST", path: "/api/ai/chat" },
  aiImage: { method: "POST", path: "/api/ai/image" },
  aiEditImage: { method: "POST", path: "/api/ai/edit-image" },
} as const;
