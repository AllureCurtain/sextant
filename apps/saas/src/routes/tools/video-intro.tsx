import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clapperboard, ArrowLeft, Check } from "lucide-react";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/tools/video-intro")({ component: VideoIntroTool });

/**
 * Honest "coming soon" — we are not shipping a fake video generator. The card
 * collects interest via the existing /api/waitlist endpoint (same as the
 * homepage form) so demand can be measured before building.
 */
function VideoIntroTool() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function notify(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "tool-video-intro" }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Something went wrong");
      setState("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All tools
        </Link>
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-coral-100 text-coral-600">
            <Clapperboard className="h-7 w-7" />
          </div>
          <span className="mt-5 rounded-full bg-coral-100 px-2.5 py-0.5 text-[11px] font-medium text-coral-600">
            Coming soon
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
            Video intro generator
          </h1>
          <p className="mt-3 max-w-md text-ink-2">
            Animated title cards for product videos and demos — we haven't built this one yet. The
            other tools run fully in the browser; a video tool needs a render pipeline, so we're
            gauging interest first.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-sm rounded-xl border border-border bg-panel p-6 shadow-xs">
          {state === "done" ? (
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-accent-700">
              <Check className="h-4 w-4" /> We'll let you know when it ships.
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-ink-1">Want it? Leave your email.</p>
              <form onSubmit={notify} className="mt-3 flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-9 flex-1 rounded-lg border border-border-strong bg-panel px-3 text-sm text-ink-1 placeholder:text-ink-3 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={state === "busy" || !email.trim()}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-600 px-3.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-700 disabled:opacity-50"
                >
                  {state === "busy" ? "Saving…" : "Notify me"}
                </button>
              </form>
              {error && <p className="mt-2 text-sm text-down">{error}</p>}
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-ink-3">In the meantime, two working tools:</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <Link
              to="/tools/og-image"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border-strong bg-panel px-4 text-sm font-medium text-ink-1 shadow-xs transition-colors hover:bg-panel-2"
            >
              OG image generator
            </Link>
            <Link
              to="/tools/logo-icon"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border-strong bg-panel px-4 text-sm font-medium text-ink-1 shadow-xs transition-colors hover:bg-panel-2"
            >
              Logo icon generator
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
