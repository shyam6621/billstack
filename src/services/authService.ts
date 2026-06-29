import { API_BASE_URL, fetchWithAuth } from './api';

async function readAuthResponse(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || fallbackMessage);
  }

  return response.json();
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    return readAuthResponse(response, 'Login failed');
  },

  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    return readAuthResponse(response, 'Registration failed');
  },

  getCurrentUser: () => fetchWithAuth('/auth/me'),

  logout: () => Promise.resolve(),
};
