// Aura routes

import { nanoid } from 'nanoid';
import {
  createAura,
  getAuraById,
  getSessionByToken,
  updateCredits,
} from '../lib/db';
import { uploadImage, parseBase64Image } from '../lib/r2';
import { jsonResponse, errorResponse } from '../lib/cors';

export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  APP_URL: string;
  GEMINI_API_KEY: string;
}

// Gemini API response types
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface AuraResult {
  color: string;
  description: string;
}

// Call Gemini Vision API to analyze the image
async function analyzeAuraWithGemini(
  imageBase64: string,
  energy: string,
  element: string,
  apiKey: string
): Promise<AuraResult> {
  const prompt = `You are an aura reader. Analyze this person's photo and determine their aura color.

The person described their energy as: ${energy}
The person chose this element: ${element}

Based on the photo and these inputs, determine which aura color best fits this person.

Available colors: RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE, PINK, WHITE

Meanings:
- RED: Passion, Energy, Drive, Leadership
- ORANGE: Creativity, Joy, Enthusiasm, Adventure
- YELLOW: Optimism, Intellect, Happiness, Confidence
- GREEN: Growth, Healing, Balance, Compassion
- BLUE: Peace, Calm, Communication, Intuition
- PURPLE: Spirituality, Wisdom, Creativity, Mysticism
- PINK: Love, Tenderness, Affection, Empathy
- WHITE: Purity, Clarity, New beginnings, Spiritual awakening

Respond with ONLY valid JSON in this exact format:
{"color": "COLOR_NAME", "description": "A 1-2 sentence personalized description about this person's aura energy."}

Make the description fun, personal, and slightly mystical but relatable. Keep it short and punchy.`;

  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Failed to analyze image: ${response.status}`);
  }

  const data = await response.json() as GeminiResponse;
  console.log('Gemini response:', JSON.stringify(data, null, 2));

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error('No text in response. Full response:', JSON.stringify(data));
    throw new Error('No response from Gemini');
  }

  // Parse JSON from response (handle potential markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format');
  }

  const result = JSON.parse(jsonMatch[0]) as AuraResult;

  // Validate color
  const validColors = ['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE', 'PINK', 'WHITE'];
  if (!validColors.includes(result.color)) {
    result.color = 'PURPLE'; // Default fallback
  }

  return result;
}

// New: Analyze only (no storage)
export async function analyzeAura(
  request: Request,
  env: Env,
  origin: string | null,
  allowedOrigins: string[]
): Promise<Response> {
  try {
    const body = await request.json() as {
      imageData: string;
      energy: string;
      element: string;
    };

    if (!body.imageData) {
      return errorResponse('Image data required', origin, allowedOrigins, 400);
    }

    // Analyze with Gemini AI
    let auraResult: AuraResult;
    try {
      auraResult = await analyzeAuraWithGemini(
        body.imageData,
        body.energy || 'Good',
        body.element || 'Energy',
        env.GEMINI_API_KEY
      );
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      // Fallback if AI fails
      auraResult = {
        color: 'PURPLE',
        description: 'A unique and vibrant soul with endless potential.',
      };
    }

    return jsonResponse({
      color: auraResult.color,
      description: auraResult.description,
    }, origin, allowedOrigins);
  } catch (error) {
    console.error('Error analyzing aura:', error);
    return errorResponse('Failed to analyze aura', origin, allowedOrigins, 500);
  }
}

export async function handleAura(
  request: Request,
  env: Env,
  origin: string | null,
  allowedOrigins: string[],
  auraId?: string
): Promise<Response> {
  const method = request.method;

  if (method === 'POST' && !auraId) {
    return handleCreateAura(request, env, origin, allowedOrigins);
  }

  if (method === 'GET' && auraId) {
    return handleGetAura(request, env, origin, allowedOrigins, auraId);
  }

  return errorResponse('Method not allowed', origin, allowedOrigins, 405);
}

async function handleCreateAura(
  request: Request,
  env: Env,
  origin: string | null,
  allowedOrigins: string[]
): Promise<Response> {
  try {
    // Get session from cookie
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...vals] = c.trim().split('=');
        return [key, vals.join('=')];
      })
    );

    const sessionToken = cookies['aura_session'];
    if (!sessionToken) {
      return errorResponse('No session found', origin, allowedOrigins, 401);
    }

    const session = await getSessionByToken(env.DB, sessionToken);
    if (!session) {
      return errorResponse('Invalid session', origin, allowedOrigins, 401);
    }

    // Check credits
    if (session.credits < 1) {
      return errorResponse('No credits remaining', origin, allowedOrigins, 402);
    }

    // Parse request body
    const body = await request.json() as {
      imageData: string;
      personalityAnswers: Record<string, string>;
    };

    if (!body.imageData) {
      return errorResponse('Image data required', origin, allowedOrigins, 400);
    }

    const energy = body.personalityAnswers?.energy || 'Good';
    const element = body.personalityAnswers?.element || 'Energy';

    // Analyze with Gemini AI
    let auraResult: AuraResult;
    try {
      auraResult = await analyzeAuraWithGemini(
        body.imageData,
        energy,
        element,
        env.GEMINI_API_KEY
      );
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      // Fallback if AI fails
      auraResult = {
        color: 'PURPLE',
        description: 'A unique and vibrant soul with endless potential.',
      };
    }

    // Upload image to R2
    const imageKey = `auras/${nanoid()}.jpg`;
    const { buffer, contentType } = parseBase64Image(body.imageData);
    await uploadImage(env.IMAGES, imageKey, buffer, contentType);

    // Create aura record
    const aura = await createAura(
      env.DB,
      session.id,
      imageKey,
      auraResult.color,
      auraResult.description,
      body.personalityAnswers || {}
    );

    // Deduct credit
    await updateCredits(env.DB, session.id, session.credits - 1);

    return jsonResponse({
      aura: {
        id: aura.id,
        imageUrl: aura.image_url,
        auraColor: aura.aura_color,
        auraDescription: aura.aura_description,
        createdAt: aura.created_at,
      },
      credits: session.credits - 1,
    }, origin, allowedOrigins);
  } catch (error) {
    console.error('Error creating aura:', error);
    return errorResponse('Failed to create aura', origin, allowedOrigins, 500);
  }
}

async function handleGetAura(
  request: Request,
  env: Env,
  origin: string | null,
  allowedOrigins: string[],
  auraId: string
): Promise<Response> {
  try {
    const aura = await getAuraById(env.DB, auraId);

    if (!aura) {
      return errorResponse('Aura not found', origin, allowedOrigins, 404);
    }

    return jsonResponse({
      aura: {
        id: aura.id,
        imageUrl: aura.image_url,
        auraColor: aura.aura_color,
        auraDescription: aura.aura_description,
        personalityAnswers: aura.personality_answers ? JSON.parse(aura.personality_answers) : {},
        createdAt: aura.created_at,
      },
    }, origin, allowedOrigins);
  } catch (error) {
    console.error('Error getting aura:', error);
    return errorResponse('Failed to get aura', origin, allowedOrigins, 500);
  }
}
