import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
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

const searchSchema = (search: Record<string, unknown>): { token?: string; error?: string } => ({
  token: typeof search.token === "string" ? search.token : undefined,
  error: typeof search.error === "string" ? search.error : undefined,
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: searchSchema,
  component: ResetPassword,
});

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm: z.string(),
});
type Values = z.infer<typeof schema>;

function ResetPassword() {
  const { token, error: linkError } = useSearch({ from: "/reset-password" });
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setError(null);
    if (values.password !== values.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Missing reset token");
      return;
    }
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });
    if (error) {
      setError(error.message ?? "Could not reset password");
      return;
    }
    navigate({ to: "/login" });
  }

  const invalid = Boolean(linkError) || !token;

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
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Choose a new password for your account</CardDescription>
        </CardHeader>
        {invalid ? (
          <CardContent>
            <p className="text-sm text-ink-2">
              This reset link is invalid or has expired.{" "}
              <Link
                to="/forgot-password"
                className="font-medium text-accent-700 underline decoration-accent-200 underline-offset-2 transition-colors hover:text-accent-800"
              >
                Request a new one
              </Link>
              .
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                />
                {errors.password && <p className="text-xs text-down">{errors.password.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirm")}
                />
              </div>
              {error && <p className="text-sm text-down">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Set password"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
}
