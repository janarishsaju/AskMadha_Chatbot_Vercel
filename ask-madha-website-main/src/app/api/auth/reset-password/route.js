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

  const email = body?.email?.trim()?.toLowerCase();

  if (!email) {
    return corsError(request, 'Email is required', 400, 'MISSING_FIELDS');
  }

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);

  if (error) {
    return corsError(request, error.message, 400, 'AUTH_ERROR');
  }

  return corsJson(request, { success: true });
}
