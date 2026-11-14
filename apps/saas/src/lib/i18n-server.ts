import { createServerFn } from "@tanstack/react-start";
import { getLocaleFromRequest, getLocaleFromDocument, type Locale } from "./i18n";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Locale resolution for TanStack Start loaders. The app is English-only, so
 * this always resolves to "en"; it stays a server function so `__root.tsx`
 * (bundled for the client too) can call it in its loader without pulling the
 * request context into the browser build — on SSR the framework executes it
 * in-place, on client navigations it becomes an RPC call.
 */
export const getRequestLocale = createServerFn({ method: "GET" }).handler((): Locale => {
  return getLocaleFromRequest(getRequest());
});

/**
 * Locale for hydrating `RootDocument` (`<html lang>`). Always "en"; during SSR
 * there is no document yet so it returns the loader-provided fallback.
 */
export function getDocumentLocale(fallback: Locale): Locale {
  if (typeof document === "undefined") return fallback;
  return getLocaleFromDocument();
}
