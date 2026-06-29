import { API_BASE_URL, fetchWithAuth } from './api';

export const authService = {
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        if (data?.token) {
            localStorage.setItem('jwt_token', data.token);
        }
        return data;
    },

    register: async (email: string, password: string, name: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        if (data?.token) {
            localStorage.setItem('jwt_token', data.token);
        }
        return data;
    },

    getCurrentUser: () => fetchWithAuth('/auth/me'),

    logout: () => {
        localStorage.removeItem('jwt_token');
        return Promise.resolve();
    }
};
