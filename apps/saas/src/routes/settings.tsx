import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Copy,
  KeyRound,
  Trash2,
  Upload,
  Download,
  FileIcon,
  UserRound,
  TriangleAlert,
} from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { useApiKeys, useUsageEvents, useFiles } from "#/lib/api";
import { AppShell } from "#/components/app-shell";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { cn } from "#/lib/utils";
import type { CreateKeyResponse } from "#/server/api";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

type SettingsTab = "profile" | "api-keys" | "files" | "usage";

const TABS: { key: SettingsTab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "api-keys", label: "API Keys" },
  { key: "files", label: "Files" },
  { key: "usage", label: "Usage" },
];

function SettingsPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [tab, setTab] = useState<SettingsTab>("profile");

  useEffect(() => {
    if (!isPending && !session) navigate({ to: "/login" });
  }, [isPending, session, navigate]);

  if (isPending || !session) {
    return <main className="mx-auto max-w-3xl px-4 py-24 text-center text-ink-3">Loading…</main>;
  }

  return (
    <AppShell active="settings" title="Settings" email={session.user.email}>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-1">Settings</h1>
          <p className="mt-1 text-sm text-ink-3">Profile, API keys, files, and usage history.</p>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="mt-6 border-b border-border" role="tablist" aria-label="Settings sections">
        <div className="-mb-px flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-accent-600 text-ink-1"
                  : "border-transparent text-ink-3 hover:border-border-strong hover:text-ink-1",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "api-keys" && <ApiKeysTab />}
      {tab === "files" && <FilesTab />}
      {tab === "usage" && <UsageTab />}
    </AppShell>
  );
}

/* ── Profile ─────────────────────────────────────────────────────────── */

