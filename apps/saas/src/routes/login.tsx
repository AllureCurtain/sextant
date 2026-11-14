import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Github } from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { useAppConfig } from "#/lib/api";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";

export const Route = createFileRoute("/login")({ component: Login });

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type LoginValues = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const { data: config } = useAppConfig();
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const googleEnabled = config?.googleOAuth === true;
  const githubEnabled = config?.githubOAuth === true;

  async function onSubmit(values: LoginValues) {
    setError(null);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setError(error.message ?? "Invalid email or password");
      return;
    }
    navigate({ to: "/dashboard" });
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  async function signInWithGithub() {
    setGithubLoading(true);
    await authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" });
  }

  return (
    <main className="hero-band relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_20%_0%,var(--hb-glow-a),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_90%_100%,var(--hb-glow-b),transparent_70%)]"
      />

      {/* Top bar */}
      <div className="relative z-10 flex h-14 items-center justify-between px-4 sm:px-8">
        <Link
          to="/"
          className="hb-ink-1 text-[15px] font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          Sextant
        </Link>
        <p className="hb-ink-3 text-sm">
          No account?{" "}
          <Link
            to="/signup"
            className="hb-ink-1 font-medium underline decoration-[var(--hb-ink-3)] underline-offset-2 hover:opacity-80"
          >
            Sign up
          </Link>
        </p>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-4xl flex-1 items-center gap-10 px-4 py-12 lg:grid-cols-2">
        {/* Brand pitch — hidden on small screens */}
        <div className="hidden lg:block">
          <p className="hb-panel hb-border hb-ink-2 inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium">
            Cloudflare-native SaaS starter
          </p>
          <h1 className="hb-ink-1 mt-6 text-4xl font-bold tracking-[-0.03em] leading-[1.05] sm:text-5xl">
            Ship your SaaS
            <br />
            on the edge.
          </h1>
          <p className="hb-ink-2 mt-5 max-w-sm text-base leading-relaxed">
            Auth, billing, credits, AI playground, and file storage already wired up on Cloudflare
            Workers. Log in to pick up where you left off.
          </p>
          <ul className="mt-8 space-y-2.5">
            {["D1 + Drizzle database", "Stripe test-mode billing", "Workers AI playground"].map(
              (x) => (
                <li key={x} className="hb-ink-2 flex items-center gap-2.5 text-sm">
                  <span className="hb-panel h-1.5 w-1.5 rounded-full" />
                  {x}
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Form card */}
        <Card className="page-in mx-auto w-full max-w-sm border-border bg-panel">
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email && <p className="text-xs text-down">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-ink-3 underline decoration-border-strong underline-offset-2 transition-colors hover:text-ink-1"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && <p className="text-xs text-down">{errors.password.message}</p>}
              </div>
              {error && <p className="text-sm text-down">{error}</p>}
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in…" : "Log in"}
              </Button>
              <div className="flex w-full items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-ink-3">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={signInWithGoogle}
                disabled={googleLoading || !googleEnabled}
                title={
                  googleEnabled
                    ? undefined
                    : "Google OAuth is not configured — set GOOGLE_CLIENT_ID/SECRET in .dev.vars"
                }
              >
                {googleLoading ? "Redirecting…" : "Continue with Google"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={signInWithGithub}
                disabled={githubLoading || !githubEnabled}
                title={
                  githubEnabled
                    ? undefined
                    : "GitHub OAuth is not configured — set GITHUB_CLIENT_ID/SECRET in .dev.vars"
                }
              >
                <Github className="h-4 w-4" />
                {githubLoading ? "Redirecting…" : "Continue with GitHub"}
              </Button>
              {!googleEnabled && !githubEnabled && config && (
                <p className="text-center text-xs text-ink-3">
                  Social sign-in not configured — set <code>GOOGLE_CLIENT_ID/SECRET</code> and/or{" "}
                  <code>GITHUB_CLIENT_ID/SECRET</code> in <code>.dev.vars</code>.
                </p>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
