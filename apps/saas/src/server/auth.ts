import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "./emails";
import { getEnv } from "./env";
import { getAnalytics } from "./analytics";
import { notification, user as userTable } from "../db/schema";

/**
 * Better Auth configuration.
 *
 * Sessions and accounts live on D1 via the Drizzle adapter. `tanstackStartCookies`
 * bridges Better Auth's Set-Cookie headers into TanStack Start's response.
 * `admin()` adds the role field + `/admin/*` endpoints used by the admin console.
 *
 * Transactional emails (welcome, password reset) are sent through
 * @sextant/email; both are fire-and-forget via `ctx.waitUntil` so auth
 * responses never wait on Resend.
 */
export function getAuth() {
  const env = getEnv();
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.PUBLIC_SITE_URL,
    // Accept requests from the configured public URL and from local dev origins
    // so sign-up/sign-in work on localhost and on the workers.dev deployment.
    // In dev, any localhost port is accepted — wrangler/vite pick the next free port
    // when 3000 is taken.
    trustedOrigins: (request) => {
      const origin = request?.headers?.get("origin") ?? "";
      const ok = (o: string) => {
        if (o === env.PUBLIC_SITE_URL) return true;
        try {
          const u = new URL(o);
          return (
            (u.hostname === "localhost" || u.hostname === "127.0.0.1") && u.protocol === "http:"
          );
        } catch {
          return false;
        }
      };
      return ok(origin) ? [origin] : [];
    },
    database: drizzleAdapter(getDb(), { provider: "sqlite" }),
    databaseHooks: {
      user: {
        create: {
          // Welcome email + in-app notification + analytics on every new
          // account (email+password and OAuth). All fire-and-forget.
          after: async (user) => {
            sendWelcomeEmail(user.email, user.name);
            void getDb()
              .insert(notification)
              .values({
                id: crypto.randomUUID(),
                userId: user.id,
                type: "info",
                title: "Welcome to Sextant",
                body: "Your account is ready — grab your API keys and try the playground.",
              })
              .catch((err) => console.error("welcome notification failed", err));
            void Promise.resolve(
              getAnalytics().trackEvent({ name: "user.signup", userId: user.id }),
            ).catch((err) => console.error("[analytics] trackEvent failed", err));
          },
        },
      },
      session: {
        create: {
          // Fires on every new session — sign-in and the auto-session that
          // follows sign-up. Skip the latter by checking the user's age so
          // "user.login" isn't double-counted with "user.signup".
          after: async (session) => {
            void (async () => {
              const db = getDb();
              const u = await db.query.user.findFirst({
                where: eq(userTable.id, session.userId),
              });
              const age = u ? Date.now() - new Date(u.createdAt).getTime() : Infinity;
              if (age > 60_000) {
                await Promise.resolve(
                  getAnalytics().trackEvent({ name: "user.login", userId: session.userId }),
                );
              }
            })().catch((err) => console.error("[analytics] login track failed", err));
          },
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      // When REQUIRE_EMAIL_VERIFICATION=true, sign-up does not auto-sign-in
      // and sign-in is blocked until the email is verified. Off by default so
      // dev works without a mail provider.
      requireEmailVerification: env.REQUIRE_EMAIL_VERIFICATION === "true",
      // Password reset emails are sent via Resend through @sextant/email.
      sendResetPassword: async ({ user, url }) => {
        sendPasswordResetEmail(user.email, url, user.name);
      },
    },
    emailVerification: {
      // Send the verification link on sign-up whenever verification is
      // required (and explicitly whenever sendOnSignUp is set).
      sendVerificationEmail: async ({ user, url }) => {
        sendVerificationEmail(user.email, url, user.name);
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    plugins: [admin(), tanstackStartCookies()],
  });
}

export type Auth = ReturnType<typeof getAuth>;
