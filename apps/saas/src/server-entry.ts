import { createServerEntry } from "@tanstack/react-start/server-entry";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import apiApp from "./server/app";

/**
 * Custom server entry.
 *
 * `/api/*` is served by the Hono app (Better Auth + JSON API + Stripe webhook);
 * everything else is handled by the TanStack Start SSR pipeline. Wrangler
 * points here via `main` in wrangler.jsonc.
 */

const startHandler = createStartHandler(defaultStreamHandler);

export default createServerEntry({
  fetch(request: Request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return apiApp.fetch(request);
    }
    return startHandler(request);
  },
});
