// CORS configuration for cross-origin requests

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be set dynamically
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export function getCorsHeaders(origin: string | null, allowedOrigins: string[]): HeadersInit {
  const isAllowed = origin && (
    allowedOrigins.includes(origin) ||
    allowedOrigins.includes('*') ||
    origin.includes('localhost') ||
    origin.includes('pages.dev')
  );

  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
  };
}

export function handleOptions(origin: string | null, allowedOrigins: string[]): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin, allowedOrigins),
  });
}

export function jsonResponse(
  data: unknown,
  origin: string | null,
  allowedOrigins: string[],
  status = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin, allowedOrigins),
    },
  });
}

export function errorResponse(
  message: string,
  origin: string | null,
  allowedOrigins: string[],
  status = 400
): Response {
  return jsonResponse({ error: message }, origin, allowedOrigins, status);
}
