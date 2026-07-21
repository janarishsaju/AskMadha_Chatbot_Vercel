"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/lib/AuthProvider";
import { getDailyVerse } from "@/lib/api";
import { BookOpenIcon, SparklesIcon } from "@/components/icons";

function BibleContent() {
  const { user } = useAuth();

  const [verse, setVerse] = useState(null);
  const [verseLoading, setVerseLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await getDailyVerse();
        if (!cancelled) setVerse(v);
      } catch (e) {
        console.warn("[bible] daily verse failed:", e);
      } finally {
        if (!cancelled) setVerseLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      <AppNavbar avatarUrl={user?.avatarUrl} displayName={user?.displayName} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
          {/* Page header */}
          <div className="mb-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">{today}</p>
            <h1 className="mt-2 text-3xl font-bold gradient-text">Verse of the Day</h1>
          </div>

          {verseLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">Loading today&apos;s verse...</p>
            </div>
          ) : verse ? (
            <div className="animate-[fade-in-up_0.5s_ease-out_forwards]">
              {/* Verse card */}
              <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
                {/* Decorative gradient banner */}
                <div className="gradient-bg h-28 sm:h-32">
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                      <BookOpenIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Verse content */}
                <div className="px-6 py-8 sm:px-10 sm:py-10">
                  {/* Decorative quote mark */}
                  <div className="mb-4 text-5xl font-serif leading-none text-primary/20 select-none">
                    &ldquo;
                  </div>

                  <p className="font-serif text-lg leading-relaxed text-foreground sm:text-xl">
                    {verse.text}
                  </p>

                  {/* Reference */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm font-bold tracking-wide text-primary sm:text-base">
                      {verse.ref}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Want to explore this verse further?
                </p>
                <Link
                  href="/chat"
                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full gradient-bg px-6 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Ask Madha
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpenIcon className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Could not load today&apos;s verse</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Please check your connection and try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BiblePage() {
  return (
    <AuthGuard>
      <BibleContent />
    </AuthGuard>
  );
}
