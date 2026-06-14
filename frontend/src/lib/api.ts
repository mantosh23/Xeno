import { useAuthStore } from '../store/useAuthStore';

/**
 * A wrapper around the native `fetch` API that automatically injects 
 * the Supabase JWT Bearer token from the Zustand auth store into the headers.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const session = useAuthStore.getState().session;
  
  const headers = new Headers(init?.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  // Ensure Content-Type is set if body is present and not FormData
  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Resolve API URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  let urlStr = typeof input === 'string' ? input : input.toString();

  // If the URL is relative (e.g. /api/campaigns), prefix it with the API_BASE_URL
  if (urlStr.startsWith('/')) {
    urlStr = `${API_BASE_URL}${urlStr}`;
  } 
  // If the URL has localhost hardcoded, safely replace it with API_BASE_URL in production
  else if (urlStr.startsWith('http://localhost:3000')) {
    urlStr = urlStr.replace('http://localhost:3000', API_BASE_URL);
  }

  return fetch(urlStr, {
    ...init,
    headers,
  });
}
