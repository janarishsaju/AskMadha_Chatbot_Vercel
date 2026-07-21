"use client";

import { useState, useRef, useEffect } from "react";
import { SendIcon } from "@/components/icons";

export default function ChatInputBar({ onSend, disabled }) {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("auto");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, language);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={disabled}
          className="h-12 shrink-0 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
        >
          <option value="auto">Auto</option>
          <option value="english">English</option>
          <option value="tamil">Tamil</option>
        </select>
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What would you like to explore?"
            rows={1}
            disabled={disabled}
            className="w-full resize-none rounded-2xl border border-border bg-surface px-5 py-3.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 disabled:opacity-50 transition-all sm:text-base"
            style={{ maxHeight: "120px" }}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60">
            {text.length > 0 && `${text.length}`}
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full gradient-bg text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <SendIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
