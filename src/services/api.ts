const defaultApiUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:8080/api` : 'http://localhost:8080/api';
export const API_BASE_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

// Interceptor logic for fetch to inject JWT tokens
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('jwt_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized globally if needed
  if (response.status === 401) {
    localStorage.removeItem('jwt_token');
    // Optional: trigger a redirect to login if we can hook into router
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  // Handle empty responses
  if (response.status === 204) return null;

  return response.json();
}
