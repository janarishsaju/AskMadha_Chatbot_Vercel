import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { MailIcon, GlobeIcon } from "@/components/icons";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with the Ask Madha team at Madha TV. We are here to help with questions, feedback, and support.",
};

const contactChannels = [
  {
    icon: MailIcon,
    title: "Email",
    value: "support@askmadha.com",
    href: "mailto:support@askmadha.com",
  },
  {
    icon: GlobeIcon,
    title: "Website",
    value: "askmadha.com",
    href: "https://askmadha.com",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Contact Us"
        description="Have a question or feedback? We would love to hear from you."
        icon={MailIcon}
      />

      <section className="flex-1 bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-10">
          <div className="grid gap-4 sm:grid-cols-2">
            {contactChannels.map((channel) => (
              <a
                key={channel.title}
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border glass p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                  <channel.icon className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-heading-foreground">{channel.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{channel.value}</p>
                </div>
              </a>
            ))}
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}
