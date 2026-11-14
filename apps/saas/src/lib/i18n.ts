import { createContext, createElement, useContext } from "react";
import { en } from "../locales/en";
import { zh } from "../locales/zh";

/**
 * Minimal i18n for the SaaS app — English + Chinese as demo languages.
 *
 * The locale travels in the `sextant-locale` cookie. The root route loader
 * (`src/routes/__root.tsx`) reads it on the server via `getLocaleFromRequest`
 * and the client on hydration via `getLocaleFromDocument`, so both passes
 * render the same strings and `<html lang>` is correct without a flash.
 *
 * Adding translations:
 *   1. Add the key + English text to `src/locales/en.ts`.
 *   2. Add the same key to `src/locales/zh.ts` (key order doesn't matter, but
 *      keeping the same shape is enforced — `zh` must satisfy `Messages`).
 *   3. Use it in a component under `<LocaleProvider>`:
 *        const t = useT();
 *        t("nav.blog")
 *      Dotted paths typecheck against the `en` dictionary, so a missing key
 *      is a compile error rather than a runtime blank.
 *
 * Adding a language:
 *   1. Create `src/locales/<code>.ts` satisfying `Messages`.
 *   2. Add the code to `LOCALES` and `DICTIONARIES` below.
 *   3. Add it to the labels in `src/components/locale-switcher.tsx`.
 */

export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "sextant-locale";

export type Messages = typeof en;

const DICTIONARIES: Record<Locale, Messages> = { en, zh };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Read the locale cookie from a raw `Cookie` header value. */
export function localeFromCookieHeader(cookieHeader: string | null | undefined): Locale {
  if (cookieHeader) {
    for (const part of cookieHeader.split(";")) {
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      if (part.slice(0, eq).trim() !== LOCALE_COOKIE) continue;
      const value = decodeURIComponent(part.slice(eq + 1).trim());
      if (isLocale(value)) return value;
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * Locale for the current request. Server-side the root route loader already
 * resolved it from the request headers and handed it down through
 * `LocaleProvider`; this helper exists for server code paths that only have
 * the raw `Request` (e.g. `i18n-server.ts`).
 */
export function getLocaleFromRequest(request: Request): Locale {
  return localeFromCookieHeader(request.headers.get("cookie"));
}

/** Client-side: read the locale cookie from `document.cookie`. */
export function getLocaleFromDocument(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  return localeFromCookieHeader(document.cookie);
}

/** Persist the locale choice for a year and return it. */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)};path=/;max-age=31536000;SameSite=Lax`;
}

type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : DotPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageKey = DotPaths<Messages>;

function lookup(dict: Messages, key: string): string {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (node === null || typeof node !== "object") return key;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : key;
}

export type TranslateFn = (key: MessageKey) => string;

export function translator(locale: Locale): TranslateFn {
  const dict = DICTIONARIES[locale];
  return (key) => lookup(dict, key);
}

// ── React plumbing ─────────────────────────────────────────────────────────

const LocaleContext = createContext<{ locale: Locale; t: TranslateFn }>({
  locale: DEFAULT_LOCALE,
  t: translator(DEFAULT_LOCALE),
});

/**
 * Provides `{ locale, t }` to the subtree. The `locale` prop should come from
 * the root route loader data so server render and hydration agree.
 */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  // JSX-free so this file can stay `.ts` — the provider value is memo-free on
  // purpose: `translator(locale)` is a cheap closure and locale changes reload.
  return createElement(
    LocaleContext.Provider,
    { value: { locale, t: translator(locale) } },
    children,
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

export function useT(): TranslateFn {
  return useContext(LocaleContext).t;
}
