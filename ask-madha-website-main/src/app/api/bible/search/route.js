import { proxyToAlbPublic } from '@/lib/proxy';
import { handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const book = searchParams.get('book');
  const limit = searchParams.get('limit');

  const params = new URLSearchParams({ q });
  if (book) params.set('book', book);
  if (limit) params.set('limit', limit);

  return proxyToAlbPublic(request, 'GET', `/api/bible/search?${params.toString()}`);
}
