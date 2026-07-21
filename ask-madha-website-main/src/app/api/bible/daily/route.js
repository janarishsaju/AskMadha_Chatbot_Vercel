import { proxyToAlbPublic } from '@/lib/proxy';
import { handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

export async function GET(request) {
  return proxyToAlbPublic(request, 'GET', '/api/bible/daily');
}
