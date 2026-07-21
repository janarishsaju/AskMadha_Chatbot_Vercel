import { supabaseAdmin } from '@/lib/supabaseAdmin';
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

  const { error } = await supabaseAdmin.auth.signOut({
    refreshToken,
  });

  // Even if there's an error (e.g. token already revoked), return success
  // so the client can safely clear local tokens.
  if (error) {
    // Log for debugging but don't expose to client
    console.warn('[auth/signout] signOut error:', error.message);
  }

  return corsJson(request, { success: true });
}
