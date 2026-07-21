import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateRequest, userToProfile } from '@/lib/auth';
import { corsJson, corsError, handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

export async function POST(request) {
  const { user, token } = await authenticateRequest(request);
  if (!user) {
    return corsError(request, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return corsError(request, 'Invalid JSON body', 400, 'INVALID_BODY');
  }

  const allowedFields = ['language', 'bookFilter'];
  const updates = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return corsError(request, 'No valid fields to update', 400, 'VALIDATION_ERROR');
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { user_metadata: { ...user.user_metadata, ...updates } }
  );

  if (error) {
    return corsError(request, error.message, 400, 'UPDATE_FAILED');
  }

  return corsJson(request, { user: userToProfile(data.user) });
}
