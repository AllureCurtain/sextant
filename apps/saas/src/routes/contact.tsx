import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "#/components/site-header";
import { Mail, MessageSquare, Github } from "lucide-react";

export const Route = createFileRoute("/contact")({ component: Contact });

const CHANNELS = [
  {
    icon: Mail,
    title: "Email",
    description: "support@example.com",
    href: "mailto:support@example.com",
  },
  {
    icon: MessageSquare,
    title: "Discord",
    description: "Join the community",
    href: "https://discord.gg/REPLACE_ME",
  },
  {
    icon: Github,
    title: "GitHub",
    description: "Open an issue or PR",
    href: "https://github.com/REPLACE_ME/sextant",
  },
];

function Contact() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <p className="rise label-caps text-signal">Contact</p>
        <h1 className="rise stagger-1 mt-3 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-4 text-ink-2">
          Questions about the template, deployment, or customization? Reach out through any of these
          channels.
        </p>
        <div className="mt-10 grid gap-4">
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="group flex items-center gap-4 rounded-xl border border-border bg-panel p-5 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent-600">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-ink-1">{c.title}</p>
                <p className="text-sm text-ink-3">{c.description}</p>
              </div>
              <span
                aria-hidden="true"
                className="ml-auto text-ink-3 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-signal"
              >
                →
              </span>
            </a>
          ))}
        </div>
        <p className="mt-8 text-sm text-ink-3">
          For security issues, email{" "}
          <a
            className="font-medium text-accent-700 underline decoration-accent-200 underline-offset-2 transition-colors hover:text-accent-800"
            href="mailto:security@example.com"
          >
            security@example.com
          </a>{" "}
          instead of posting publicly.
        </p>
      </main>
    </div>
  );
}
