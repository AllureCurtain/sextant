import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getAuth } from "#/server/auth";

/**
 * Server-side session lookup for route guards. Wrapped in `createServerFn` so a
 * route's `beforeLoad`/`loader` can call it on the server without bundling the
 * Better Auth + Cloudflare env code into the browser build — on SSR it runs
 * in-place; on client navigations it becomes an RPC call.
 *
 * Returns the Better Auth user (with the admin plugin's `role`) or null.
 */
export const getRequestUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuth().api.getSession({ headers: getRequest().headers });
  return session?.user ?? null;
});

/** Whether a user carries the `admin` role (comma-separated, as the plugin stores it). */
export function isAdminUser(user: { role?: string | null } | null | undefined): boolean {
  if (!user) return false;
  return (user.role ?? "").split(",").includes("admin");
}
