"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, FlameIcon } from "@/components/icons";

const MIN_PASSWORD_LENGTH = 8;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signUpLoading, error, clearError, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (user) {
      router.replace("/chat");
    }
  }, [user, router]);

  const displayError = localError || error;

  const handleSignUp = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!email.trim() || !password || !confirmPassword) {
        setLocalError("Please fill in all fields.");
        return;
      }
      if (!validateEmail(email.trim())) {
        setLocalError("Please enter a valid email address.");
        return;
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        setLocalError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
        return;
      }
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }
      setLocalError(null);
      const { error, needsConfirmation } = await signUp(email, password);
      if (error) {
        return;
      }
      if (needsConfirmation) {
        setPassword("");
        setConfirmPassword("");
        setSuccessMessage(
          "We sent you a confirmation link. Please verify your email to complete registration."
        );
      } else {
        router.replace("/chat");
      }
    },
    [email, password, confirmPassword, signUp, router]
  );

  if (successMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border glass p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
              <MailIcon className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold gradient-text">Check your email</h2>
            <p className="mt-3 text-sm text-muted-foreground">{successMessage}</p>
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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-bg">
            <FlameIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Ask Madha to begin your spiritual journey
          </p>
        </div>

        <form
          onSubmit={handleSignUp}
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

          <div className="mt-4 space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-card-foreground">
              Password
            </label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (displayError) {
                    clearError();
                    setLocalError(null);
                  }
                }}
                autoComplete="new-password"
                className="w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-card-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (displayError) {
                    clearError();
                    setLocalError(null);
                  }
                }}
                autoComplete="new-password"
                className="w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={signUpLoading}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg gradient-bg px-6 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {signUpLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Sign Up"
            )}
          </button>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
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
