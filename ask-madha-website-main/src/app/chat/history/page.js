"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/lib/AuthProvider";
import { listSessions, getSessionMessages, deleteSession, renameSession } from "@/lib/api";
import { PlusIcon, TrashIcon, ClockIcon, PencilIcon, AlertTriangleIcon } from "@/components/icons";

function relativeTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = Date.now();
  const diff = now - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function ChatHistoryContent() {
  const router = useRouter();
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openingId, setOpeningId] = useState(null);
  const [error, setError] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameInput, setRenameInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchSessions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const list = await listSessions();
      setSessions(list);
    } catch (e) {
      setError("Could not load your conversations. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleOpen = useCallback(
    async (session) => {
      if (openingId) return;
      setOpeningId(session.id);
      try {
        const apiMsgs = await getSessionMessages(session.id);
        sessionStorage.setItem(
          "madha_open_session",
          JSON.stringify({
            sessionId: session.id,
            messages: apiMsgs.map((m) => ({
              id: m.id || crypto.randomUUID(),
              role: m.role,
              content: m.content || "",
              timestamp: new Date(m.created_at || m.timestamp || Date.now()).toISOString(),
              verses: m.verses || [],
            })),
          })
        );
        router.push("/chat");
      } catch (e) {
        setError("Failed to load this conversation. Please try again.");
      } finally {
        setOpeningId(null);
      }
    },
    [openingId, router]
  );

  const handleNewChat = useCallback(() => {
    sessionStorage.removeItem("madha_open_session");
    router.push("/chat");
  }, [router]);

  const handleDelete = useCallback((session) => {
    setDeleteTarget(session);
  }, []);

  const confirmDelete = useCallback(
    async () => {
      if (!deleteTarget) return;
      const session = deleteTarget;
      setDeleteTarget(null);
      const prev = sessions;
      setSessions((s) => s.filter((item) => item.id !== session.id));
      try {
        await deleteSession(session.id);
      } catch (e) {
        setSessions(prev);
        setError("Could not delete this conversation. Please try again.");
      }
    },
    [deleteTarget, sessions]
  );

  const handleRename = useCallback((session) => {
    setRenameInput(session.title?.trim() || "");
    setRenameTarget(session);
  }, []);

  const handleRenameSave = useCallback(async () => {
    if (!renameTarget) return;
    const newTitle = renameInput.trim();
    if (!newTitle) return;
    const session = renameTarget;
    setRenameTarget(null);
    setRenameInput("");
    setSessions((prev) => prev.map((s) => s.id === session.id ? { ...s, title: newTitle } : s));
    try {
      await renameSession(session.id, newTitle);
    } catch (e) {
      fetchSessions();
      setError("Could not rename this conversation. Please try again.");
    }
  }, [renameTarget, renameInput, fetchSessions]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNavbar
        avatarUrl={user?.avatarUrl}
        displayName={user?.displayName}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {/* Page header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Chat History</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {sessions.length > 0
                  ? `${sessions.length} conversation${sessions.length === 1 ? '' : 's'}`
                  : 'Your conversations will appear here'}
              </p>
            </div>
            <button
              onClick={handleNewChat}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full gradient-bg px-5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
            >
              <PlusIcon className="h-4 w-4" />
              New Chat
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400 shadow-lg">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">Loading conversations...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg shadow-primary/10">
                <ClockIcon className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-foreground">No conversations yet</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
                Start a new chat to begin your spiritual journey with Ask Madha.
              </p>
              <button
                onClick={handleNewChat}
                className="mt-8 inline-flex h-11 items-center justify-center rounded-full gradient-bg px-7 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Start New Chat
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const title = session.title?.trim() || "New Chat";
                const isOpening = openingId === session.id;
                return (
                  <div
                    key={session.id}
                    className="group relative flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md animate-[fade-in-up_0.3s_ease-out_forwards]"
                  >
                    {/* Left accent bar */}
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary/30 transition-all group-hover:h-12 group-hover:bg-primary" />

                    <button
                      onClick={() => handleOpen(session)}
                      disabled={!!openingId}
                      className="flex flex-1 items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 text-primary transition-transform group-hover:scale-105">
                        <ClockIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {relativeTime(session.updated_at || session.created_at)}
                        </p>
                      </div>
                    </button>

                    {isOpening ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleRename(session)}
                          aria-label="Rename conversation"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:scale-110"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(session)}
                          aria-label="Delete conversation"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500 hover:scale-110"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && sessions.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => fetchSessions(true)}
                disabled={refreshing}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:text-foreground hover:border-primary/30 hover:shadow-md disabled:opacity-50"
              >
                <svg className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fade-in_0.2s_ease-out]" onClick={() => setDeleteTarget(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-[fade-in-up_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangleIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">Delete Conversation?</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  This permanently removes <span className="font-medium text-foreground">{deleteTarget.title?.trim() || "this chat"}</span> and all its messages. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg bg-surface-hover px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/30"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fade-in_0.2s_ease-out]" onClick={() => setRenameTarget(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl animate-[fade-in-up_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <PencilIcon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Rename Conversation</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Give your conversation a meaningful name so it's easier to find later.
            </p>
            <input
              type="text"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSave();
                if (e.key === "Escape") { setRenameTarget(null); setRenameInput(""); }
              }}
              placeholder="Enter new name"
              autoFocus
              className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { setRenameTarget(null); setRenameInput(""); }}
                className="rounded-lg bg-surface-hover px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSave}
                disabled={!renameInput.trim()}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-40 disabled:shadow-none"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatHistoryPage() {
  return (
    <AuthGuard>
      <ChatHistoryContent />
    </AuthGuard>
  );
}
