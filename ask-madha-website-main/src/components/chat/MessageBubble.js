"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { BookOpenIcon } from "@/components/icons";

function stripBiblicalReferences(content) {
  if (!content) return content;
  const marker = /\*\*BIBLICAL REFERENCE:?\*\*/i;
  const idx = content.search(marker);
  if (idx === -1) return content;
  return content.slice(0, idx).trimEnd();
}

export default function MessageBubble({ message, animate = true }) {
  const isUser = message.role === "user";
  const [expandedVerse, setExpandedVerse] = useState(null);
  const displayContent = isUser ? message.content : stripBiblicalReferences(message.content);

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} ${animate ? "animate-[fade-in-up_0.4s_ease-out_forwards]" : ""}`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-bg shadow-md">
          <BookOpenIcon className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className="flex max-w-[85%] flex-col gap-2 sm:max-w-[75%]">
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "gradient-bg text-white rounded-br-md"
              : "bg-surface border border-border text-foreground rounded-bl-md"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed sm:text-base">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm sm:prose-base max-w-none break-words text-foreground [&_p]:my-2 [&_p]:leading-relaxed [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic [&_code]:rounded [&_code]:bg-primary/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/5 [&_pre]:p-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            </div>
          )}
        </div>

        {message.verses && message.verses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <BookOpenIcon className="h-3.5 w-3.5 text-primary/70" />
              <span className="text-xs font-medium text-muted-foreground">
                {message.verses.length} {message.verses.length === 1 ? 'reference' : 'references'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.verses.map((verse, i) => {
                const verseRef = typeof verse === 'string' ? verse : verse.ref;
                const verseText = typeof verse === 'object' ? verse.text : null;
                const isExpanded = expandedVerse === i;
                
                return (
                  <div key={i} className="contents">
                    <button
                      onClick={() => setExpandedVerse(isExpanded ? null : i)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                        isExpanded
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-sm'
                      }`}
                    >
                      <span>{verseRef}</span>
                      {verseText && (
                        <svg
                          className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                    {isExpanded && verseText && (
                      <div className="w-full animate-[fade-in-up_0.2s_ease-out]">
                        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 shadow-sm">
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <div className="h-1 w-1 rounded-full bg-primary" />
                            <span className="text-xs font-bold text-primary">{verseRef}</span>
                          </div>
                          <p className="font-serif text-sm leading-relaxed text-foreground/90">
                            {verseText}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold text-sm">
          U
        </div>
      )}
    </div>
  );
}
