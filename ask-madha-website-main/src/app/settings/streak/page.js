"use client";

import { useCallback, useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppNavbar from "@/components/AppNavbar";
import { FlameIcon } from "@/components/icons";
import { getStreak } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StreakContent() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = prev, etc.

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const fetchStreak = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStreak(monthKey);
      setStreakData(data);
    } catch (e) {
      setError(e?.message || "Failed to load streak data");
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Build calendar grid for the viewed month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const todayStr = now.toISOString().slice(0, 10);

  const visitSet = new Set(
    streakData?.monthlyVisits?.map((v) => v.date) || []
  );

  // Build array of cells: nulls for padding + day numbers
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isCurrentMonth = monthOffset === 0;
  const isFutureMonth = monthOffset > 0;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      <AppNavbar avatarUrl={user?.avatarUrl} displayName={user?.displayName} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold gradient-text">Your Streak</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your daily engagement and stay connected
            </p>
          </div>

          {/* Hero streak card */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
            <div className="gradient-bg h-24">
              <div className="flex h-full items-center justify-center gap-3">
                <FlameIcon className="h-8 w-8 text-white" />
                <span className="text-4xl font-bold text-white">
                  {streakData?.streak ?? 0}
                </span>
                <span className="text-lg font-medium text-white/80">
                  {streakData?.streak === 1 ? "day" : "days"}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                {streakData?.streak > 0
                  ? "Keep coming back to maintain your streak!"
                  : "Start your streak by visiting daily"}
              </p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 text-primary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {streakData?.longestStreak ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">Longest Streak</div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 text-primary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {streakData?.totalVisits ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">Total Days</div>
            </div>
          </div>

          {/* Calendar section */}
          <div className="mt-8">
            {/* Month navigation */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setMonthOffset((m) => m - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground shadow-sm transition-all hover:bg-surface-hover hover:shadow-md"
                aria-label="Previous month"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-lg font-bold text-foreground">
                {MONTH_NAMES[month]} {year}
              </h2>
              <button
                onClick={() => setMonthOffset((m) => m + 1)}
                disabled={isFutureMonth}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground shadow-sm transition-all hover:bg-surface-hover hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next month"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Calendar grid */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              {/* Day labels */}
              <div className="mb-2 grid grid-cols-7 gap-1.5">
                {DAY_LABELS.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <div key={`pad-${idx}`} />;
                  }
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const visited = visitSet.has(dateStr);
                  const isToday = isCurrentMonth && dateStr === todayStr;
                  const isFuture = dateStr > todayStr;

                  return (
                    <div
                      key={day}
                      className={`flex aspect-square items-center justify-center rounded-xl text-sm transition-all ${
                        visited
                          ? "gradient-bg text-white font-bold shadow-md shadow-primary/20"
                          : isToday
                          ? "bg-primary/10 text-primary font-bold ring-2 ring-primary/30"
                          : isFuture
                          ? "text-muted-foreground/30"
                          : "text-muted-foreground bg-surface-hover/50"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 rounded gradient-bg" />
                  <span>Visited</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 rounded bg-primary/10 ring-2 ring-primary/30" />
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loading & error states */}
          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-3 text-sm text-muted-foreground">Loading streak data...</p>
            </div>
          )}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-center text-sm text-red-600 dark:text-red-400 shadow-lg">
              {error}
            </div>
          )}

          {/* Motivational message */}
          {!loading && !error && streakData && (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
                <FlameIcon className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {streakData.streak > 0
                  ? `You're on a ${streakData.streak}-day streak! Come back tomorrow to keep it alive.`
                  : "Open the app every day to build your streak and stay connected to your faith journey."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StreakPage() {
  return (
    <AuthGuard>
      <StreakContent />
    </AuthGuard>
  );
}
