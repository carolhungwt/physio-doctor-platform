'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/api';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for stored authentication
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
            } catch (error) {
                // Invalid stored data, clear it
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.push('/auth/login');
    };

    const login = (authToken: string, userData: User) => {
        localStorage.setItem('access_token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
    };

    return {
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
    };
}