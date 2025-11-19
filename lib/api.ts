// API client for communicating with worker-api

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Send cookies for session
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || `Request failed with status ${response.status}` };
    }

    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return { error: 'Network error. Please try again.' };
  }
}

// Session API
export interface Session {
  id: string;
  credits: number;
  createdAt: string;
}

export async function getSession(): Promise<ApiResponse<{ session: Session | null }>> {
  return apiRequest('/session', { method: 'GET' });
}

export async function createSession(): Promise<ApiResponse<{ session: Session }>> {
  return apiRequest('/session', { method: 'POST' });
}

// Aura API
export interface Aura {
  id: string;
  imageUrl: string;
  auraColor?: string;
  auraDescription?: string;
  personalityAnswers?: Record<string, string>;
  createdAt: string;
}

export interface AuraResponse {
  aura: Aura;
}

export async function createAura(
  imageData: string,
  personalityAnswers: Record<string, string>
): Promise<ApiResponse<{ aura: Aura; credits: number }>> {
  return apiRequest('/aura', {
    method: 'POST',
    body: JSON.stringify({ imageData, personalityAnswers }),
  });
}

export async function getAura(id: string): Promise<ApiResponse<AuraResponse>> {
  return apiRequest(`/aura/${id}`, { method: 'GET' });
}

// Image URL helper
export function getImageUrl(imageKey: string): string {
  return `${API_URL}/image/${imageKey}`;
}
