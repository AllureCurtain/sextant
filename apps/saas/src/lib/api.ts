import { useQuery } from "@tanstack/react-query";
import type {
  AdminUserRow,
  ApiKeyRow,
  Entitlement,
  NotificationList,
  SessionPayload,
  UsageEventRow,
} from "#/server/api";

/** Fetch helpers for the app's own JSON API. Server validates the session. */

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { Accept: "application/json" } });
  const body = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body;
}

export function useSessionQuery() {
  return useQuery<SessionPayload>({
    queryKey: ["session"],
    queryFn: () => getJson<SessionPayload>("/api/session"),
    retry: false,
  });
}

export function useEntitlement() {
  return useQuery<Entitlement>({
    queryKey: ["entitlement"],
    queryFn: () => getJson<Entitlement>("/api/entitlement"),
    retry: false,
  });
}

export function useApiKeys() {
  return useQuery<{ keys: ApiKeyRow[] }>({
    queryKey: ["api-keys"],
    queryFn: () => getJson<{ keys: ApiKeyRow[] }>("/api/keys"),
    retry: false,
  });
}

export function useUsageEvents() {
  return useQuery<{ events: UsageEventRow[] }>({
    queryKey: ["usage-events"],
    queryFn: () => getJson<{ events: UsageEventRow[] }>("/api/usage"),
    retry: false,
  });
}

/** Polls the notification center every 30s — powers the topbar bell. */
export function useNotifications() {
  return useQuery<NotificationList>({
    queryKey: ["notifications"],
    queryFn: () => getJson<NotificationList>("/api/notifications"),
    refetchInterval: 30_000,
    retry: false,
  });
}

export interface AppConfig {
  googleOAuth: boolean;
  githubOAuth: boolean;
  stripe: boolean;
  resend: boolean;
  crisp: string | null;
  /** Public Stripe price ids keyed by plan, resolved server-side. */
  prices: { pro: string | null; creditPack: string | null };
}

export function useAppConfig() {
  return useQuery<AppConfig>({
    queryKey: ["app-config"],
    queryFn: () => getJson<AppConfig>("/api/config"),
    staleTime: 60_000,
    retry: false,
  });
}

export interface UserFileRow {
  id: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  createdAt: number;
}

export function useFiles() {
  return useQuery<{ files: UserFileRow[] }>({
    queryKey: ["files"],
    queryFn: () => getJson<{ files: UserFileRow[] }>("/api/files"),
    retry: false,
  });
}

export function useAdminUsers(enabled: boolean) {
  return useQuery<{ users: AdminUserRow[] }>({
    queryKey: ["admin-users"],
    queryFn: () => getJson<{ users: AdminUserRow[] }>("/api/admin/users"),
    enabled,
    retry: false,
  });
}
