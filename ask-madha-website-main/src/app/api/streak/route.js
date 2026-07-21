import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateRequest } from '@/lib/auth';
import { corsJson, corsError, handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

/**
 * GET /api/streak?month=YYYY-MM
 *
 * Returns:
 *  - streak: current consecutive-day streak
 *  - lastVisitDate: most recent visit date (YYYY-MM-DD)
 *  - longestStreak: best streak ever achieved
 *  - monthlyVisits: array of { date: "YYYY-MM-DD" } for the requested month (defaults to current month)
 *  - totalVisits: lifetime total visit count
 */
export async function GET(request) {
  const { user } = await authenticateRequest(request);
  if (!user) {
    return corsError(request, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  // Parse optional ?month=YYYY-MM (defaults to current month)
  const url = new URL(request.url);
  const monthParam = url.searchParams.get('month');
  const now = new Date();
  const year = monthParam ? parseInt(monthParam.slice(0, 4), 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam.slice(5, 7), 10) - 1 : now.getMonth();

  const monthStart = new Date(year, month, 1).toISOString().slice(0, 10);
  const monthEnd = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  // Fetch all visits for the user (limited to last 400 days for streak calc)
  const { data: allVisits, error: fetchError } = await supabaseAdmin
    .from('streak_visits')
    .select('visit_date')
    .eq('user_id', user.id)
    .order('visit_date', { ascending: false })
    .limit(400);

  if (fetchError) {
    return corsError(request, fetchError.message, 500, 'DB_ERROR');
  }

  const visitDates = (allVisits || []).map((v) => v.visit_date);
  const visitSet = new Set(visitDates);

  // Compute current streak
  const today = now.toISOString().slice(0, 10);
  let streak = 0;
  if (visitDates.length > 0) {
    const cursor = new Date(today);
    if (!visitSet.has(today)) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (visitSet.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  // Compute longest streak
  let longestStreak = 0;
  if (visitDates.length > 0) {
    const sorted = [...visitSet].sort();
    let run = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = Math.round((curr - prev) / 86400000);
      if (diff === 1) {
        run++;
      } else {
        longestStreak = Math.max(longestStreak, run);
        run = 1;
      }
    }
    longestStreak = Math.max(longestStreak, run);
  }

  // Monthly visits for the requested month
  const monthlyVisits = visitDates
    .filter((d) => d >= monthStart && d <= monthEnd)
    .map((d) => ({ date: d }));

  return corsJson(request, {
    streak,
    lastVisitDate: visitDates[0] || null,
    longestStreak,
    totalVisits: visitDates.length,
    monthlyVisits,
    month: `${year}-${String(month + 1).padStart(2, '0')}`,
  });
}
