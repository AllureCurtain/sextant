import { createFileRoute } from "@tanstack/react-router";
import { GitCommitHorizontal } from "lucide-react";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/commits")({ component: Commits });

type Commit = {
  hash: string;
  message: string;
  date: string;
};

/**
 * The list is generated at build time by `scripts/generate-commits.mjs`
 * (predev/prebuild) — a Worker cannot shell out to `git`, so the data is
 * baked into the bundle as src/data/commits.json. The glob keeps the route
 * working (with an empty state) when the file hasn't been generated yet.
 */
const files = import.meta.glob("../data/commits.json", {
  eager: true,
  import: "default",
}) as Record<string, Commit[]>;

const COMMITS: Commit[] = Object.values(files)[0] ?? [];

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return seconds === 0 ? "just now" : `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365.25);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function Commits() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <div className="mb-10">
          <p className="rise label-caps text-signal">Commits</p>
          <h1 className="rise stagger-1 mt-2 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
            Recent activity
          </h1>
          <p className="rise stagger-2 mt-3 text-ink-2">
            {COMMITS.length > 0
              ? `The last ${COMMITS.length} commits to this repo, generated at build time.`
              : "Recent commits to this repo, generated at build time."}
          </p>
        </div>
        {COMMITS.length === 0 ? (
          <div className="rounded-xl border border-border bg-panel p-6 text-center shadow-xs">
            <p className="text-sm text-ink-2">
              No commits found. Run{" "}
              <code className="rounded-sm border border-border bg-panel-2 px-1.5 py-0.5 text-xs">
                pnpm generate:commits
              </code>{" "}
              to populate this page.
            </p>
          </div>
        ) : (
          <ol className="relative space-y-6 border-l border-border pl-8">
            {COMMITS.map((commit) => (
              <li key={commit.hash} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-1 -left-[39px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-page bg-panel"
                >
                  <GitCommitHorizontal className="h-2.5 w-2.5 text-accent-600" />
                </span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <code className="rounded-sm border border-border bg-panel-2 px-1.5 py-0.5 font-mono text-xs text-accent-700">
                    {commit.hash}
                  </code>
                  <time dateTime={commit.date} className="text-xs text-ink-3">
                    {relativeTime(commit.date)}
                  </time>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-1">{commit.message}</p>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
