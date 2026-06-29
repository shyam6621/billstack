function getDefaultApiUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:8080/api';

  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  return isLocalHost ? 'http://localhost:8080/api' : '';
}

function normalizeApiBaseUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const configuredApiUrl = import.meta.env.VITE_API_URL || getDefaultApiUrl();

if (!configuredApiUrl) {
  throw new Error('Missing VITE_API_URL. Set it to your Render backend URL, for example https://billstack-api.onrender.com/api.');
}

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiUrl);

export function getStoredToken() {
  return localStorage.getItem('billstack_token') ?? localStorage.getItem('jwt_token');
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('billstack_token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('billstack_user');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
