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

  const email = body?.email?.trim()?.toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return corsError(request, 'Email and password are required', 400, 'MISSING_FIELDS');
  }

  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: {
        displayName: email.split('@')[0],
        language: 'english',
        subscriptionTier: 'free',
        streak: 0,
      },
    },
  });

  if (error) {
    return corsError(request, error.message, 400, 'AUTH_ERROR');
  }

  const needsConfirmation = !data.session;

  return corsJson(request, {
    needsConfirmation,
    ...(data.session
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: userToProfile(data.user),
        }
      : {}),
  });
}
