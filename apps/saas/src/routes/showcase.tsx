import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/showcase")({ component: Showcase });

type Site = {
  name: string;
  description: string;
  tags: string[];
  gradient: string;
};

const SITES: Site[] = [
  {
    name: "Meridian Analytics",
    description:
      "Product analytics dashboard for B2B SaaS — funnels, retention, and revenue reports.",
    tags: ["analytics", "dashboard"],
    gradient: "from-[#1c1917] via-[#44403c] to-[#0c0a09]",
  },
  {
    name: "Loop & Co.",
    description: "Subscription management for indie makers — plans, invoicing, and churn alerts.",
    tags: ["billing", "indie"],
    gradient: "from-[#6d64f0] via-[#574bd9] to-[#292524]",
  },
  {
    name: "Fieldnotes",
    description:
      "A public knowledge base powered by the content site — 200 keyword pages, Pagefind search.",
    tags: ["content", "seo"],
    gradient: "from-[#44403c] via-[#292524] to-[#1c1917]",
  },
  {
    name: "Ocratra",
    description: "AI-assisted document review — uploads to R2, credits consumed per page analyzed.",
    tags: ["ai", "credits"],
    gradient: "from-[#57534e] via-[#6d64f0] to-[#574bd9]",
  },
];

function Showcase() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-5xl flex-1 px-4 py-16">
        <div className="mb-10 max-w-xl">
          <p className="rise label-caps text-signal">Showcase</p>
          <h1 className="rise stagger-1 mt-2 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
            Built with Sextant
          </h1>
          <p className="rise stagger-2 mt-3 text-ink-2">
            Demo showcase — replace these cards with your projects when you ship.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {SITES.map((site) => (
            <div
              key={site.name}
              className="group overflow-hidden rounded-xl border border-border bg-panel shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Gradient placeholder for a screenshot */}
              <div
                aria-hidden="true"
                className={`relative h-44 bg-gradient-to-br ${site.gradient}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-semibold tracking-tight text-white/20">
                    {site.name}
                  </span>
                </div>
                <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-base font-semibold tracking-tight text-ink-1">{site.name}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{site.description}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  {site.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
