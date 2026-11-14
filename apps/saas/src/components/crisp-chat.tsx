import { useEffect } from "react";

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

interface ConfigResponse {
  crisp?: string;
}

/**
 * Crisp Chat widget loader. Fetches `/api/config` once; when the deployment
 * has `CRISP_WEBSITE_ID` configured, injects the standard Crisp embed script.
 * Renders nothing and is a no-op when the integration is not configured.
 */
export function CrispChat() {
  useEffect(() => {
    let cancelled = false;
    let injected = false;

    async function load() {
      let id: string | undefined;
      try {
        const res = await fetch("/api/config");
        if (!res.ok) return;
        const config = (await res.json()) as ConfigResponse;
        id = typeof config.crisp === "string" ? config.crisp : undefined;
      } catch {
        return; // network error — chat is optional, fail silently
      }
      if (cancelled || !id) return;

      window.$crisp = window.$crisp ?? [];
      window.CRISP_WEBSITE_ID = id;
      const script = document.createElement("script");
      script.src = "https://client.crisp.chat/l.js";
      script.async = true;
      document.head.appendChild(script);
      injected = true;
    }

    load();

    return () => {
      cancelled = true;
      // Crisp keeps global state + DOM once loaded; we only guard against
      // injecting the script twice on remount.
      if (injected) {
        window.$crisp?.push(["do", "chat:hide"]);
      }
    };
  }, []);

  return null;
}
