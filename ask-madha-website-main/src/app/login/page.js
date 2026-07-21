"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, FlameIcon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInLoading, error, clearError, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (user) {
      router.replace("/chat");
    }
  }, [user, router]);

  const displayError = localError || error;

  const handleSignIn = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!email.trim() || !password) {
        setLocalError("Please enter your email and password.");
        return;
      }
      setLocalError(null);
      const { error } = await signIn(email, password);
      if (!error) {
        router.replace("/chat");
      }
    },
    [email, password, signIn, router]
  );

  const handleForgotPassword = useCallback(async () => {
    if (!email.trim()) {
      setLocalError("Please enter your email address first to receive a reset link.");
      return;
    }
    setLocalError(null);
    router.push(`/forgot-password?email=${encodeURIComponent(email.trim())}`);
  }, [email, router]);

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
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue your spiritual journey
          </p>
        </div>

        <form
          onSubmit={handleSignIn}
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (displayError) {
                    clearError();
                    setLocalError(null);
                  }
                }}
                autoComplete="current-password"
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

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={signInLoading}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={signInLoading}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg gradient-bg px-6 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {signInLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Sign In"
            )}
          </button>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              onClick={() => clearError()}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
