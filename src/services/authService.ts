import { fetchWithAuth } from './api';

export const authService = {
    login: async (email: string, password: string) => {
        const response = await fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        // Assuming backend returns { token: "...", user: {...} }
        if (response?.token) {
            localStorage.setItem('jwt_token', response.token);
        }
        return response;
    },

    register: async (email: string, password: string, name: string) => {
        const response = await fetchWithAuth('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
        return response;
    },

    getCurrentUser: () => fetchWithAuth('/auth/me'),

    logout: () => {
        localStorage.removeItem('jwt_token');
        return Promise.resolve();
    }
};
