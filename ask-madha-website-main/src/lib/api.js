const TOKEN_KEY = 'madha_auth_session';
const CLIENT_ID_KEY = 'madha_client_id';

function getClientId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

function getStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredSession(session) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

function isTokenExpired(session) {
  if (!session) return true;
  const now = Math.floor(Date.now() / 1000);
  return session.expires_at <= now + 60;
}

async function getValidAccessToken() {
  const session = getStoredSession();
  if (!session) return null;

  if (isTokenExpired(session)) {
    const refreshed = await refreshSession();
    return refreshed?.access_token ?? null;
  }

  return session.access_token;
}

function authHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'X-Client-Id': getClientId(),
  };
  const session = getStoredSession();
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function authHeadersAsync() {
  const headers = {
    'Content-Type': 'application/json',
    'X-Client-Id': getClientId(),
  };
  const token = await getValidAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

const REQUEST_TIMEOUT = 15000;

async function fetchWithTimeout(url, options, timeoutMs = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function describeError(code, retryAfterMs) {
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

export async function signIn(email, password) {
  const res = await fetchWithTimeout('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Sign in failed (${res.status})`);
  }
  saveStoredSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    user: data.user,
  });
  return data;
}

export async function signUp(email, password) {
  const res = await fetchWithTimeout('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Sign up failed (${res.status})`);
  }
  if (data.access_token) {
    saveStoredSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: data.user,
    });
    return { needsConfirmation: false, user: data.user };
  }
  return { needsConfirmation: data.needsConfirmation ?? true };
}

export async function signOut() {
  const session = getStoredSession();
  try {
    if (session?.refresh_token) {
      await fetchWithTimeout('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
    }
  } finally {
    clearStoredSession();
  }
}

export async function resetPassword(email) {
  const res = await fetchWithTimeout('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `Reset failed (${res.status})`);
  }
}

async function refreshSession() {
  const session = getStoredSession();
  if (!session?.refresh_token) return null;

  try {
    const res = await fetchWithTimeout('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (!res.ok) {
      clearStoredSession();
      return null;
    }
    const data = await res.json();
    saveStoredSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: data.user,
    });
    return data;
  } catch {
    clearStoredSession();
    return null;
  }
}

export async function getCurrentUser() {
  const session = getStoredSession();
  if (!session) return null;

  if (isTokenExpired(session)) {
    const refreshed = await refreshSession();
    return refreshed?.user ?? null;
  }

  return session.user ?? null;
}

export function getStoredUser() {
  const session = getStoredSession();
  return session?.user ?? null;
}

export { getStoredSession, saveStoredSession, clearStoredSession, getValidAccessToken, getClientId };

export function detectLanguage(text) {
  if (!text) return 'english';
  const totalLength = text.length;
  const tamilLength = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  const tamilPercentage = tamilLength / totalLength;

  if (tamilPercentage > 0.7) {
    return 'tamil';
  }

  return 'english';
}

