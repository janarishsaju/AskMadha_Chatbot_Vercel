"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/lib/AuthProvider";

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

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];


export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
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

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "text-sm font-semibold text-foreground"
                    : "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <Link
              href="/chat"
              className="rounded-full gradient-bg px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              App
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full gradient-bg px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {open ? <XIcon aria-hidden /> : <MenuIcon aria-hidden />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {links.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "block rounded-lg bg-surface-hover px-3 py-2.5 text-base font-semibold text-foreground"
                      : "block rounded-lg px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href={user ? "/chat" : "/login"}
              onClick={() => setOpen(false)}
              className="block rounded-lg gradient-bg px-3 py-2.5 text-center text-base font-medium text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              {user ? "App" : "Sign In"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
