import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {
  saveAuthSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  clearAuthSession,
  isTokenExpired,
} from './tokenStorage';

const BASE_URL: string =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://ask-madha-website-git-dev-deepflock.vercel.app';

// Network timeouts (ms). POST is quick; stream may idle between tokens.
const REQUEST_TIMEOUT = 15000;
const STREAM_TIMEOUT = 120000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Return the Supabase user ID to use as X-Client-Id.
 * This ensures sessions sync across platforms (mobile + web).
 * Falls back to a random UUID if not authenticated yet.
 */
export async function getClientId(): Promise<string> {
  const user = await getStoredUser();
  if (user?.id) return user.id;
  // Not authenticated yet — generate a temporary ID.
  // Once they sign in, their real user ID will be used.
  let id = await AsyncStorage.getItem('madhagpt_client_id');
  if (!id) {
    id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    await AsyncStorage.setItem('madhagpt_client_id', id);
  }
  return id;
}

// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  language: 'english' | 'tamil';
  bookFilter?: string;
  subscriptionTier: 'free' | 'premium';
  streak: number;
  createdAt: string;
}

export interface AuthResult {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

// ─── Auth API ────────────────────────────────────────────────────────────────

async function authRequest(
  path: string,
  body: Record<string, any>,
): Promise<AuthResult> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/auth/${path}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    REQUEST_TIMEOUT,
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `Auth failed (${res.status})`);
  }

  if (data.access_token) {
    await saveAuthSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: data.user,
    });
  }

  return data;
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  return authRequest('signin', { email, password });
}

export async function signUp(
  email: string,
  password: string,
): Promise<{ needsConfirmation: boolean; user?: AuthUser }> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/auth/signup`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
    REQUEST_TIMEOUT,
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `Sign up failed (${res.status})`);
  }

  if (data.access_token) {
    await saveAuthSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: data.user,
    });
    return { needsConfirmation: false, user: data.user };
  }

  return { needsConfirmation: data.needsConfirmation ?? true };
}

export async function signOut(): Promise<void> {
  const refreshToken = await getRefreshToken();
  try {
    await fetchWithTimeout(
      `${BASE_URL}/api/auth/signout`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
      REQUEST_TIMEOUT,
    );
  } finally {
    await clearAuthSession();
  }
}

export async function resetPassword(email: string): Promise<void> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/auth/reset-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    },
    REQUEST_TIMEOUT,
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `Reset failed (${res.status})`);
  }
}

export async function deleteAccount(): Promise<void> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/auth/delete-account`,
    {
      method: 'DELETE',
      headers: await authHeaders(),
    },
    REQUEST_TIMEOUT,
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `Account deletion failed (${res.status})`);
  }
  await clearAuthSession();
}

/**
 * Refresh the access token using the stored refresh token.
 * Returns the new AuthResult or null if refresh failed.
 */
export async function refreshSession(): Promise<AuthResult | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/api/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
      REQUEST_TIMEOUT,
    );

    if (!res.ok) {
      await clearAuthSession();
      return null;
    }

    const data: AuthResult = await res.json();
    await saveAuthSession(data);
    return data;
  } catch {
    await clearAuthSession();
    return null;
  }
}

/**
 * Get the current user from storage, refreshing the token if needed.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAccessToken();
  if (!token) return null;

  if (await isTokenExpired()) {
    const refreshed = await refreshSession();
    return refreshed?.user ?? null;
  }

  return getStoredUser();
}

/**
 * Get a valid access token, refreshing if needed.
 * Returns null if not authenticated.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;

  if (await isTokenExpired()) {
    const refreshed = await refreshSession();
    return refreshed?.access_token ?? null;
  }

  return token;
}

/**
 * Update user profile metadata (language, bookFilter, etc.).
 * Persists to Supabase user_metadata via the backend.
 */
export async function updateProfile(
  updates: Partial<Pick<AuthUser, 'language' | 'bookFilter'>>,
): Promise<AuthUser> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/auth/update-profile`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(updates),
    },
    REQUEST_TIMEOUT,
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Update failed (${res.status})`);
  }
  // Update stored user with new metadata
  if (data.user) {
    const existing = await getStoredUser();
    if (existing) {
      const updated = { ...existing, ...data.user };
      const { saveAuthSession, getAccessToken, getRefreshToken, getExpiresAt } =
        await import('./tokenStorage');
      const token = await getAccessToken();
      const refresh = await getRefreshToken();
      const expires = await getExpiresAt();
      if (token && refresh && expires) {
        await saveAuthSession({
          access_token: token,
          refresh_token: refresh,
          expires_at: expires,
          user: updated,
        });
      }
    }
    return data.user;
  }
  throw new Error('Update response missing user');
}

// ─── Chat API Types ──────────────────────────────────────────────────────────

export interface Session {
  id: string;
  client_id: string;
  title: string;
  book_filter: string;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  verses?: string[];
}

// ─── Chat API ────────────────────────────────────────────────────────────────

