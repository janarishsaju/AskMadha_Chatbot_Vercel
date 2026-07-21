"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/lib/AuthProvider";
import AvatarCircle from "@/components/AvatarCircle";
import {
  SettingsIcon,
  LogoutIcon,
  ChevronRightIcon,
  UserIcon,
  HelpCircleIcon,
  InfoIcon,
  PaletteIcon,
  TrashIcon,
  FlameIcon,
} from "@/components/icons";

function SettingsContent() {
  const router = useRouter();
  const { user, signOut, signOutLoading, updateProfile } = useAuth();
  const [bookFilterInput, setBookFilterInput] = useState("");
  const [showBookFilter, setShowBookFilter] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/login");
  }, [signOut, router]);

  const handleBookFilterSave = useCallback(() => {
    const value = bookFilterInput.trim() || "all";
    updateProfile({ bookFilter: value });
    setShowBookFilter(false);
    setBookFilterInput("");
  }, [bookFilterInput, updateProfile]);

  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    setTheme(root.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  const sections = [
    {
      label: "Support",
      items: [
        { icon: HelpCircleIcon, title: "Help Center", href: "/settings/help" },
        { icon: InfoIcon, title: "About", href: "/settings/about" },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      <AppNavbar avatarUrl={user?.avatarUrl} displayName={user?.displayName} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold gradient-text">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>

          {/* Profile card */}
          <div className="flex w-full items-center gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md">
            <AvatarCircle size={56} uri={user?.avatarUrl} displayName={user?.displayName} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-bold text-foreground">
                {user?.displayName || "Ask Madha User"}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
          </div>

          {/* Streak card */}
          <button
            onClick={() => router.push("/settings/streak")}
            className="group mt-4 flex w-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 text-accent transition-transform group-hover:scale-105">
              <FlameIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">
                Current streak: {user?.streak ?? 0} {user?.streak === 1 ? "day" : "days"}
              </div>
              <div className="text-xs text-muted-foreground">
                Open daily to maintain your streak
              </div>
            </div>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Chat Preferences */}
          <div className="mt-10">
            <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Chat Preferences
            </h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              {/* Book Filter */}
              <div>
                {showBookFilter ? (
                  <div className="px-5 py-4">
                    <div className="mb-1 text-sm font-semibold text-foreground">Book Filter</div>
                    <div className="mb-3 text-xs text-muted-foreground">
                      Enter a book name (e.g. Matthew, மத்தேயு) or leave empty for all books
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bookFilterInput}
                        onChange={(e) => setBookFilterInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleBookFilterSave()}
                        placeholder="e.g. John, யோவான்"
                        autoFocus
                        className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        onClick={handleBookFilterSave}
                        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowBookFilter(false);
                          setBookFilterInput("");
                        }}
                        className="rounded-xl bg-surface-hover px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setBookFilterInput(
                        user?.bookFilter && user.bookFilter !== "all" ? user.bookFilter : ""
                      );
                      setShowBookFilter(true);
                    }}
                    className="group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 text-primary">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground">Book Filter</div>
                      <div className="text-xs text-muted-foreground">
                        Current: <span className="font-medium text-foreground/80">{user?.bookFilter || "all"}</span>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="mt-10">
            <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Experience
            </h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 text-primary">
                  <PaletteIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">Theme</div>
                  <div className="text-xs text-muted-foreground">
                    {mounted ? (theme === "dark" ? "Dark mode" : "Light mode") : "Light mode"}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      if (theme !== "light") toggleTheme();
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                      mounted && theme === "light"
                        ? "gradient-bg text-white shadow-md shadow-primary/25"
                        : "bg-surface-hover text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => {
                      if (theme !== "dark") toggleTheme();
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                      mounted && theme === "dark"
                        ? "gradient-bg text-white shadow-md shadow-primary/25"
                        : "bg-surface-hover text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Support sections */}
          {sections.map((section) => (
            <div key={section.label} className="mt-10">
              <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </h3>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                {section.items.map((item, index) => (
                  <button
                    key={item.title}
                    onClick={() => router.push(item.href)}
                    className={`group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      index > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <div className="text-xs text-muted-foreground">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Danger Zone */}
          <div className="mt-10">
            <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-red-500/70">
              Danger Zone
            </h3>
            <div className="overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/5 shadow-sm">
              <button
                onClick={() => router.push("/settings/delete-account")}
                className="group flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-red-500/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                  <TrashIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-red-500">
                    Delete Account
                  </span>
                  <div className="text-xs text-muted-foreground">
                    Permanently remove your account and all data
                  </div>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Sign out */}
          <div className="mt-8">
            <button
              onClick={() => setShowSignOutDialog(true)}
              disabled={signOutLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-500/10 hover:border-red-500/30 disabled:opacity-60"
            >
              <LogoutIcon className="h-5 w-5" />
              {signOutLoading ? "Signing out..." : "Sign Out"}
            </button>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            Ask Madha v1.0.0
          </p>
        </div>
      </div>

      {/* Sign out confirmation dialog */}
      {showSignOutDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fade-in_0.2s_ease-out]"
          onClick={() => !signOutLoading && setShowSignOutDialog(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-[fade-in-up_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <LogoutIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Sign Out?</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  You will be signed out of your account. You can sign back in anytime.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSignOutDialog(false)}
                disabled={signOutLoading}
                className="rounded-lg bg-surface-hover px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={signOutLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/30 disabled:opacity-60"
              >
                {signOutLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <LogoutIcon className="h-4 w-4" />
                )}
                {signOutLoading ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
