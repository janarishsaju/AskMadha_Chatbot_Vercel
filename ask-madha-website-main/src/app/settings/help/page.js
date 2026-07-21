"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import { MailIcon } from "@/components/icons";

function HelpContent() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader
        title="Help Center"
        showBackButton
        onBack={() => router.push("/settings")}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {/* Email support */}
          <div className="rounded-2xl border border-border glass p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailIcon className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Need Help?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our support team is here for you. Email us and we&apos;ll respond
              within 24 hours.
            </p>
            <a
              href="mailto:support@askmadha.com"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg gradient-bg px-6 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <MailIcon className="h-5 w-5" />
              support@askmadha.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <AuthGuard>
      <HelpContent />
    </AuthGuard>
  );
}
