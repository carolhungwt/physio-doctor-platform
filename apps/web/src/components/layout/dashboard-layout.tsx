'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from './navigation';
import { useAuth } from '@/hooks/useAuth';

interface DashboardLayoutProps {
    children: React.ReactNode;
    requiredRole?: 'PATIENT' | 'DOCTOR' | 'PHYSIO' | 'ADMIN';
    title?: string;
}

export function DashboardLayout({ children, requiredRole, title }: DashboardLayoutProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Redirect to login if not authenticated
            if (!isAuthenticated) {
                router.push('/auth/login');
                return;
            }

            // Check role-based access
            if (requiredRole && user?.role !== requiredRole) {
                // Redirect to appropriate dashboard based on user role
                switch (user?.role) {
                    case 'PATIENT':
                        router.push('/patient/dashboard');
                        break;
                    case 'DOCTOR':
                        router.push('/doctor/dashboard');
                        break;
                    case 'PHYSIO':
                        router.push('/physio/dashboard');
                        break;
                    case 'ADMIN':
                        router.push('/admin/dashboard');
                        break;
                    default:
                        router.push('/auth/login');
                }
                return;
            }
        }
    }, [loading, isAuthenticated, user, requiredRole, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated or wrong role
    if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation userRole={user?.role} />

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {title && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    </div>
                )}

                <div className="px-4 py-6 sm:px-0">
                    {children}
                </div>
            </main>
        </div>
    );
}