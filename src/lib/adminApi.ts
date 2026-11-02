const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const ADMIN_TOKEN_KEY = 'loakinaja_admin_api_token';

export function clearAdminToken() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const payload = response.status === 204 ? undefined : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') clearAdminToken();
    throw new Error(payload?.error || `Permintaan admin gagal (${response.status})`);
  }
  return payload as T;
}

export async function adminLogin(email: string, password: string) {
  const result = await adminRequest<{ token: string; admin: { email: string; role: 'admin' } }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  window.localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
  return result.admin;
}
