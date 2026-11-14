import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <p className="rise label-caps text-signal">Legal</p>
        <h1 className="rise stagger-1 mt-3 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-ink-3">Last updated: November 14, 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-2">
          <section>
            <h2 className="font-semibold text-ink-1">The service</h2>
            <p className="mt-2">
              Sextant is an open-source template for building SaaS applications. The hosted instance
              is a demonstration. The template itself is provided under the MIT license.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink-1">Accounts</h2>
            <p className="mt-2">
              You must provide accurate information when creating an account. You are responsible
              for keeping your credentials secure. You can delete your account at any time.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink-1">Payments</h2>
            <p className="mt-2">
              The hosted instance uses Stripe in test mode. No real charges are made. If you deploy
              your own instance, you are responsible for your own payment configuration and
              compliance.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink-1">Acceptable use</h2>
            <p className="mt-2">
              Do not use the service to spam, abuse the API, or violate any laws. We may suspend
              accounts that abuse the service.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink-1">Liability</h2>
            <p className="mt-2">
              The software is provided "as is" without warranty. We are not liable for any damages
              arising from its use.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
