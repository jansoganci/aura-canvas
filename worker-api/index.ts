// Main Worker API Router

import { handleOptions, errorResponse, jsonResponse } from './lib/cors';
import { handleSession } from './routes/session';
import { handleAura, analyzeAura } from './routes/aura';

export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  APP_URL: string;
  GEMINI_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get('Origin');

    // Allowed origins for CORS
    const allowedOrigins = [
      env.APP_URL,
      'http://localhost:3000',
      'https://aura-canvas.pages.dev',
    ];

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return handleOptions(origin, allowedOrigins);
    }

    try {
      // Route: /session
      if (path === '/session') {
        return handleSession(request, env, origin, allowedOrigins);
      }

      // Route: /analyze (AI only, no storage)
      if (path === '/analyze' && method === 'POST') {
        return analyzeAura(request, env, origin, allowedOrigins);
      }

      // Route: /aura (create with storage - legacy)
      if (path === '/aura' && method === 'POST') {
        return handleAura(request, env, origin, allowedOrigins);
      }

      // Route: /aura/:id (get)
      const auraMatch = path.match(/^\/aura\/([a-zA-Z0-9_-]+)$/);
      if (auraMatch && method === 'GET') {
        return handleAura(request, env, origin, allowedOrigins, auraMatch[1]);
      }

      // Route: /image/:key (serve images from R2)
      const imageMatch = path.match(/^\/image\/(.+)$/);
      if (imageMatch && method === 'GET') {
        return handleImage(env.IMAGES, imageMatch[1]);
      }

      // Route: /credits (TODO: implement in Phase 4)
      if (path === '/credits') {
        return errorResponse('Not implemented', origin, allowedOrigins, 501);
      }

      // Route: /webhook/stripe (TODO: implement in Phase 4)
      if (path === '/webhook/stripe') {
        return errorResponse('Not implemented', origin, allowedOrigins, 501);
      }

      // 404 for unknown routes
      return errorResponse('Not found', origin, allowedOrigins, 404);

    } catch (error) {
      console.error('Unhandled error:', error);
      return errorResponse('Internal server error', origin, allowedOrigins, 500);
    }
  },
};

// Serve images from R2
async function handleImage(r2: R2Bucket, key: string): Promise<Response> {
  const object = await r2.get(key);

  if (!object) {
    return new Response('Image not found', { status: 404 });
  }

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=31536000');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(object.body, { headers });
}
