import { createContext, createElement, useContext } from "react";
import { en } from "../locales/en";

/**
 * Single-language strings for the SaaS app — English only.
 *
 * Sextant ships English-only (see `docs/decisions.md`); the typed `t()` /
 * `LocaleProvider` plumbing is kept so UI copy stays centralized in
 * `src/locales/en.ts` and a second language can be added later with a
 * dedicated issue — it is deliberately *not* a selectable-locale feature.
 *
 * There is no locale cookie and no switcher: `Locale` is the literal "en" and
 * every resolver returns it. The `<html lang>` attribute is a constant.
 *
 * Adding / changing copy:
 *   1. Edit `src/locales/en.ts`.
 *   2. Use the key under `<LocaleProvider>`:
 *        const t = useT();
 *        t("nav.blog")
 *      Dotted paths typecheck against the `en` dictionary, so a missing key is
 *      a compile error rather than a runtime blank.
 */

export type Locale = "en";
export const DEFAULT_LOCALE: Locale = "en";

export type Messages = typeof en;

const DICTIONARY: Messages = en;

export function isLocale(value: unknown): value is Locale {
  return value === "en";
}

/**
 * Locale for the current request. English-only: the request headers are
 * ignored and the constant is returned. Kept as a function signature so the
 * root loader call site (`src/routes/__root.tsx`) is unchanged.
 */
export function getLocaleFromRequest(_request: Request): Locale {
  return DEFAULT_LOCALE;
}

/** Client-side: the document locale is always English. */
export function getLocaleFromDocument(): Locale {
  return DEFAULT_LOCALE;
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

export function translator(_locale: Locale = DEFAULT_LOCALE): TranslateFn {
  return (key) => lookup(DICTIONARY, key);
}

// ── React plumbing ─────────────────────────────────────────────────────────

const LocaleContext = createContext<{ locale: Locale; t: TranslateFn }>({
  locale: DEFAULT_LOCALE,
  t: translator(),
});

/**
 * Provides `{ locale, t }` to the subtree. The `locale` prop is accepted so the
 * root route loader call site stays in place, but it is always `"en"`.
 */
export function LocaleProvider({
  locale = DEFAULT_LOCALE,
  children,
}: {
  locale?: Locale;
  children: React.ReactNode;
}) {
  // JSX-free so this file can stay `.ts`.
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
