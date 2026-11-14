import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "#/lib/auth-client";
import { useAdminUsers, useSessionQuery } from "#/lib/api";
import { AppShell } from "#/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";

export const Route = createFileRoute("/admin")({ component: Admin });

function Badge({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "accent" }) {
  const styles =
    tone === "accent"
      ? "bg-accent-soft text-accent-700 ring-accent-600/20"
      : "bg-panel-2 text-ink-3 ring-border";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles}`}
    >
      {children}
    </span>
  );
}

function Admin() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const { data: sessionInfo } = useSessionQuery();
  const isAdmin = sessionInfo?.isAdmin ?? false;
  const { data, isLoading, error } = useAdminUsers(isAdmin);

  useEffect(() => {
    if (!isPending && !session) navigate({ to: "/login" });
  }, [isPending, session, navigate]);

  if (isPending || !session) {
    return <main className="mx-auto max-w-4xl px-4 py-24 text-center text-ink-3">Loading…</main>;
  }
  if (sessionInfo && !isAdmin) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-ink-1">Forbidden</h1>
        <p className="mt-2 text-ink-2">You need the admin role to view this page.</p>
      </main>
    );
  }

  return (
    <AppShell active="admin" title="Admin" email={session.user.email}>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-1">Users</h1>
          <p className="mt-1 text-sm text-ink-3">All accounts, plans, and credit balances.</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>
            {data
              ? `${data.users.length} account${data.users.length === 1 ? "" : "s"}`
              : "Loading…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-ink-3">Loading users…</p>}
          {error && <p className="text-sm text-down">{error.message}</p>}
          {data && (
            <div className="-mx-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-y border-border bg-panel-2 text-left text-xs font-medium tracking-wide text-ink-3 uppercase">
                    <th className="px-6 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5">Plan</th>
                    <th className="px-4 py-2.5 text-right">Credits</th>
                    <th className="px-6 py-2.5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.users.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-panel-2">
                      <td className="px-6 py-3 font-medium text-ink-1">{u.name}</td>
                      <td className="px-4 py-3 text-ink-2">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge tone={u.role === "admin" ? "accent" : "neutral"}>
                          {u.role ?? "user"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={u.plan === "pro" ? "accent" : "neutral"}>
                          {u.plan ?? "free"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink-2">{u.credits}</td>
                      <td className="px-6 py-3 text-ink-3">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
