"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { MailIcon } from "@/components/icons";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const { resetPassword, resetPasswordLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const displayError = localError || error;

  const handleReset = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!email.trim()) {
        setLocalError("Please enter your email address.");
        return;
      }
      setLocalError(null);
      const { error } = await resetPassword(email);
      if (!error) {
        setSent(true);
      }
    },
    [email, resetPassword]
  );

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border glass p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
              <MailIcon className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold gradient-text">Check your email</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We sent a password reset link to <strong className="text-foreground">{email}</strong>.
              Follow the link in the email to reset your password.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg gradient-bg px-6 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Image
              src="/assets/logo.png"
              alt="Ask Madha"
              width={40}
              height={40}
              className="rounded-lg"
              priority
            />
            <span className="text-xl font-semibold tracking-tight text-foreground">
              Ask Madha
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form
          onSubmit={handleReset}
          className="rounded-2xl border border-border glass p-6 shadow-sm sm:p-8"
        >
          {displayError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {displayError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-card-foreground">
              Email
            </label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (displayError) {
                    clearError();
                    setLocalError(null);
                  }
                }}
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={resetPasswordLoading}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg gradient-bg px-6 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {resetPasswordLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Send Reset Link"
            )}
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              onClick={() => clearError()}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
