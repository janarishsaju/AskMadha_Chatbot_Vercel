import { proxyToAlb } from '@/lib/proxy';
import { handlePreflight } from '@/lib/cors';

export const runtime = 'nodejs';

export async function OPTIONS(request) {
  return handlePreflight(request);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  return proxyToAlb(request, 'DELETE', `/api/sessions/${id}`, {
    successOn404: true,
  });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.text();
  return proxyToAlb(request, 'PATCH', `/api/sessions/${id}`, { body });
}
