import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Settings, Sparkles, Users } from "lucide-react";
import type { ReactNode } from "react";
import { authClient } from "#/lib/auth-client";
import { Button } from "#/components/ui/button";
import { ThemeToggle } from "#/components/theme-toggle";
import { NotificationBell } from "#/components/notification-bell";

/**
 * Shared app shell: ink left rail + topbar + content column.
 *
 * `active` marks the current section in the rail; `title` sets the topbar
 * heading. Pages render their own content as `children`.
 */

type Section = "dashboard" | "playground" | "settings" | "admin";

const NAV_ITEMS: { key: Section; label: string; to: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { key: "playground", label: "Playground", to: "/playground", icon: Sparkles },
  { key: "settings", label: "Settings", to: "/settings", icon: Settings },
  { key: "admin", label: "Admin", to: "/admin", icon: Users },
];

export function AppShell({
  active,
  title,
  email,
  children,
}: {
  active: Section;
  title: string;
  email: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  async function logout() {
    await authClient.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <div className="flex flex-1">
        {/* Ink rail — near-black in light mode, pure black with a hairline in dark */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-ink-1 text-page sm:flex dark:bg-black">
          <div className="flex h-14 items-center px-5">
            <Link to="/" className="text-[15px] font-semibold tracking-tight text-page">
              Sextant
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_ITEMS.map((item) =>
              item.key === active ? (
                <div
                  key={item.key}
                  className="flex items-center gap-2.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              ) : (
                <Link
                  key={item.key}
                  to={item.to}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-page/55 transition-colors hover:bg-white/8 hover:text-page"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className="border-t border-white/10 px-4 py-3">
            <p className="truncate text-xs text-page/55">{email}</p>
            <button
              onClick={logout}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-page/55 transition-colors hover:text-page"
            >
              <LogOut className="h-3 w-3" /> Log out
            </button>
          </div>
        </aside>

        {/* Content column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-border bg-panel px-4 sm:px-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-ink-1">{title}</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />
              <span className="hidden text-sm text-ink-3 sm:block">{email}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-3.5 w-3.5" /> Log out
              </Button>
            </div>
          </header>

          <main className="page-in flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
