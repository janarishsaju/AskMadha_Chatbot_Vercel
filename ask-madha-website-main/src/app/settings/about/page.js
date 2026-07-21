"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import {
  GlobeIcon,
  MailIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  HeartIcon,
} from "@/components/icons";

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "2026.05.29";

function AboutContent() {
  const router = useRouter();

  const features = [
    { icon: BookOpenIcon, title: "AI Spiritual Guidance", desc: "Chat with an AI trained in Catholic theology and spirituality" },
    { icon: HeartIcon, title: "Daily Gospel", desc: "Daily readings with reflections and spiritual insights" },
    { icon: ShieldCheckIcon, title: "Spiritual Journal", desc: "Track your faith journey with private journal entries" },
    { icon: GlobeIcon, title: "Prayer Community", desc: "Share and join in prayer with fellow believers" },
  ];

  const links = [
    { icon: GlobeIcon, title: "Visit Our Website", url: "https://askmadha.com" },
    { icon: MailIcon, title: "Contact Support", url: "mailto:support@askmadha.com" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="About" showBackButton onBack={() => router.push("/settings")} />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {/* Logo section */}
          <div className="flex flex-col items-center py-8">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full gradient-bg">
              <span className="text-4xl">🙏</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Ask Madha</h1>
            <p className="mt-1 text-sm italic text-muted-foreground">
              Your Catholic Spiritual Companion
            </p>
            <span className="mt-3 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Version {APP_VERSION} ({BUILD_NUMBER})
            </span>
          </div>

          {/* Mission card */}
          <div className="rounded-2xl border border-border glass p-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary">Our Mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              To accompany you on your spiritual journey with the wisdom of Catholic
              tradition, powered by compassionate AI guidance. We help you deepen your
              faith through daily Scripture, prayer, and reflection.
            </p>
          </div>

          {/* Features */}
          <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Features
          </h3>
          <div className="space-y-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{feature.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Links */}
          <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Connect With Us
          </h3>
          <div className="space-y-2">
            {links.map((link) => (
              <a
                key={link.title}
                href={link.url}
                target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">
                  {link.title}
                </span>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm italic text-muted-foreground">
              Made with ❤️ and 🙏 for the Catholic community
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Madha TV. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <AuthGuard>
      <AboutContent />
    </AuthGuard>
  );
}
