import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateRequest, userToProfile } from '@/lib/auth';
import { corsJson, corsError, handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

/**
 * POST /api/streak/visit
 * Called once per day when the user opens the app/website.
 * Records today's visit (idempotent) and updates the streak count.
 *
 * Response: { streak, lastVisitDate, isNewVisit }
 */
export async function POST(request) {
  const { user } = await authenticateRequest(request);
  if (!user) {
    return corsError(request, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Insert today's visit — on conflict do nothing (idempotent)
  const { error: insertError } = await supabaseAdmin
    .from('streak_visits')
    .upsert({ user_id: user.id, visit_date: today }, { onConflict: 'user_id,visit_date' });

  if (insertError) {
    return corsError(request, insertError.message, 500, 'DB_ERROR');
  }

  // Fetch the last 400 days of visits to compute streak (covers >1 year)
  const { data: visits, error: fetchError } = await supabaseAdmin
    .from('streak_visits')
    .select('visit_date')
    .eq('user_id', user.id)
    .order('visit_date', { ascending: false })
    .limit(400);

  if (fetchError) {
    return corsError(request, fetchError.message, 500, 'DB_ERROR');
  }

  // Compute current streak: consecutive days ending today or yesterday
  let streak = 0;
  if (visits && visits.length > 0) {
    const visitSet = new Set(visits.map((v) => v.visit_date));
    const cursor = new Date(today);
    // If today not visited yet (shouldn't happen after upsert, but be safe),
    // start from yesterday so streak doesn't break before today's visit
    if (!visitSet.has(today)) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (visitSet.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Update streak in user_metadata so it's available everywhere
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { user_metadata: { ...user.user_metadata, streak } }
  );

  if (updateError) {
    // Non-fatal — streak is still computed from visits table
    console.error('Failed to update streak in user_metadata:', updateError.message);
  }

  return corsJson(request, {
    streak,
    lastVisitDate: today,
    isNewVisit: true,
  });
}
