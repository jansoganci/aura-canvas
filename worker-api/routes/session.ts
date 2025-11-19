// Session management routes

import { createSession, getSessionByToken } from '../lib/db';
import { jsonResponse, errorResponse } from '../lib/cors';

export interface Env {
  DB: D1Database;
  APP_URL: string;
}

export async function handleSession(
  request: Request,
  env: Env,
  origin: string | null,
  allowedOrigins: string[]
): Promise<Response> {
  const method = request.method;

  if (method === 'POST') {
    return handleCreateSession(request, env, origin, allowedOrigins);
  }

  if (method === 'GET') {
    return handleGetSession(request, env, origin, allowedOrigins);
  }

  return errorResponse('Method not allowed', origin, allowedOrigins, 405);
}

async function handleCreateSession(
  request: Request,
  env: Env,
  origin: string | null,
  allowedOrigins: string[]
): Promise<Response> {
  try {
    const session = await createSession(env.DB);

    const response = jsonResponse({
      session: {
        id: session.id,
        credits: session.credits,
        createdAt: session.created_at,
      },
    }, origin, allowedOrigins);

    // Set session cookie
    response.headers.append(
      'Set-Cookie',
      `aura_session=${session.session_token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=31536000`
    );

    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return errorResponse('Failed to create session', origin, allowedOrigins, 500);
  }
}

async function handleGetSession(
  request: Request,
  env: Env,
  origin: string | null,
  allowedOrigins: string[]
): Promise<Response> {
  try {
    // Get session token from cookie
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...vals] = c.trim().split('=');
        return [key, vals.join('=')];
      })
    );

    const sessionToken = cookies['aura_session'];

    if (!sessionToken) {
      return jsonResponse({ session: null }, origin, allowedOrigins);
    }

    const session = await getSessionByToken(env.DB, sessionToken);

    if (!session) {
      return jsonResponse({ session: null }, origin, allowedOrigins);
    }

    return jsonResponse({
      session: {
        id: session.id,
        credits: session.credits,
        createdAt: session.created_at,
      },
    }, origin, allowedOrigins);
  } catch (error) {
    console.error('Error getting session:', error);
    return errorResponse('Failed to get session', origin, allowedOrigins, 500);
  }
}
