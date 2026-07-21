import { proxySseStream } from '@/lib/proxy';
import { handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

export async function GET(request, { params }) {
  const { id, token } = await params;
  return proxySseStream(request, `/api/sessions/${id}/stream/${token}`);
}
