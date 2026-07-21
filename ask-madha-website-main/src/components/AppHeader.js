"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import AvatarCircle from "@/components/AvatarCircle";

export default function AppHeader({ title, showBackButton, onBack, leftIcon: LeftIcon, onLeftPress, leftLabel, leftIcon2: LeftIcon2, onLeftPress2, leftLabel2, rightIcon: RightIcon, onRightPress, rightLabel, avatarUrl, displayName }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeftIcon className="h-5 w-5" aria-hidden />
            </button>
          )}
          {LeftIcon && (
            <button
              onClick={onLeftPress}
              aria-label={leftLabel || "Action"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LeftIcon className="h-5 w-5" aria-hidden />
            </button>
          )}
          {LeftIcon2 && (
            <button
              onClick={onLeftPress2}
              aria-label={leftLabel2 || "Action"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LeftIcon2 className="h-5 w-5" aria-hidden />
            </button>
          )}
          {title && (
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {RightIcon && (
            <button
              onClick={onRightPress}
              aria-label={rightLabel || "Action"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RightIcon className="h-5 w-5" aria-hidden />
            </button>
          )}
          {avatarUrl !== undefined && (
            <Link
              href="/settings"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
            >
              <AvatarCircle size={36} uri={avatarUrl} displayName={displayName} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
