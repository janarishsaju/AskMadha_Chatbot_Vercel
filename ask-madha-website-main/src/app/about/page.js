import PageHeader from "@/components/PageHeader";
import {
  InfoIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  HeartIcon,
  MessageCircleIcon,
  SearchIcon,
  GlobeIcon,
  UsersIcon,
  FlameIcon,
} from "@/components/icons";

export const metadata = {
  title: "About",
  description:
    "Learn about Ask Madha, the AI-powered Catholic spiritual companion by Madha TV for Android, iOS, and web.",
};

const values = [
  {
    icon: BookOpenIcon,
    title: "Scripture Centered",
    description:
      "We keep the Bible at the center of every answer, encouraging users to read, reflect, and verify against the Word.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Trustworthy",
    description:
      "We aim to provide accurate, respectful, and thoughtful responses rooted in Catholic tradition without replacing personal study or pastoral guidance.",
  },
  {
    icon: HeartIcon,
    title: "Built with Care",
    description:
      "Ask Madha is designed to support your spiritual journey with a friendly, judgment-free experience.",
  },
];

const appFeatures = [
  {
    icon: MessageCircleIcon,
    title: "AI Spiritual Guidance",
    description: "Chat with an AI trained in Catholic theology and spirituality",
  },
  {
    icon: BookOpenIcon,
    title: "Daily Gospel",
    description: "Daily readings with reflections and spiritual insights",
  },
  {
    icon: SearchIcon,
    title: "Bible Search",
    description: "Search the Bible by keyword, topic, or phrase",
  },
  {
    icon: GlobeIcon,
    title: "Bilingual Support",
    description: "Available in English and Tamil",
  },
  {
    icon: UsersIcon,
    title: "Prayer Community",
    description: "Share and join in prayer with fellow believers",
  },
  {
    icon: FlameIcon,
    title: "Daily Streak",
    description: "Build consistent spiritual habits with daily tracking",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="About Ask Madha"
        description="Your Catholic spiritual companion for exploring the Bible and growing in faith."
        icon={InfoIcon}
      />

      <section className="flex-1 bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="space-y-6 text-lg leading-8 text-muted-foreground">
            <p>
              Ask Madha is a Catholic spiritual companion app for Android, iOS,
              and the web, created by Madha TV. It lets you sign up, log in, and
              chat with an AI agent trained in Catholic theology and
              spirituality. Whether you have a specific question about a verse,
              want to understand a story, or need encouragement from Scripture,
              Ask Madha is here to help.
            </p>
            <p>
              Our mission is to accompany you on your spiritual journey with the
              wisdom of Catholic tradition, powered by compassionate AI
              guidance. We help you deepen your faith through daily Scripture,
              prayer, and reflection. We believe that asking questions is a
              powerful way to grow in faith, and we want to provide a safe,
              thoughtful space where you can explore Scripture at your own pace.
            </p>
            <p>
              Ask Madha does not replace the Bible, your local church, or
              pastoral counsel. Instead, it serves as a companion—helping you
              find context, ask better questions, and discover new insights.
            </p>
          </div>

          <div className="rounded-2xl border border-border glass p-8">
            <h2 className="text-2xl font-bold tracking-tight gradient-text">
              Our values
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                    <value.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-semibold text-heading-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border glass p-8">
            <h2 className="text-2xl font-bold tracking-tight gradient-text">
              Features
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {appFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-semibold text-heading-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border glass p-8">
            <h2 className="text-2xl font-bold tracking-tight gradient-text">
              Connect with us
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <a
                href="https://askmadha.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                  <GlobeIcon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-heading-foreground">Visit our website</h3>
                  <p className="mt-1 text-sm text-muted-foreground">askmadha.com</p>
                </div>
              </a>
              <a
                href="mailto:support@askmadha.com"
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                  <HeartIcon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-heading-foreground">Contact us</h3>
                  <p className="mt-1 text-sm text-muted-foreground">support@askmadha.com</p>
                </div>
              </a>
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-muted-foreground italic">
              Made with ❤️ and 🙏 for the Catholic community
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              © {new Date().getFullYear()} Madha TV. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
