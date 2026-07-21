import Link from "next/link";
import {
  MessageCircleIcon,
  BookOpenIcon,
  SearchIcon,
  GlobeIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  AppleIcon,
  PlayIcon,
  ClockHistoryIcon,
  PaletteIcon,
  UsersIcon,
  FlameIcon,
} from "@/components/icons";

const features = [
  {
    icon: MessageCircleIcon,
    title: "AI Spiritual Guidance",
    description:
      "Chat with an AI trained in Catholic theology and spirituality. Ask questions about Scripture, tradition, and the saints, and receive thoughtful, scripture-based responses in real time.",
  },
  {
    icon: BookOpenIcon,
    title: "Daily Gospel",
    description:
      "Receive a daily verse with reflections and spiritual insights to nourish your faith every day.",
  },
  {
    icon: SearchIcon,
    title: "Bible Search",
    description:
      "Search the Bible by keyword, topic, or phrase. Find verses instantly and explore their context and meaning.",
  },
  {
    icon: GlobeIcon,
    title: "Bilingual Support",
    description:
      "Available in English and Tamil. Choose your preferred language for AI responses and scripture exploration.",
  },
  {
    icon: BookOpenIcon,
    title: "Book Filter",
    description:
      "Focus your conversations by filtering AI responses to a specific book of the Bible, or explore all books at once.",
  },
  {
    icon: ClockHistoryIcon,
    title: "Chat History",
    description:
      "Your conversations are saved automatically. Browse, rename, or resume past chats anytime to continue your spiritual journey.",
  },
  {
    icon: PaletteIcon,
    title: "Light & Dark Themes",
    description:
      "Choose between light and dark themes for a comfortable reading experience, day or night.",
  },
  {
    icon: UsersIcon,
    title: "Prayer Community",
    description:
      "Share and join in prayer with fellow believers. A supportive faith community, coming soon.",
    beta: true,
  },
  {
    icon: FlameIcon,
    title: "Daily Streak",
    description:
      "Build consistent spiritual habits by tracking your daily engagement with Scripture, prayer, and reflection.",
    beta: true,
  },
];

const steps = [
  {
    number: "01",
    title: "Sign up",
    description:
      "Create a free account in seconds. Choose your language (English or Tamil) and set your preferences.",
  },
  {
    number: "02",
    title: "Ask & Explore",
    description:
      "Chat with AI about the Bible, search verses, read the daily Gospel, or filter by a specific book.",
  },
  {
    number: "03",
    title: "Grow in Faith",
    description:
      "Receive scripture-based guidance, track your daily streak, and deepen your relationship with God.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
            </span>
            Available on Android & iOS
          </div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text sm:text-6xl lg:text-7xl">
            Your Catholic Spiritual Companion
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Ask Madha is your AI companion for exploring the Bible and Catholic
            tradition. Sign up, log in, and start a conversation—ask questions,
            search Scripture, read the daily Gospel, and grow in faith.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full gradient-bg px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <MessageCircleIcon className="h-5 w-5 transition-transform group-hover:rotate-12" aria-hidden />
              Try on web
            </Link>
            <Link
              href="/download"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border glass px-8 text-base font-semibold text-foreground transition-all hover:bg-surface-hover hover:-translate-y-0.5"
            >
              <SmartphoneIcon className="h-5 w-5" aria-hidden />
              Get the app
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
                <AppleIcon className="h-3 w-3" />
              </span>
              iOS
            </span>
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
                <PlayIcon className="h-3 w-3" />
              </span>
              Android
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight gradient-text sm:text-4xl">
              Everything you need to explore the Word
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              A simple, powerful app designed to help you pray, learn, and grow
              in your Catholic faith.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border glass p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mt-5 flex items-center gap-2 text-lg font-semibold text-heading-foreground">
                    {feature.title}
                    {feature.beta && (
                      <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">
                        Beta
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight gradient-text sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Start your journey in three simple steps.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-border glass p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <span className="text-4xl font-bold gradient-text opacity-30">
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-heading-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
                <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-primary via-secondary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl gradient-bg p-10 text-center shadow-2xl shadow-primary/20 sm:p-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to dive deeper?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Download Ask Madha today and begin a conversation that draws you
            closer to Scripture and your faith.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://apps.apple.com/app/ask-madha"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-white px-7 text-base font-semibold text-primary transition-all hover:bg-white/90 hover:-translate-y-0.5 shadow-lg"
            >
              <AppleIcon className="h-6 w-6 transition-transform group-hover:rotate-12" />
              Download for iOS
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=app.askmadha"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border-2 border-white/40 bg-transparent px-7 text-base font-semibold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5"
            >
              <PlayIcon className="h-6 w-6" />
              Download for Android
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
