"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

const faqs = [
  {
    question: "What is Ask Madha?",
    answer:
      "Ask Madha is a Catholic spiritual companion app for Android, iOS, and the web, created by Madha TV. It lets you sign up, log in, and chat with an AI agent trained in Catholic theology and spirituality. You can ask questions, explore verses, search the Bible, read the daily Gospel, and receive scripture-based guidance.",
  },
  {
    question: "How does the AI spiritual guidance work?",
    answer:
      "Our AI is trained on Catholic Catechism, Sacred Scripture, writings of the Saints, and Papal documents. It provides guidance rooted in authentic Catholic teaching while maintaining a warm, pastoral tone. You can ask about any verse, book, or biblical topic and receive thoughtful, scripture-based responses in real time.",
  },
  {
    question: "Is Ask Madha free to use?",
    answer:
      "Currently, all features are free. We may introduce premium features in the future, but core spiritual guidance will always remain accessible to everyone.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "Yes, a free account is required to keep your chat history secure and synced across your devices. You can sign up with your email address in seconds.",
  },
  {
    question: "Is Ask Madha available in multiple languages?",
    answer:
      "Yes. Ask Madha is available in English and Tamil. You can choose your preferred language for AI responses and scripture exploration in Settings. We plan to add more languages over time.",
  },
  {
    question: "What is the Daily Gospel feature?",
    answer:
      "Each day, Ask Madha presents a daily verse from the Bible with reflections and spiritual insights to nourish your faith. The verse changes daily at midnight. Visit the Daily Bread tab to read today's verse.",
  },
  {
    question: "How does Bible Search work?",
    answer:
      "You can search the Bible by keyword, topic, or phrase. The search returns matching verses instantly, showing the reference, book, chapter, and verse text so you can explore context and meaning.",
  },
  {
    question: "What is the Book Filter?",
    answer:
      "The Book Filter lets you focus your AI conversations on a specific book of the Bible. For example, you can filter responses to only reference the Gospel of John or the Psalms. You can set or clear the filter anytime in Settings. Leave it empty to explore all books.",
  },
  {
    question: "Can I access my previous conversations?",
    answer:
      "Yes. Your conversations are saved automatically. You can browse, rename, resume, or delete past chats anytime from the Chat History screen. This makes it easy to continue your spiritual journey where you left off.",
  },
  {
    question: "What is the streak feature?",
    answer:
      "Your streak tracks consecutive days of engagement with the app through prayer, reading Scripture, or chatting with the AI. It helps you build consistent spiritual habits and stay connected to your faith daily.",
  },
  {
    question: "Can I use the app offline?",
    answer:
      "Some features like viewing saved content work offline. However, AI chat, daily Gospel, Bible search, and community features require an internet connection.",
  },
  {
    question: "Does Ask Madha replace my pastor or church?",
    answer:
      "No. Ask Madha is a companion tool for personal exploration and encouragement. It does not replace pastoral counsel, community, or the guidance of your local church. We encourage users to verify answers against the Bible and consult trusted teachers or pastors for deeper study.",
  },
  {
    question: "Is my data safe?",
    answer:
      "We take your privacy seriously. Your personal data is protected and only used to provide and improve the app. Please read our Privacy Policy for full details.",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can reach our support team at support@askmadha.com or through the contact form on our website. We aim to respond within 24 hours.",
  },
];

export default function FAQContent() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border glass">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="group p-6 transition-colors hover:bg-surface-hover/50"
          >
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            >
              <span className="text-lg font-semibold text-heading-foreground transition-colors group-hover:text-primary">
                {faq.question}
              </span>
              <span className="ml-4 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 p-1 text-primary transition-transform duration-300">
                <ChevronDownIcon
                  className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pt-4 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
