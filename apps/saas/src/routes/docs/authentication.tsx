import { createFileRoute } from "@tanstack/react-router";
import { Code, DocsPageIntro, SectionHeading } from "./index";

export const Route = createFileRoute("/docs/authentication")({
  component: DocsAuthentication,
});

function DocsAuthentication() {
  return (
    <div className="min-w-0 max-w-2xl">
      <DocsPageIntro
        kicker="Docs"
        title="Authentication"
        blurb="Better Auth on D1: email/password, Google OAuth, sessions, password reset, and roles."
      />

      <section className="mt-14">
        <SectionHeading id="how-its-wired">How it's wired</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Sextant uses{" "}
          <a
            href="https://www.better-auth.com"
            className="font-medium text-accent-700 transition-colors hover:text-accent-800"
          >
            Better Auth
          </a>
          . The server config lives in{" "}
          <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs font-mono text-ink-1">
            src/server/auth.ts
          </code>{" "}
          and the browser client in{" "}
          <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs font-mono text-ink-1">
            src/lib/auth-client.ts
          </code>
          . All auth endpoints are served under{" "}
          <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs font-mono text-ink-1">
            /api/auth/*
          </code>{" "}
          by the Hono app.
        </p>
        <div className="mt-5">
          <Code>{`// src/server/auth.ts (simplified)
betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.PUBLIC_SITE_URL,
  database: drizzleAdapter(getDb(), { provider: "sqlite" }),
  emailAndPassword: { enabled: true, sendResetPassword },
  socialProviders: { google: { clientId, clientSecret } },
  plugins: [admin(), tanstackStartCookies()],
})`}</Code>
        </div>
        <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-2">
          <li>
            <strong className="font-medium text-ink-1">Session model</strong> — sessions are rows in
            the D1 <code className="font-mono text-xs">session</code> table, issued as an HTTP-only
            cookie. There is no JWT to validate; each request reads the session row through the
            Drizzle adapter.
          </li>
          <li>
            <strong className="font-medium text-ink-1">Cookie bridge</strong> —{" "}
            <code className="font-mono text-xs">tanstackStartCookies()</code> copies Better Auth's
            Set-Cookie headers into TanStack Start responses so sign-up and login work over SSR.
          </li>
          <li>
            <strong className="font-medium text-ink-1">Trusted origins</strong> —{" "}
            <code className="font-mono text-xs">PUBLIC_SITE_URL</code> plus localhost origins are
            allow-listed so OAuth callbacks work in dev and prod without extra config.
          </li>
        </ul>
      </section>

      <section className="mt-14">
        <SectionHeading id="google-oauth">Enabling Google OAuth</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Google sign-in is already wired; it activates as soon as the two env vars are set.
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              1. Create OAuth credentials
            </p>
            <p className="text-sm leading-relaxed text-ink-2">
              In{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                className="font-medium text-accent-700 transition-colors hover:text-accent-800"
              >
                Google Cloud Console → APIs &amp; Services → Credentials
              </a>
              , create an <em>OAuth client ID</em> of type <em>Web application</em>. If prompted,
              configure the OAuth consent screen first (External, fill in app name and support
              email).
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              2. Add redirect URIs
            </p>
            <p className="mb-2 text-sm leading-relaxed text-ink-2">
              Under <em>Authorized redirect URIs</em>, add both:
            </p>
            <Code>{`http://localhost:3000/api/auth/callback/google
https://sextant-saas.<subdomain>.workers.dev/api/auth/callback/google`}</Code>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              3. Set env vars
            </p>
            <Code>{`# apps/saas/.dev.vars
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...`}</Code>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              4. Sign in
            </p>
            <p className="text-sm leading-relaxed text-ink-2">
              The login page calls{" "}
              <code className="font-mono text-xs">
                authClient.signIn.social(&#123; provider: "google" &#125;)
              </code>
              . The OAuth account row lands in the{" "}
              <code className="font-mono text-xs">account</code> table linked to the{" "}
              <code className="font-mono text-xs">user</code> row.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading id="password-reset">Password reset flow</SectionHeading>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-2">
          <li>
            <code className="font-mono text-xs">/forgot-password</code> posts to Better Auth's{" "}
            <code className="font-mono text-xs">requestPasswordReset</code>, which invokes{" "}
            <code className="font-mono text-xs">sendResetPassword</code> in{" "}
            <code className="font-mono text-xs">src/server/auth.ts</code>.
          </li>
          <li>
            That calls <code className="font-mono text-xs">sendPasswordResetEmail</code> in{" "}
            <code className="font-mono text-xs">src/server/emails.ts</code>, which renders the{" "}
            <code className="font-mono text-xs">passwordResetEmail</code> template and queues the
            send with <code className="font-mono text-xs">ctx.waitUntil</code> — the HTTP response
            never waits on the email provider.
          </li>
          <li>
            The link lands on <code className="font-mono text-xs">/reset-password?token=...</code>,
            which calls <code className="font-mono text-xs">resetPassword</code>. Better Auth
            verifies the token from the <code className="font-mono text-xs">verification</code>{" "}
            table and updates the credential in the{" "}
            <code className="font-mono text-xs">account</code> table.
          </li>
        </ol>
      </section>

      <section className="mt-14">
        <SectionHeading id="admin-role">Admin role assignment</SectionHeading>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          The <code className="font-mono text-xs">admin()</code> plugin adds a{" "}
          <code className="font-mono text-xs">role</code> column to{" "}
          <code className="font-mono text-xs">user</code> plus{" "}
          <code className="font-mono text-xs">/api/auth/admin/*</code> endpoints. The admin console
          at <code className="font-mono text-xs">/admin</code> is gated server-side — never trust a
          client-side role check alone.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Promote a user to admin by updating the row directly:
        </p>
        <div className="mt-4">
          <Code>{`# local dev
wrangler d1 execute DB --local --command \\
  "UPDATE user SET role = 'admin' WHERE email = 'you@example.com'"

# production
wrangler d1 execute DB --remote --command \\
  "UPDATE user SET role = 'admin' WHERE email = 'you@example.com'"`}</Code>
        </div>
      </section>
    </div>
  );
}
