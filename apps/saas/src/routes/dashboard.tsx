import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Sparkles, CreditCard, KeyRound, FileUp, Settings, ArrowRight } from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { useEntitlement, useUsageEvents } from "#/lib/api";
import { AppShell } from "#/components/app-shell";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function KpiTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5 shadow-xs">
      <p className="text-xs font-medium tracking-wide text-ink-3 uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink-1 tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const { data: entitlement, refetch } = useEntitlement();
  const { data: usageData, isLoading: usageLoading } = useUsageEvents();
  const [busy, setBusy] = useState<"consume" | "portal" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) navigate({ to: "/login" });
  }, [isPending, session, navigate]);

  if (isPending || !session) {
    return <main className="mx-auto max-w-3xl px-4 py-24 text-center text-ink-3">Loading…</main>;
  }

  async function consumeCredit() {
    setBusy("consume");
    setMessage(null);
    try {
      const res = await fetch("/api/credits/consume", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; credits?: number; error?: string };
      if (!res.ok) {
        setMessage(
          data.error === "insufficient credits"
            ? "No credits left. Upgrade to get more."
            : (data.error ?? "Failed"),
        );
      } else {
        setMessage(`Action used. ${data.credits} credit${data.credits === 1 ? "" : "s"} left.`);
        refetch();
        queryClient.invalidateQueries({ queryKey: ["entitlement"] });
        queryClient.invalidateQueries({ queryKey: ["usage-events"] });
      }
    } finally {
      setBusy(null);
    }
  }

  async function openBillingPortal() {
    setBusy("portal");
    setMessage(null);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setMessage(data.error ?? "No billing account yet");
        setBusy(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setMessage("Could not open billing portal");
      setBusy(null);
    }
  }

  const plan = entitlement?.plan ?? "free";
  const credits = entitlement?.credits ?? 0;
  const events = (usageData?.events ?? []).slice(0, 8);
  const totalUsed = events.reduce((s, e) => s + e.creditsUsed, 0);

  return (
    <AppShell active="dashboard" title="Dashboard" email={session.user.email}>
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiTile label="Credits" value={String(credits)} hint="Remaining this cycle" />
        <KpiTile
          label="Plan"
          value={plan === "pro" ? "Pro" : "Free"}
          hint={plan === "pro" ? "Active subscription" : "Upgrade for more"}
        />
        <KpiTile label="Status" value={entitlement?.status ?? "free"} hint="Entitlement status" />
        <KpiTile
          label="Account"
          value={session.user.emailVerified ? "Verified" : "Pending"}
          hint="Email verification"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Paywalled action</CardTitle>
            <CardDescription>Consumes 1 credit per run</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="primary" onClick={consumeCredit} disabled={busy === "consume"}>
              <Sparkles className="h-4 w-4" />
              {busy === "consume" ? "Working…" : "Run action"}
            </Button>
            {message && <p className="text-sm text-ink-2">{message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Manage your subscription in the Stripe portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={openBillingPortal} disabled={busy === "portal"}>
              <CreditCard className="h-4 w-4" />
              {busy === "portal" ? "Opening…" : "Manage billing"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick actions ───────────────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Jump to the parts of the app you actually use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to="/settings"
              className="group flex items-center gap-3 rounded-lg border border-border bg-panel-2 px-4 py-3 transition-all duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent-600">
                <KeyRound className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-1">API keys</p>
                <p className="text-xs text-ink-3">Create or revoke</p>
              </div>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-ink-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/settings"
              className="group flex items-center gap-3 rounded-lg border border-border bg-panel-2 px-4 py-3 transition-all duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-coral-100 text-coral-600">
                <FileUp className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-1">Files</p>
                <p className="text-xs text-ink-3">Upload &amp; manage</p>
              </div>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-ink-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/settings"
              className="group flex items-center gap-3 rounded-lg border border-border bg-panel-2 px-4 py-3 transition-all duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-panel-2 text-ink-2">
                <Settings className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-1">Settings</p>
                <p className="text-xs text-ink-3">Usage history</p>
              </div>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-ink-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── Recent activity ─────────────────────────────────────── */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest credit-consuming actions</CardDescription>
            </div>
            {events.length > 0 && (
              <Link
                to="/settings"
                className="text-xs font-medium text-accent-700 transition-colors hover:text-accent-800"
              >
                View all →
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {usageLoading && <p className="text-sm text-ink-3">Loading…</p>}
          {!usageLoading && events.length === 0 && (
            <div className="flex flex-col items-center py-6 text-center">
              <p className="text-sm text-ink-3">No activity yet.</p>
              <p className="mt-1 text-xs text-ink-3">
                Run the paywalled action to see your first event here.
              </p>
            </div>
          )}
          {events.length > 0 && (
            <div className="-mx-6 overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-y border-border bg-panel-2 text-left text-xs font-medium tracking-wide text-ink-3 uppercase">
                    <th className="px-6 py-2.5">Action</th>
                    <th className="px-4 py-2.5 text-right">Credits</th>
                    <th className="px-6 py-2.5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.map((e) => (
                    <tr key={e.id} className="transition-colors hover:bg-panel-2">
                      <td className="px-6 py-3 font-medium text-ink-1">{e.action}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                        {e.creditsUsed}
                      </td>
                      <td className="px-6 py-3 text-ink-3">
                        {new Date(e.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalUsed > 0 && (
            <p className="mt-3 text-xs text-ink-3">
              {totalUsed} credit{totalUsed === 1 ? "" : "s"} used in the last {events.length}{" "}
              actions
            </p>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
