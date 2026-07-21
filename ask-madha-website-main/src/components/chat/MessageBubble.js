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
          <div className="mt-4 border-t border-border/50 pt-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
              <BookOpenIcon className="h-4 w-4" />
              {displayContent && /[\u0B80-\u0BFF]/.test(displayContent) ? 'ஆதார விவிலிய குறிப்புகள்:' : 'Biblical References'}
            </div>
            <div className="space-y-3">
              {message.verses.map((verse, i) => {
                const verseRef = typeof verse === 'string' ? verse : verse.ref;
                const verseText = typeof verse === 'object' ? verse.text : null;
                
                return (
                  <div key={i} className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 shadow-sm">
                    <span className="mb-1 block text-sm font-bold text-primary">{verseRef}</span>
                    {verseText && (
                      <p className="font-serif text-sm leading-relaxed text-foreground/90">
                        {verseText.replace(/^["'']+|["'']+$/g, '')}
                      </p>
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
