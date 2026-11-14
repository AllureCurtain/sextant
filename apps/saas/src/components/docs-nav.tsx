import { Link, useRouterState } from "@tanstack/react-router";

/**
 * Shared left-hand navigation for the docs section. Lists every docs page in
 * order; the active route is highlighted. Rendered by the `/docs` layout route
 * so the sidebar persists across all doc subpages.
 */

const DOCS_LINKS = [
  { to: "/docs", label: "Quickstart", exact: true },
  { to: "/docs/authentication", label: "Authentication", exact: false },
  { to: "/docs/billing", label: "Billing", exact: false },
  { to: "/docs/database", label: "Database", exact: false },
  { to: "/docs/storage", label: "Storage", exact: false },
  { to: "/docs/deployment", label: "Deployment", exact: false },
] as const;

export function DocsNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky top-24 space-y-1 border-l border-border pl-4">
      <p className="mb-3 text-xs font-medium tracking-wide text-ink-3 uppercase">Docs</p>
      {DOCS_LINKS.map((link) => {
        const active = link.exact ? pathname === link.to : pathname.startsWith(link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={
              active
                ? "block text-sm font-medium text-accent-700"
                : "block text-sm text-ink-3 transition-colors hover:text-ink-1"
            }
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
