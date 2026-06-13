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

  return fetch(input, {
    ...init,
    headers,
  });
}
