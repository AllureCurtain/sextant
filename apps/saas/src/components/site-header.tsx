import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "#/components/theme-toggle";
import { useT } from "#/lib/i18n";

const NAV_LINKS = [
  { to: "/docs", key: "nav.docs" },
  { to: "/pricing", key: "nav.pricing" },
  { to: "/blog", key: "nav.blog" },
  { to: "/showcase", key: "nav.showcase" },
  { to: "/tools", key: "nav.tools" },
  { to: "/changelog", key: "nav.changelog" },
] as const;

/**
 * Shared top navigation for the public site — borderless glass bar like
 * tanstarter.dev: high-contrast links, two icon buttons, outlined Log-in pill,
 * solid Get-started pill. `Commits`/`About` live in the footer. Below `md`
 * the links collapse into a hamburger menu.
 */
export function SiteHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Transparent at the very top (merges into the hero glow); frosted once the
  // page scrolls, like tanstarter's `transition-all` sticky header.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu when the viewport grows back to desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "bg-page/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-[15px] font-semibold tracking-tight text-ink-1 transition-colors hover:opacity-70"
        >
          Sextant
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-ink-2 transition-colors hover:text-ink-1">
              {t(l.key)}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            to="/login"
            className="inline-flex h-8 items-center justify-center rounded-full border border-border-strong px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-panel-2"
          >
            {t("nav.login")}
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-8 items-center justify-center rounded-full bg-ink-1 px-4 text-sm font-semibold text-page shadow-xs transition-all duration-150 hover:opacity-85"
          >
            {t("nav.getStarted")}
          </Link>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink-1"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <nav className="border-t border-border bg-page px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-[15px] text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink-1"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-[15px] text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink-1"
              >
                {t("nav.login")}
              </Link>
            </li>
            <li className="px-3 pt-2 pb-1">
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-full items-center justify-center rounded-full bg-ink-1 px-4 text-sm font-semibold text-page shadow-xs transition-all duration-150 hover:opacity-85"
              >
                {t("nav.getStarted")}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
