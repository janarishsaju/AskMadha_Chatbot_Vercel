"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AvatarCircle from "@/components/AvatarCircle";
import { useAuth } from "@/lib/AuthProvider";
import { LogoutIcon } from "@/components/icons";

const navItems = [
  { href: "/chat", label: "Chat" },
  { href: "/chat/history", label: "History" },
  { href: "/bible", label: "Daily Bread" },
  { href: "/search", label: "Search Bible" },
];

function MenuIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function AppNavbar({ avatarUrl, displayName }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, signOutLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/login");
  }, [signOut, router]);

  const isActive = (href) => pathname === href || (href !== "/chat" && pathname.startsWith(href));

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo + Ask Madha */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        >
          <Image
            src="/assets/logo.png"
            alt="Ask Madha"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Ask Madha
          </span>
        </Link>

        {/* Right: Nav items + Profile + Logout */}
        <div className="flex items-center gap-3">
          {/* Desktop nav items */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            href="/settings"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          >
            <AvatarCircle size={36} uri={avatarUrl} displayName={displayName} />
          </Link>
          <button
            onClick={() => setShowSignOutDialog(true)}
            disabled={signOutLoading}
            aria-label="Sign out"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 md:inline-flex"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>

          {/* Mobile hamburger */}
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            {open ? <XIcon aria-hidden /> : <MenuIcon aria-hidden />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              Profile
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                setShowSignOutDialog(true);
              }}
              disabled={signOutLoading}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium text-red-500 transition-colors hover:bg-red-500/10"
            >
              <LogoutIcon className="h-5 w-5" />
              {signOutLoading ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </header>

      {/* Sign out confirmation dialog — outside header to avoid backdrop-blur stacking context */}
      {showSignOutDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-[fade-in_0.2s_ease-out]"
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
    </>
  );
}
