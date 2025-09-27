const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
    id: string;
    email: string;
    role: 'PATIENT' | 'DOCTOR' | 'PHYSIO' | 'ADMIN';
    isVerified: boolean;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface RegisterData {
    email: string;
    password: string;
    phone?: string;
    role: 'PATIENT' | 'DOCTOR' | 'PHYSIO';
}

export interface LoginData {
    email: string;
    password: string;
}

class ApiClient {
    private getHeaders(token?: string) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        return response.json();
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    }

    async getProfile(token: string): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: this.getHeaders(token),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return response.json();
    }

    async verifyToken(token: string): Promise<{ valid: boolean; user: User }> {
        const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
            method: 'POST',
            headers: this.getHeaders(token),
        });

        if (!response.ok) {
            throw new Error('Token verification failed');
        }

        return response.json();
    }
}

export const apiClient = new ApiClient();