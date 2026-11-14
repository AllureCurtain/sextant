import { useEffect, useRef, useState } from "react";
import { Check, Languages } from "lucide-react";
import { setLocaleCookie, useLocale, useT, type Locale } from "#/lib/i18n";
import { cn } from "#/lib/utils";

const OPTIONS: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
];

/**
 * Language menu for the marketing header — a round icon button opening a
 * dropdown with the two locales, matching the icon-then-menu pattern on
 * tanstarter.dev. Writes the `sextant-locale` cookie and reloads so SSR
 * output re-renders in the new locale.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    setLocaleCookie(next);
    window.location.reload();
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("nav.language")}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink-1"
      >
        <Languages className="h-4 w-4" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 min-w-[9rem] overflow-hidden rounded-xl border border-border bg-panel py-1 shadow-md"
        >
          {OPTIONS.map((o) => (
            <button
              key={o.code}
              type="button"
              role="menuitemradio"
              aria-checked={o.code === locale}
              onClick={() => choose(o.code)}
              className={cn(
                "flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm transition-colors hover:bg-panel-2",
                o.code === locale ? "font-semibold text-ink-1" : "text-ink-2",
              )}
            >
              <span className="w-4">
                {o.code === locale && <Check className="h-3.5 w-3.5 text-coral-500" />}
              </span>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
