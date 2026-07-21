import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types';
import { Session } from '../services/madhaApi';

interface ChatStore {
  // Active conversation
  messages: Message[];
  isStreaming: boolean;
  streamingText: string;
  streamingVerses: string[];
  streamDone: boolean;
  currentSessionId: string | null;
  error: string | null;

  // Session history list
  sessions: Session[];
  sessionsLoading: boolean;

  // Active conversation actions
  addUserMessage: (text: string) => void;
  appendStreamChunk: (chunk: string) => void;
  setStreamVerses: (refs: string[]) => void;
  setStreamDone: (done: boolean) => void;
  finalizeStreamMessage: () => void;
  setStreaming: (streaming: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentSessionId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  startNewChat: () => void;

  // Session list actions
  setSessions: (sessions: Session[]) => void;
  setSessionsLoading: (loading: boolean) => void;
  removeSession: (id: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      streamingText: '',
      streamingVerses: [],
      streamDone: false,
      currentSessionId: null,
      error: null,
      sessions: [],
      sessionsLoading: false,

      addUserMessage: (text: string) => {
        const message: Message = {
          id: `user_${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: new Date(),
        };
        set((state) => ({
          messages: [...state.messages, message],
          error: null,
        }));
      },

      appendStreamChunk: (chunk: string) => {
        set((state) => ({
          streamingText: state.streamingText + chunk,
          isStreaming: true,
        }));
      },

      setStreamVerses: (refs: string[]) => {
        set({ streamingVerses: refs });
      },

      setStreamDone: (done: boolean) => {
        set({ streamDone: done });
      },

      finalizeStreamMessage: () => {
        const { streamingText, streamingVerses } = get();
        if (!streamingText) {
          set({ isStreaming: false, streamingText: '', streamingVerses: [], streamDone: false });
          return;
        }

        const message: Message = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: streamingText,
          timestamp: new Date(),
          verses: streamingVerses.length ? streamingVerses : undefined,
        };
        set((state) => ({
          messages: [...state.messages, message],
          streamingText: '',
          streamingVerses: [],
          streamDone: false,
          isStreaming: false,
        }));
      },

      setStreaming: (streaming: boolean) => {
        set({ isStreaming: streaming });
        if (!streaming) {
          set({ streamingText: '', streamingVerses: [], streamDone: false });
        }
      },

      setError: (error: string | null) => set({ error }),

      setCurrentSessionId: (id: string | null) => set({ currentSessionId: id }),

      setMessages: (messages: Message[]) =>
        set({ messages, streamingText: '', streamingVerses: [], streamDone: false, isStreaming: false, error: null }),

      startNewChat: () =>
        set({
          messages: [],
          streamingText: '',
          streamingVerses: [],
          streamDone: false,
          isStreaming: false,
          currentSessionId: null,
          error: null,
        }),

      setSessions: (sessions: Session[]) => set({ sessions }),

      setSessionsLoading: (loading: boolean) => set({ sessionsLoading: loading }),

      removeSession: (id: string) =>
        set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only the active session id survives restarts; messages are re-fetched from the API.
      partialize: (state) => ({ currentSessionId: state.currentSessionId }),
    }
  )
);

/** Map a persisted/API message into the UI Message shape. */
export function toUiMessage(m: {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  verses?: string[];
}): Message {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.created_at ? new Date(m.created_at) : new Date(),
    verses: m.verses && m.verses.length ? m.verses : undefined,
  };
}
