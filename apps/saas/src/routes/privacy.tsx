import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "#/components/site-header";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <SiteHeader />
      <main className="page-in mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <p className="rise label-caps text-signal">Legal</p>
        <h1 className="rise stagger-1 mt-3 text-3xl font-semibold tracking-tight text-ink-1 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-ink-3">Last updated: November 14, 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-2">
          <section>
            <h2 className="font-semibold text-ink-1">What we collect</h2>
            <p className="mt-2">
              When you create an account, we store your email address, name, and a hashed password.
              If you sign in with Google, we receive your Google profile information. We also store
              your subscription status and credit balance.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink-1">What we do with it</h2>
            <p className="mt-2">
              We use your data to provide the service: authenticate you, process payments through
              Stripe, send transactional emails (welcome, receipts, password resets), and show your
              usage history. We do not sell your data to third parties.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink-1">Third parties</h2>
            <p className="mt-2">
              We use Stripe for payments, Resend for transactional email, and Cloudflare for
              hosting. Each has its own privacy policy.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-ink-1">Your rights</h2>
            <p className="mt-2">
              You can delete your account at any time from the settings page, which removes all
              associated data. You can also request a copy of your data by contacting us.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
