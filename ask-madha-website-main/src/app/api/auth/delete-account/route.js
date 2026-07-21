import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateRequest } from '@/lib/auth';
import { corsJson, corsError, handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

export async function DELETE(request) {
  const { user, token } = await authenticateRequest(request);
  if (!user) {
    return corsError(request, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (error) {
    return corsError(request, error.message, 400, 'DELETE_FAILED');
  }

  return corsJson(request, { success: true });
}
