"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppNavbar from "@/components/AppNavbar";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInputBar from "@/components/chat/ChatInputBar";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { useAuth } from "@/lib/AuthProvider";
import { useTypewriter } from "@/hooks/useTypewriter";
import {
  createSession,
  getSessionMessages,
  streamMessage,
  deleteSession,
  detectLanguage,
} from "@/lib/api";
import { PlusIcon, SparklesIcon, BookOpenIcon, HeartIcon, ClockHistoryIcon } from "@/components/icons";

const SUGGESTIONS = [
  { icon: BookOpenIcon, title: "Explore a verse", prompt: "What does John 3:16 mean?" },
  { icon: HeartIcon, title: "Find guidance", prompt: "How can I find peace in difficult times?" },
  { icon: SparklesIcon, title: "Learn a story", prompt: "Tell me the story of David and Goliath" },
  { icon: ClockHistoryIcon, title: "Understand context", prompt: "What was the cultural context of the Sermon on the Mount?" },
];

function toUiMessage(apiMsg) {
  return {
    id: apiMsg.id || crypto.randomUUID(),
    role: apiMsg.role,
    content: apiMsg.content || "",
    timestamp: new Date(apiMsg.created_at || apiMsg.timestamp || Date.now()),
    verses: apiMsg.verses || [],
  };
}

function ChatContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingVerses, setStreamingVerses] = useState([]);
  const [streamDone, setStreamDone] = useState(false);

  const scrollRef = useRef(null);
  const streamHandleRef = useRef(null);
  const sessionIdRef = useRef(null);
  const streamingVersesRef = useRef([]);

  useEffect(() => {
    streamingVersesRef.current = streamingVerses;
  }, [streamingVerses]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Typewriter effect for streaming content.
  const displayedContent = useTypewriter(streamingContent, streamDone);

  // When stream is done and typewriter has caught up, commit the message.
  useEffect(() => {
    if (streamDone && streamingContent && displayedContent === streamingContent) {
      const verses = streamingVersesRef.current;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: streamingContent,
          timestamp: new Date(),
          verses: verses && verses.length > 0 ? verses : undefined,
        },
      ]);
      setStreamingContent("");
      setStreamingVerses([]);
      setStreamDone(false);
      setStreaming(false);
    }
  }, [streamDone, streamingContent, displayedContent]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedContent, scrollToBottom]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("madha_open_session");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.sessionId && data.messages) {
          setSessionId(data.sessionId);
          setMessages(
            data.messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          );
        }
        sessionStorage.removeItem("madha_open_session");
      }
    } catch {}
  }, []);

  const startNewChat = useCallback(() => {
    if (streamHandleRef.current) {
      streamHandleRef.current.cancel();
      streamHandleRef.current = null;
    }
    setMessages([]);
    setSessionId(null);
    setStreaming(false);
    setStreamingContent("");
    setStreamingVerses([]);
    setStreamDone(false);
    setError(null);
  }, []);

  const handleSend = useCallback(
    async (content) => {
      if (streaming) return;
      setError(null);

      const userMsg = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      let currentSessionId = sessionIdRef.current;

      if (!currentSessionId) {
        try {
          currentSessionId = await createSession(detectLanguage(content), user?.bookFilter || 'all');
          setSessionId(currentSessionId);
        } catch (e) {
          setError("Could not start a new conversation. Please try again.");
          return;
        }
      }

      setStreaming(true);
      setStreamingContent("");
      setStreamingVerses([]);
      setStreamDone(false);

      streamHandleRef.current = await streamMessage(currentSessionId, content, {
        onToken: (token) => {
          setStreamingContent((prev) => prev + token);
        },
        onVerses: (refs) => {
          setStreamingVerses((prev) => [...prev, ...refs]);
        },
        onDone: () => {
          setStreamDone(true);
          streamHandleRef.current = null;
        },
        onError: (msg) => {
          setError(msg);
          setStreamingContent("");
          setStreamingVerses([]);
          setStreamDone(false);
          setStreaming(false);
          streamHandleRef.current = null;
        },
      }, detectLanguage(content));
    },
    [streaming]
  );

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-background to-background/95">
      <AppNavbar
        avatarUrl={user?.avatarUrl}
        displayName={user?.displayName}
      />

      {/* Toolbar */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={startNewChat}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-surface-hover hover:shadow-md hover:border-primary/30"
          >
            <PlusIcon className="h-4 w-4" />
            New Chat
          </button>
          <Link
            href="/chat/history"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-surface-hover"
          >
            <ClockHistoryIcon className="h-4 w-4" />
            History
          </Link>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
          {messages.length === 0 && !streaming && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl gradient-bg shadow-xl shadow-primary/25">
                <SparklesIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold gradient-text">
                Ask anything about the Bible
              </h2>
              <p className="mt-3 max-w-lg text-base text-muted-foreground leading-relaxed">
                Start a conversation with Ask Madha. Ask questions, explore verses, and
                receive scripture-based guidance.
              </p>

              {/* Suggestion cards */}
              <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSend(s.prompt)}
                      className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md animate-[fade-in-up_0.4s_ease-out_forwards]"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 text-primary transition-transform group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{s.title}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.prompt}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {streaming && (
            <>
              {displayedContent ? (
                <MessageBubble
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: displayedContent,
                    timestamp: new Date(),
                  }}
                  animate={false}
                />
              ) : (
                <TypingIndicator />
              )}
            </>
          )}

          {error && (
            <div className="mx-auto max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400 shadow-lg">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatInputBar onSend={handleSend} disabled={streaming} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatContent />
    </AuthGuard>
  );
}
