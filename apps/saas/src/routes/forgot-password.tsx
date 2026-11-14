import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";
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

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Values = z.infer<typeof schema>;

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setError(null);
    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message ?? "Could not send reset email");
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page px-4 py-16">
      <Link
        to="/"
        className="mb-6 text-[15px] font-semibold tracking-tight text-ink-1 transition-colors hover:text-accent-700"
      >
        Sextant
      </Link>
      <Card className="page-in w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>We&apos;ll email you a reset link</CardDescription>
        </CardHeader>
        {sent ? (
          <CardContent>
            <p className="text-sm text-ink-2">
              If an account exists for that email, a reset link is on its way.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email && <p className="text-xs text-down">{errors.email.message}</p>}
              </div>
              {error && <p className="text-sm text-down">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send reset link"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
      <p className="mt-4 text-center text-sm text-ink-3">
        <Link
          to="/login"
          className="font-medium text-accent-700 underline decoration-accent-200 underline-offset-2 transition-colors hover:text-accent-800"
        >
          Back to login
        </Link>
      </p>
    </main>
  );
}
