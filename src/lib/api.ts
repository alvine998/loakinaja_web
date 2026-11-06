const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const TOKEN_KEY = 'loakinaja_api_token';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveAuthToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, guestToken?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (guestToken) headers.set('X-Guest-Order-Token', guestToken);
  const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (options.body && !isMultipart && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi dan coba lagi.');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(payload?.error || `Permintaan gagal (${response.status})`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