export async function createSession(language = 'english', bookFilter = 'all') {
  const res = await fetchWithTimeout('/api/sessions', {
    method: 'POST',
    headers: await authHeadersAsync(),
    body: JSON.stringify({ language, bookFilter }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create session (${res.status})`);
  }
  const session = await res.json();
  if (!session?.id) {
    throw new Error('Session response missing id');
  }
  return session.id;
}

export async function listSessions() {
  const res = await fetchWithTimeout('/api/sessions', {
    method: 'GET',
    headers: await authHeadersAsync(),
  });
  if (!res.ok) {
    throw new Error(`Failed to list sessions (${res.status})`);
  }
  const sessions = await res.json();
  return Array.isArray(sessions) ? sessions : [];
}

export async function getSessionMessages(sessionId) {
  const res = await fetchWithTimeout(`/api/sessions/${sessionId}/messages`, {
    method: 'GET',
    headers: await authHeadersAsync(),
  });
  if (!res.ok) {
    throw new Error(`Failed to load messages (${res.status})`);
  }
  const messages = await res.json();
  return Array.isArray(messages) ? messages : [];
}

export async function deleteSession(sessionId) {
  const res = await fetchWithTimeout(`/api/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: await authHeadersAsync(),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete session (${res.status})`);
  }
}

export async function renameSession(sessionId, title) {
  const res = await fetchWithTimeout(`/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: await authHeadersAsync(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    throw new Error(`Failed to rename session (${res.status})`);
  }
}

export async function searchBible(query, options = {}) {
  const params = new URLSearchParams({ q: query });
  if (options.book) params.set('book', options.book);
  if (options.limit) params.set('limit', String(options.limit));

  const res = await fetchWithTimeout(`/api/bible/search?${params.toString()}`, {
    method: 'GET',
  });
  if (!res.ok) {
    throw new Error(`Bible search failed (${res.status})`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data?.results ?? [];
}

export async function getDailyVerse() {
  const res = await fetchWithTimeout('/api/bible/daily', {
    method: 'GET',
  });
  if (!res.ok) {
    throw new Error(`Daily verse failed (${res.status})`);
  }
  return res.json();
}

export async function updateProfile(updates) {
  const res = await fetchWithTimeout('/api/auth/update-profile', {
    method: 'POST',
    headers: await authHeadersAsync(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Update failed (${res.status})`);
  }
  // Update stored session with new user data
  const session = getStoredSession();
  if (session && data.user) {
    saveStoredSession({ ...session, user: data.user });
  }
  return data.user;
}

export async function deleteAccount() {
  const res = await fetchWithTimeout('/api/auth/delete-account', {
    method: 'DELETE',
    headers: await authHeadersAsync(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `Account deletion failed (${res.status})`);
  }
  clearStoredSession();
}

export async function recordVisit() {
  const res = await fetchWithTimeout('/api/streak/visit', {
    method: 'POST',
    headers: await authHeadersAsync(),
  });
  if (!res.ok) {
    throw new Error(`Failed to record visit (${res.status})`);
  }
  return res.json();
}

export async function getStreak(month) {
  const url = month ? `/api/streak?month=${month}` : '/api/streak';
  const res = await fetchWithTimeout(url, {
    method: 'GET',
    headers: await authHeadersAsync(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch streak (${res.status})`);
  }
  return res.json();
}

export async function streamMessage(sessionId, content, cb, language = 'english') {
  const headers = await authHeadersAsync();

  let postRes;
  try {
    postRes = await fetchWithTimeout(`/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content, language }),
    });
  } catch {
    cb.onError('Could not reach the server. Check your connection and try again.');
    return { cancel: () => {} };
  }

  if (!postRes.ok) {
    let code, retryAfterMs;
    try {
      const body = await postRes.json();
      code = body?.error?.code;
      retryAfterMs = body?.error?.retryAfterMs;
    } catch {}
    cb.onError(describeError(code, retryAfterMs));
    return { cancel: () => {} };
  }

  let streamToken;
  try {
    ({ streamToken } = await postRes.json());
  } catch {
    streamToken = undefined;
  }
  if (!streamToken) {
    cb.onError('Something went wrong. Please try again.');
    return { cancel: () => {} };
  }

  const controller = new AbortController();
  const url = `/api/sessions/${sessionId}/stream/${streamToken}`;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    try {
      controller.abort();
    } catch {}
  };

  const handleLine = (rawLine) => {
    const line = rawLine.trim();
    if (!line.startsWith('data:')) return;
    const payload = line.slice(5).trim();
    if (!payload) return;
    let evt;
    try {
      evt = JSON.parse(payload);
    } catch {
      return;
    }
    if (evt.type === 'token' && evt.content) {
      cb.onToken(evt.content);
    } else if (evt.type === 'verses' && (evt.verses || evt.refs)) {
      cb.onVerses?.(evt.verses || evt.refs);
    } else if (evt.type === 'done') {
      cb.onDone?.({ messageId: evt.messageId });
      finish();
    } else if (evt.type === 'error') {
      cb.onError(describeError(evt.code, evt.retryAfterMs));
      finish();
    }
  };

  let buffer = '';

  (async () => {
    try {
      const streamRes = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${await getValidAccessToken()}`,
          'X-Client-Id': getClientId(),
        },
        signal: controller.signal,
      });

      if (!streamRes.ok) {
        const text = await streamRes.text();
        let code, retryAfterMs;
        try {
          const body = JSON.parse(text);
          code = body?.error?.code;
          retryAfterMs = body?.error?.retryAfterMs;
        } catch {}
        cb.onError(describeError(code, retryAfterMs));
        finish();
        return;
      }

      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder();

      while (!finished) {
        const { done, value } = await reader.read();
        if (done) {
          if (!finished) finish();
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          handleLine(buffer.slice(0, idx));
          buffer = buffer.slice(idx + 1);
        }
      }
    } catch (e) {
      if (finished) return;
      if (e?.name === 'AbortError') return;
      finish();
      cb.onError('Connection lost. Please try again.');
    }
  })();

  return {
    cancel: () => {
      if (finished) return;
      finish();
    },
  };
}
