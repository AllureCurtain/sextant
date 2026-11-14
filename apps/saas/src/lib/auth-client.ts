import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * Client-side auth. The base URL is same-origin, so no config needed in dev.
 * `adminClient` exposes the admin endpoints for the admin console.
 */
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
