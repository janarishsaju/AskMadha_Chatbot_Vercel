import { corsJson, handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

export async function GET(request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const albBaseUrl = process.env.ALB_BASE_URL;

  return corsJson(request, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL: supabaseUrl ? 'set' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey ? 'set' : 'missing',
      ALB_BASE_URL: albBaseUrl ? 'set' : 'missing',
    },
  });
}
