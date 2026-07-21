import { authenticateRequest } from './auth';
import { corsError, corsResponse, getCorsHeaders } from './cors';

const ALB_BASE_URL =
  process.env.ALB_BASE_URL ||
  'http://madhagpt-dev-alb-1987017600.ap-south-1.elb.amazonaws.com';

/**
 * Build headers to forward to the ALB backend.
 * Includes the verified Supabase JWT and the client ID.
 */
function buildProxyHeaders(request, token, user) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'X-Client-Id': user?.id || request.headers.get('x-client-id') || '',
  };
}

/**
 * Generic proxy handler for forwarding authenticated requests to the ALB backend.
 *
 * @param {Request} request - The incoming Next.js request
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {string} path - The path on the ALB backend (e.g. "/api/sessions")
 * @param {object} options - { body: string|null, successStatus: number }
 * @returns {Response} - CORS-enabled response
 */
export async function proxyToAlb(request, method, path, options = {}) {
  const { user, token } = await authenticateRequest(request);
  if (!user) {
    return corsError(request, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  const url = `${ALB_BASE_URL}${path}`;
  const headers = buildProxyHeaders(request, token, user);

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: options.body || undefined,
    });
  } catch {
    return corsError(
      request,
      'Could not reach the backend service.',
      502,
      'BACKEND_UNREACHABLE'
    );
  }

  const corsHeaders = getCorsHeaders(request);

  // For 204 No Content, return empty response
  if (res.status === 204) {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // For 404 on DELETE, treat as success (already gone)
  if (options.successOn404 && res.status === 404) {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const text = await res.text();
  const contentType = res.headers.get('content-type') || 'application/json';

  return new Response(text, {
    status: res.status,
    headers: {
      ...corsHeaders,
      'Content-Type': contentType,
    },
  });
}

/**
 * Generic proxy for public (unauthenticated) ALB endpoints.
 * Used for Bible search and daily verse — no auth required.
 */
export async function proxyToAlbPublic(request, method, path) {
  const url = `${ALB_BASE_URL}${path}`;

  let res;
  try {
    res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return corsError(
      request,
      'Could not reach the backend service.',
      502,
      'BACKEND_UNREACHABLE'
    );
  }

  const corsHeaders = getCorsHeaders(request);
  const text = await res.text();
  const contentType = res.headers.get('content-type') || 'application/json';

  return new Response(text, {
    status: res.status,
    headers: {
      ...corsHeaders,
      'Content-Type': contentType,
    },
  });
}

/**
 * SSE stream proxy for the ALB backend's streaming endpoint.
 * Pipes the upstream SSE response directly to the client.
 */
export async function proxySseStream(request, path) {
  const { user, token } = await authenticateRequest(request);
  if (!user) {
    return corsError(request, 'Unauthorized', 401, 'UNAUTHORIZED');
  }

  const url = `${ALB_BASE_URL}${path}`;
  const headers = buildProxyHeaders(request, token, user);
  headers['Accept'] = 'text/event-stream';

  let res;
  try {
    res = await fetch(url, { method: 'GET', headers });
  } catch {
    return corsError(
      request,
      'Could not reach the backend service.',
      502,
      'BACKEND_UNREACHABLE'
    );
  }

  if (!res.ok) {
    const text = await res.text();
    return corsResponse(request, text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    });
  }

  const corsHeaders = getCorsHeaders(request);

  return new Response(res.body, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
