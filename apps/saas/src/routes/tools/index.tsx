import { createFileRoute, Link } from "@tanstack/react-router";
import { Image, Shapes, Clapperboard, ArrowRight } from "lucide-react";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/tools/")({ component: Tools });

const TOOLS = [
  {
    to: "/tools/og-image",
    icon: Image,
    name: "OG image generator",
    description:
      "Compose a 1200×630 social card from a title, subtitle, and theme — then download it as a PNG. Everything runs in your browser.",
    status: "Free",
  },
  {
    to: "/tools/logo-icon",
    icon: Shapes,
    name: "Logo icon generator",
    description:
      "Turn a company name into a simple monogram icon: pick a shape and an accent color, download SVG or PNG.",
    status: "Free",
  },
  {
    to: "/tools/video-intro",
    icon: Clapperboard,
    name: "Video intro generator",
    description:
      "Animated title cards for product videos. Not built yet — tell us if you'd use it.",
    status: "Coming soon",
  },
] as const;

function Tools() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-5xl flex-1 px-4 py-16">
        <div className="mb-10 max-w-xl">
          <p className="rise label-caps text-signal">Free tools</p>
          <h1 className="rise stagger-1 mt-2 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
            Small tools, no sign-up
          </h1>
          <p className="rise stagger-2 mt-3 text-ink-2">
            A few client-side utilities that ship with the template. They run entirely in the
            browser — no credits, no account, nothing sent to a server.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.name}
              to={tool.to}
              className="group rounded-xl border border-border bg-panel p-5 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent-600">
                  <tool.icon className="h-4.5 w-4.5" />
                </div>
                <span
                  className={
                    tool.status === "Free"
                      ? "rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-700"
                      : "rounded-full bg-coral-100 px-2 py-0.5 text-[11px] font-medium text-coral-600"
                  }
                >
                  {tool.status}
                </span>
              </div>
              <h2 className="mt-4 text-sm font-semibold tracking-tight text-ink-1">{tool.name}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-700 transition-colors group-hover:text-accent-800">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
