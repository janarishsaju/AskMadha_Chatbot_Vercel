/**
 * CORS headers for the mobile app API.
 * The mobile app makes cross-origin requests to the Next.js API.
 */

const ALLOWED_ORIGINS = [
  'https://www.askmadha.com',
  'https://askmadha.com',
  // Vercel preview/stage/dev deployments
  'https://ask-madha-website-git-stage-deepflock.vercel.app',
  'https://ask-madha-website-git-dev-deepflock.vercel.app',
  // Local development
  'http://localhost:8081',
  'http://localhost:8082',
  'exp://localhost:8081',
];

/**
 * Get CORS headers for a request, reflecting the origin if allowed.
 * Mobile apps may not send an Origin header, so we allow requests without one.
 */
export function getCorsHeaders(request) {
  const origin = request.headers.get('origin');

  const allowedOrigin =
    !origin || ALLOWED_ORIGINS.includes(origin)
      ? origin || '*'
      : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Id',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/**
 * Handle CORS preflight OPTIONS requests.
 */
export function handlePreflight(request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

/**
 * Wrap a response with CORS headers.
 */
export function corsResponse(request, body, init = {}) {
  const corsHeaders = getCorsHeaders(request);
  return new Response(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

/**
 * JSON response with CORS headers.
 */
export function corsJson(request, data, status = 200) {
  return corsResponse(request, JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Error JSON response with CORS headers.
 */
export function corsError(request, message, status = 400, code) {
  return corsJson(request, { error: { message, code } }, status);
}