/** Shared headers for authenticated JSON requests. */
async function authHeaders(): Promise<Record<string, string>> {
  const clientId = await getClientId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Id': clientId,
  };
  const token = await getValidAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Detect whether the given text is Tamil by checking for Tamil Unicode characters
 * (U+0B80–U+0BFF). Returns "tamil" if any Tamil character is found, otherwise "english".
 */
export function detectLanguage(text: string): 'tamil' | 'english' {
  if (!text) return 'english';
  const totalLength = text.length;
  console.log('totalLength', totalLength);
  const tamilLength = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  console.log('tamilLength', tamilLength);
  const tamilPercentage = tamilLength / totalLength;
  console.log('tamilPercentage', tamilPercentage);

  if (tamilPercentage > 0.7) {
    return 'tamil';
  }

  return 'english';
}

/** Create a conversation session. Reuse its id for every message until "New Chat". */
export async function createSession(
  language: 'tamil' | 'english' = 'english',
  bookFilter = 'all',
): Promise<string> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/sessions`,
    {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ language, bookFilter }),
    },
    REQUEST_TIMEOUT,
  );
  if (!res.ok) {
    throw new Error(`Failed to create session (${res.status})`);
  }
  const session: Session = await res.json();
  if (!session?.id) {
    throw new Error('Session response missing id');
  }
  return session.id;
}

/** List this client's sessions, newest first. */
export async function listSessions(): Promise<Session[]> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/sessions`,
    { method: 'GET', headers: await authHeaders() },
    REQUEST_TIMEOUT,
  );
  if (!res.ok) {
    throw new Error(`Failed to list sessions (${res.status})`);
  }
  const sessions: Session[] = await res.json();
  return Array.isArray(sessions) ? sessions : [];
}

/** Fetch the full message history for a session. */
export async function getSessionMessages(sessionId: string): Promise<ApiMessage[]> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/sessions/${sessionId}/messages`,
    { method: 'GET', headers: await authHeaders() },
    REQUEST_TIMEOUT,
  );
  if (!res.ok) {
    throw new Error(`Failed to load messages (${res.status})`);
  }
  const messages: ApiMessage[] = await res.json();
  return Array.isArray(messages) ? messages : [];
}

/** Delete a session and its history. */
export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/sessions/${sessionId}`,
    { method: 'DELETE', headers: await authHeaders() },
    REQUEST_TIMEOUT,
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete session (${res.status})`);
  }
}

/** Rename a session. */
export async function renameSession(sessionId: string, title: string): Promise<void> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/sessions/${sessionId}`,
    {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify({ title }),
    },
    REQUEST_TIMEOUT,
  );
  if (!res.ok) {
    throw new Error(`Failed to rename session (${res.status})`);
  }
}

// ─── Bible API ───────────────────────────────────────────────────────────────

export interface BibleSearchResult {
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  score: number;
}

export interface DailyVerse {
  ref: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

/** Search the Bible for verses matching a query. No auth required. */
export async function searchBible(
  query: string,
  options: { book?: string; limit?: number } = {},
): Promise<BibleSearchResult[]> {
  const params = new URLSearchParams({ q: query });
  if (options.book) params.set('book', options.book);
  if (options.limit) params.set('limit', String(options.limit));

  const res = await fetchWithTimeout(
    `${BASE_URL}/api/bible/search?${params.toString()}`,
    { method: 'GET' },
    REQUEST_TIMEOUT,
  );
  if (!res.ok) {
    throw new Error(`Bible search failed (${res.status})`);
  }
  const data = await res.json();
  const results: BibleSearchResult[] = Array.isArray(data) ? data : data?.results ?? [];
  return results;
}

/** Get the daily verse. No auth required. Same verse all day, changes at midnight. */
export async function getDailyVerse(): Promise<DailyVerse | null> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/bible/daily`,
    { method: 'GET' },
    REQUEST_TIMEOUT,
  );
  if (!res.ok) {
    throw new Error(`Daily verse failed (${res.status})`);
  }
  return res.json();
}

// ─── Streak API ──────────────────────────────────────────────────────────────

export interface StreakVisit {
  date: string; // YYYY-MM-DD
}

export interface StreakData {
  streak: number;
  lastVisitDate: string | null;
  longestStreak: number;
  totalVisits: number;
  monthlyVisits: StreakVisit[];
  month: string; // YYYY-MM
}

export interface VisitResult {
  streak: number;
  lastVisitDate: string;
  isNewVisit: boolean;
}

/**
 * Record a daily visit. Call this once when the app/website is opened.
 * Idempotent — calling multiple times in the same day is safe.
 */
export async function recordVisit(): Promise<VisitResult> {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/streak/visit`,
    {
      method: 'POST',
      headers: await authHeaders(),
    },
    REQUEST_TIMEOUT,
  );
  if (!res.ok) {
    throw new Error(`Failed to record visit (${res.status})`);
  }
  return res.json();
}

/**
 * Get streak data including monthly visit calendar.
 * @param month - Optional month in YYYY-MM format. Defaults to current month.
 */
