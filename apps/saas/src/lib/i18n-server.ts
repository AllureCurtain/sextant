import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getLocaleFromRequest, getLocaleFromDocument, type Locale } from "./i18n";

/**
 * Server-side locale resolution for TanStack Start loaders. Reads the
 * `sextant-locale` cookie off the incoming request. Exposed as a server
 * function so `__root.tsx` (which is bundled for the client too) can call it
 * in its loader without pulling the request context into the browser build —
 * on SSR the framework executes it in-place; on client navigations it becomes
 * an RPC call.
 */
export const getRequestLocale = createServerFn({ method: "GET" }).handler((): Locale => {
  return getLocaleFromRequest(getRequest());
});

/**
 * Locale for hydrating `RootDocument` (`<html lang>`). During SSR there is no
 * document yet, so it falls back to the loader-provided default; in the
 * browser it re-reads the cookie so the attribute matches the rendered copy.
 */
export function getDocumentLocale(fallback: Locale): Locale {
  if (typeof document === "undefined") return fallback;
  return getLocaleFromDocument();
}
