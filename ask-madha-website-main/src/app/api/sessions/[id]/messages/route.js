import { proxyToAlb } from '@/lib/proxy';
import { handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

export async function GET(request, { params }) {
  const { id } = await params;
  return proxyToAlb(request, 'GET', `/api/sessions/${id}/messages`);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.text();
  return proxyToAlb(request, 'POST', `/api/sessions/${id}/messages`, { body });
}
