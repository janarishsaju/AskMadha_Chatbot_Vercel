import { supabaseAdmin } from './supabaseAdmin';

/**
 * Verify a Supabase access token and return the user.
 * Returns { user: null } if the token is invalid or expired.
 */
export async function verifyToken(token) {
  if (!token) return { user: null };

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return { user: null };
  return { user };
}

/**
 * Extract and verify the Bearer token from the Authorization header.
 * Returns { user, token } on success, or { user: null, token: null } on failure.
 */
export async function authenticateRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, token: null };
  }

  const token = authHeader.slice(7);
  const { user } = await verifyToken(token);

  if (!user) return { user: null, token: null };
  return { user, token };
}

/**
 * Map a Supabase user object to the profile shape expected by the mobile app.
 */
export function userToProfile(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    displayName:
      meta.displayName ||
      meta.full_name ||
      (user.email ? user.email.split('@')[0] : 'Dear Friend'),
    email: user.email,
    avatarUrl: meta.avatarUrl || meta.avatar_url || undefined,
    language: meta.language || 'english',
    bookFilter: meta.bookFilter || 'all',
    subscriptionTier: meta.subscriptionTier || 'free',
    streak: meta.streak || 0,
    createdAt: user.created_at || new Date().toISOString(),
  };
}
