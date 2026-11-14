import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <p className="rise label-caps text-signal">About</p>
        <h1 className="rise stagger-1 mt-3 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
          About Sextant
        </h1>
        <div className="mt-8 space-y-4 text-ink-2 leading-relaxed">
          <p>
            Sextant is a Cloudflare-native template for building outbound sites fast. One repo, two
            decoupled apps, shared plumbing.
          </p>
          <p>
            The content site is a generated GEO/content machine — every keyword becomes an overview
            page and a Q&amp;A tuned for search engines and AI answers. The SaaS app is a working
            tool with sign-up, login, Stripe billing, usage credits, and an admin console.
          </p>
          <p>
            Both deploy independently to Cloudflare Workers. No servers to manage, no infrastructure
            to babysit.
          </p>
          <p>
            Built with TanStack Start, Astro, Tailwind CSS v4, and Drizzle ORM. Open source under
            the MIT license.
          </p>
        </div>
      </main>
    </div>
  );
}
