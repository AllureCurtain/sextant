import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { useNotifications } from "#/lib/api";
import type { NotificationRow } from "#/server/api";
import { cn } from "#/lib/utils";

/**
 * Topbar notification bell: unread badge + lightweight CSS dropdown listing
 * the 10 most recent notifications. Data comes from `useNotifications`,
 * which polls `/api/notifications` every 30s.
 *
 * Kept dependency-free: a fixed transparent overlay handles click-outside and
 * the panel is absolutely positioned — no Radix popover.
 */

const TYPE_BORDER: Record<NotificationRow["type"], string> = {
  info: "border-l-accent-500",
  success: "border-l-up",
  warning: "border-l-warn",
  billing: "border-l-coral-500",
  system: "border-l-ink-3",
};

function timeAgo(ts: number): string {
  const seconds = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { data } = useNotifications();

  const unread = data?.unreadCount ?? 0;
  const items = (data?.notifications ?? []).slice(0, 10);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    refresh();
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    refresh();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink-1"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-semibold leading-none text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Click-outside overlay */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-panel shadow-lg">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-sm font-medium text-ink-1">Notifications</span>
              {unread > 0 && <span className="text-xs text-ink-3">{unread} unread</span>}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-ink-3">No notifications yet</p>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 border-l-2 px-4 py-3",
                      TYPE_BORDER[n.type] ?? "border-l-ink-3",
                      n.readAt === null ? "bg-panel-2/60" : "bg-panel",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm",
                          n.readAt === null ? "font-medium text-ink-1" : "text-ink-2",
                        )}
                      >
                        {n.title}
                      </p>
                      {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-ink-3">{n.body}</p>}
                      <p className="mt-1 text-[11px] text-ink-3">{timeAgo(n.createdAt)}</p>
                    </div>
                    {n.readAt === null && (
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        title="Mark as read"
                        className="mt-0.5 shrink-0 rounded-md p-1 text-ink-3 transition-colors hover:bg-panel-2 hover:text-accent-600"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="w-full border-t border-border px-4 py-2.5 text-center text-xs font-medium text-accent-700 transition-colors hover:bg-panel-2"
              >
                Mark all read
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
