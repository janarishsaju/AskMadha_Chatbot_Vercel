import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { userToProfile } from '@/lib/auth';
import { corsJson, corsError, handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return corsError(request, 'Invalid JSON body', 400, 'INVALID_BODY');
  }

  const refreshToken = body?.refresh_token;

  if (!refreshToken) {
    return corsError(request, 'Refresh token is required', 400, 'MISSING_FIELDS');
  }

  const { data, error } = await supabaseAdmin.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return corsError(request, 'Session expired. Please sign in again.', 401, 'SESSION_EXPIRED');
  }

  return corsJson(request, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: userToProfile(data.user),
  });
}