function ProfileTab() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  if (!user) return null;

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameBusy(true);
    setNameMessage(null);
    setNameSaved(false);
    try {
      const { error } = await authClient.updateUser({ name: name.trim() });
      if (error) {
        setNameMessage(error.message ?? "Failed to update name");
        return;
      }
      setNameSaved(true);
    } finally {
      setNameBusy(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwBusy(true);
    setPwMessage(null);
    setPwSaved(false);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        setPwMessage(error.message ?? "Failed to change password");
        return;
      }
      setPwSaved(true);
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setPwBusy(false);
    }
  }

  async function deleteAccount() {
    setDeleteBusy(true);
    setDeleteMessage(null);
    try {
      const { error } = await authClient.deleteUser();
      if (error) {
        setDeleteMessage(error.message ?? "Failed to delete account");
        setDeleteBusy(false);
        return;
      }
      navigate({ to: "/" });
    } catch {
      setDeleteMessage("Failed to delete account");
      setDeleteBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-wide text-ink-3 uppercase">Email</dt>
              <dd className="mt-1 flex items-center gap-2 text-ink-1">
                {user.email}
                {user.emailVerified ? (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-700">
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-panel-2 px-2 py-0.5 text-xs font-medium text-ink-3">
                    Unverified
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-ink-3 uppercase">
                Member since
              </dt>
              <dd className="mt-1 text-ink-1">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          <form onSubmit={saveName} className="flex items-end gap-3 border-t border-border pt-5">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="profile-name">Display name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={64}
                required
              />
            </div>
            <Button type="submit" variant="primary" disabled={nameBusy || !name.trim()}>
              <UserRound className="h-4 w-4" />
              {nameBusy ? "Saving…" : "Save"}
            </Button>
          </form>
          {nameMessage && <p className="text-sm text-down">{nameMessage}</p>}
          {nameSaved && <p className="text-sm text-up">Name updated.</p>}
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Signs out your other sessions when the password changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={pwBusy || !currentPassword || newPassword.length < 8}
            >
              {pwBusy ? "Changing…" : "Change password"}
            </Button>
            {pwMessage && <p className="text-sm text-down">{pwMessage}</p>}
            {pwSaved && <p className="text-sm text-up">Password changed.</p>}
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-down/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-down">
            <TriangleAlert className="h-4 w-4" /> Danger zone
          </CardTitle>
          <CardDescription>
            Deleting your account is permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!confirmDelete ? (
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" /> Delete account
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="destructive" onClick={deleteAccount} disabled={deleteBusy}>
                {deleteBusy ? "Deleting…" : "Yes, delete my account"}
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          )}
          {deleteMessage && <p className="text-sm text-down">{deleteMessage}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── API keys ─────────────────────────────────────────────────────────── */

function ApiKeysTab() {
  const queryClient = useQueryClient();
  const { data: keysData, isLoading: keysLoading } = useApiKeys();

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<CreateKeyResponse | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = (await res.json()) as CreateKeyResponse & { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Failed to create key");
        return;
      }
      setNewKey(data);
      setName("");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } finally {
      setBusy(false);
    }
  }

  async function revokeKey(id: string) {
    setRevoking(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setMessage(data.error ?? "Failed to revoke key");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    } finally {
      setRevoking(null);
    }
  }

  const keys = keysData?.keys ?? [];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>API keys</CardTitle>
        <CardDescription>
          Call the API with <code className="text-xs">Authorization: Bearer sk_live_…</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={createKey} className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="key-name">Key name</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CI pipeline"
              maxLength={64}
              required
            />
          </div>
          <Button type="submit" variant="primary" disabled={busy || !name.trim()}>
            <KeyRound className="h-4 w-4" />
            {busy ? "Creating…" : "Create key"}
          </Button>
        </form>

        {newKey && (
          <div className="rounded-lg border border-accent-600/30 bg-accent-soft p-4">
            <p className="text-xs font-medium tracking-wide text-accent-700 uppercase">
              New key — copy it now, it won't be shown again
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-md bg-panel px-3 py-2 font-mono text-sm text-ink-1">
                {newKey.key}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard?.writeText(newKey.key)}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </div>
        )}

        {message && <p className="text-sm text-down">{message}</p>}

        {keysLoading && <p className="text-sm text-ink-3">Loading keys…</p>}
        {!keysLoading && keys.length === 0 && (
          <p className="text-sm text-ink-3">No API keys yet.</p>
        )}
        {keys.length > 0 && (
          <div className="-mx-6 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y border-border bg-panel-2 text-left text-xs font-medium tracking-wide text-ink-3 uppercase">
                  <th className="px-6 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Prefix</th>
                  <th className="px-4 py-2.5">Created</th>
                  <th className="px-4 py-2.5">Last used</th>
                  <th className="px-6 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {keys.map((k) => (
                  <tr key={k.id} className="transition-colors hover:bg-panel-2">
                    <td className="px-6 py-3 font-medium text-ink-1">{k.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-2">{k.prefix}…</td>
                    <td className="px-4 py-3 text-ink-3">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-ink-3">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {k.revokedAt ? (
                        <span className="text-xs text-ink-3">Revoked</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeKey(k.id)}
                          disabled={revoking === k.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {revoking === k.id ? "Revoking…" : "Revoke"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Files ────────────────────────────────────────────────────────────── */

function FilesTab() {
  const queryClient = useQueryClient();
  const { data: filesData, isLoading: filesLoading } = useFiles();

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/files/upload", { method: "POST", body: form });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Upload failed");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["files"] });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function deleteFile(id: string) {
    setDeleting(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setMessage(data.error ?? "Failed to delete file");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["files"] });
    } finally {
      setDeleting(null);
    }
  }

  const files = filesData?.files ?? [];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Files</CardTitle>
        <CardDescription>Stored in Cloudflare R2, 10 MB max per file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-strong bg-panel px-4 py-2 text-sm font-medium text-ink-1 shadow-xs transition-all duration-150 hover:-translate-y-px hover:bg-panel-2">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload file"}
            <input type="file" className="hidden" onChange={uploadFile} disabled={uploading} />
          </label>
          {message && <p className="text-sm text-down">{message}</p>}
        </div>

        {filesLoading && <p className="text-sm text-ink-3">Loading files…</p>}
        {!filesLoading && files.length === 0 && (
          <p className="text-sm text-ink-3">No files uploaded yet.</p>
        )}
        {files.length > 0 && (
          <div className="-mx-6 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-y border-border bg-panel-2 text-left text-xs font-medium tracking-wide text-ink-3 uppercase">
                  <th className="px-6 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5 text-right">Size</th>
                  <th className="px-4 py-2.5">Uploaded</th>
                  <th className="px-6 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {files.map((f) => (
                  <tr key={f.id} className="transition-colors hover:bg-panel-2">
                    <td className="px-6 py-3 font-medium text-ink-1">
                      <span className="flex items-center gap-2">
                        <FileIcon className="h-3.5 w-3.5 text-ink-3" />
                        {f.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-2">{f.contentType}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-2">
                      {f.sizeBytes < 1024
                        ? `${f.sizeBytes} B`
                        : f.sizeBytes < 1024 * 1024
                          ? `${(f.sizeBytes / 1024).toFixed(1)} KB`
                          : `${(f.sizeBytes / (1024 * 1024)).toFixed(1)} MB`}
                    </td>
                    <td className="px-4 py-3 text-ink-3">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/api/files/${f.id}/download`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(f.id)}
                          disabled={deleting === f.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deleting === f.id ? "Deleting…" : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Usage ────────────────────────────────────────────────────────────── */

function UsageTab() {
  const { data: usageData, isLoading: usageLoading } = useUsageEvents();
  const events = usageData?.events ?? [];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Usage history</CardTitle>
        <CardDescription>Last 50 credit-consuming actions</CardDescription>
      </CardHeader>
      <CardContent>
        {usageLoading && <p className="text-sm text-ink-3">Loading usage…</p>}
        {!usageLoading && events.length === 0 && (
          <p className="text-sm text-ink-3">No usage recorded yet.</p>
        )}
        {events.length > 0 && (
          <div className="-mx-6 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-y border-border bg-panel-2 text-left text-xs font-medium tracking-wide text-ink-3 uppercase">
                  <th className="px-6 py-2.5">Action</th>
                  <th className="px-4 py-2.5 text-right">Credits</th>
                  <th className="px-6 py-2.5">Date</th>
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
      </CardContent>
    </Card>
  );
}