export async function getStreak(month?: string): Promise<StreakData> {
  const url = month
    ? `${BASE_URL}/api/streak?month=${month}`
    : `${BASE_URL}/api/streak`;
  const res = await fetchWithTimeout(
    url,
    { method: 'GET', headers: await authHeaders() },
    REQUEST_TIMEOUT,
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch streak (${res.status})`);
  }
  return res.json();
}

// ─── Streaming ───────────────────────────────────────────────────────────────

export interface StreamCallbacks {
  onToken: (content: string) => void;
  onVerses?: (refs: string[]) => void;
  onDone?: (meta: { messageId?: string }) => void;
  onError: (message: string) => void;
}

export interface StreamHandle {
  cancel: () => void;
}

interface SseEvent {
  type: 'token' | 'verses' | 'done' | 'error';
  content?: string;
  refs?: string[];
  messageId?: string;
  code?: string;
  retryAfterMs?: number;
}

export function describeError(code?: string, retryAfterMs?: number): string {
  switch (code) {
    case 'RATE_LIMIT_EXCEEDED':
    case 'RATE_LIMIT':
      return `Too many requests. Try again in ${Math.ceil((retryAfterMs ?? 30000) / 1000)}s.`;
    case 'STREAM_TOKEN_INVALID':
      return 'Connection expired. Please send your message again.';
    case 'MISSING_CLIENT_ID':
    case 'FORBIDDEN':
      return 'Session error. Please start a new chat.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Send a message and stream the AI response.
 * Two hops: POST /messages -> streamToken, then GET /stream/:token (SSE over XHR).
 */
export async function streamMessage(
  sessionId: string,
  content: string,
  cb: StreamCallbacks,
  language: 'tamil' | 'english' = 'english',
): Promise<StreamHandle> {
  const headers = await authHeaders();

  let postRes: Response;
  try {
    postRes = await fetchWithTimeout(
      `${BASE_URL}/api/sessions/${sessionId}/messages`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ content, language }),
      },
      REQUEST_TIMEOUT,
    );
  } catch {
    cb.onError('Could not reach the server. Check your connection and try again.');
    return { cancel: () => {} };
  }

  if (!postRes.ok) {
    let code: string | undefined;
    let retryAfterMs: number | undefined;
    try {
      const body = await postRes.json();
      code = body?.error?.code;
      retryAfterMs = body?.error?.retryAfterMs;
    } catch {
      // ignore parse failures
    }
    cb.onError(describeError(code, retryAfterMs));
    return { cancel: () => {} };
  }

  let streamToken: string | undefined;
  try {
    ({ streamToken } = await postRes.json());
  } catch {
    streamToken = undefined;
  }
  if (!streamToken) {
    cb.onError('Something went wrong. Please try again.');
    return { cancel: () => {} };
  }

  const xhr = new XMLHttpRequest();
  const url = `${BASE_URL}/api/sessions/${sessionId}/stream/${streamToken}`;
  let consumed = 0;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    try {
      xhr.abort();
    } catch {
      // abort after completion can throw on some platforms; ignore
    }
  };

  const handleLine = (rawLine: string) => {
    const line = rawLine.trim();
    if (!line.startsWith('data:')) return;
    const payload = line.slice(5).trim();
    if (!payload) return;
    let evt: SseEvent;
    try {
      evt = JSON.parse(payload);
    } catch {
      return;
    }
    if (evt.type === 'token' && evt.content) {
      cb.onToken(evt.content);
    } else if (evt.type === 'verses' && evt.refs) {
      cb.onVerses?.(evt.refs);
    } else if (evt.type === 'done') {
      cb.onDone?.({ messageId: evt.messageId });
      finish();
    } else if (evt.type === 'error') {
      cb.onError(describeError(evt.code, evt.retryAfterMs));
      finish();
    }
  };

  const processBuffer = (full: string) => {
    let idx: number;
    while (!finished && (idx = full.indexOf('\n', consumed)) !== -1) {
      handleLine(full.slice(consumed, idx));
      consumed = idx + 1;
    }
  };

  xhr.open('GET', url);
  xhr.setRequestHeader('Accept', 'text/event-stream');
  xhr.timeout = STREAM_TIMEOUT;

  const token = await getValidAccessToken();
  if (token) {
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  }
  const clientId = await getClientId();
  xhr.setRequestHeader('X-Client-Id', clientId);

  xhr.onreadystatechange = () => {
    if (finished) return;
    if (xhr.readyState >= 3 && xhr.responseText) {
      processBuffer(xhr.responseText);
    }
    if (xhr.readyState === 4 && !finished) {
      finished = true;
    }
  };

  xhr.onerror = () => {
    if (finished) return;
    finished = true;
    cb.onError('Connection lost. Please try again.');
  };

  xhr.ontimeout = () => {
    if (finished) return;
    finished = true;
    cb.onError('The response timed out. Please try again.');
  };

  xhr.send();

  return {
    cancel: () => {
      if (finished) return;
      finished = true;
      try {
        xhr.abort();
      } catch {
        // ignore
      }
    },
  };
}
