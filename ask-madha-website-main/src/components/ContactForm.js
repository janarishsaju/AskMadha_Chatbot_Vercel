"use client";

import { useState } from "react";
import { MailIcon } from "@/components/icons";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border glass p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 text-secondary">
          <MailIcon className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="mt-5 text-xl font-semibold gradient-text">
          Message sent
        </h2>
        <p className="mt-2 text-muted-foreground">
          Thank you for reaching out. We will get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border glass p-8 shadow-sm"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-card-foreground">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-card-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-card-foreground">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder="How can we help?"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="mt-6 space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-card-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Tell us more about your question or feedback..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg gradient-bg px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Send message
      </button>

      <p className="mt-4 text-sm text-muted-foreground">
        You can also email us directly at{" "}
        <a
          href="mailto:support@askmadha.com"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          support@askmadha.com
        </a>
        .
      </p>
    </form>
  );
}
