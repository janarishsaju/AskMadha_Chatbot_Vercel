"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import { StarIcon, HeartIcon } from "@/components/icons";

function RateContent() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ratingLabels = {
    1: "Needs improvement",
    2: "Could be better",
    3: "Good",
    4: "Great!",
    5: "Excellent!",
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader
          title="Rate the App"
          showBackButton
          onBack={() => router.push("/settings")}
        />
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="rounded-2xl border border-border glass p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
              <span className="text-3xl">🙏</span>
            </div>
            <h2 className="text-xl font-semibold gradient-text">Thank You!</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We appreciate your feedback and will use it to improve the app.
            </p>
            {rating >= 4 && (
              <a
                href="https://apps.apple.com/in/app/madha-tv/id879458299"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg gradient-bg px-6 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                Rate on App Store
              </a>
            )}
            <button
              onClick={() => router.push("/settings")}
              className="mt-3 block w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Back to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader
        title="Rate the App"
        showBackButton
        onBack={() => router.push("/settings")}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {/* Hero card */}
          <div className="rounded-2xl border border-border glass p-6 text-center shadow-sm">
            <span className="text-5xl">🙏</span>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              Enjoying Ask Madha?
            </h2>
            <p className="mt-2 text-sm italic text-muted-foreground">
              Your feedback helps us serve the Catholic community better
            </p>
          </div>

          {/* Rating */}
          <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            How would you rate your experience?
          </h3>
          <div className="flex justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} stars`}
                className="p-1 transition-transform hover:scale-110"
              >
                <StarIcon
                  className={`h-12 w-12 ${
                    star <= rating ? "text-accent" : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm font-medium text-primary">
              ⭐ {ratingLabels[rating]}
            </p>
          )}

          {/* Feedback */}
          <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tell us more (optional)
          </h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What do you love? What could we improve? Share your thoughts..."
            maxLength={500}
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {feedback.length}/500
          </p>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg gradient-bg px-6 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </button>

          {/* Benefits card */}
          <div className="mt-8 flex items-center gap-3 rounded-xl bg-accent/10 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
              <HeartIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-accent">Your Voice Matters</p>
              <p className="mt-1 text-xs text-accent">
                Every review helps us improve and reach more people seeking spiritual
                guidance. Thank you for being part of our journey!
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 flex items-center justify-around rounded-2xl border border-border bg-surface p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">4.8</p>
              <p className="mt-1 text-xs text-muted-foreground">Average Rating</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">12.5K</p>
              <p className="mt-1 text-xs text-muted-foreground">Reviews</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">95%</p>
              <p className="mt-1 text-xs text-muted-foreground">Recommend</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RatePage() {
  return (
    <AuthGuard>
      <RateContent />
    </AuthGuard>
  );
}
