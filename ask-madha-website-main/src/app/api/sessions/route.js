import { proxyToAlb } from '@/lib/proxy';
import { handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

export async function GET(request) {
  return proxyToAlb(request, 'GET', '/api/sessions');
}

export async function POST(request) {
  const body = await request.text();
  return proxyToAlb(request, 'POST', '/api/sessions', { body });
}
