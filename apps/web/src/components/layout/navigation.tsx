'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

interface NavigationProps {
    userRole?: 'PATIENT' | 'DOCTOR' | 'PHYSIO' | 'ADMIN';
}

export function Navigation({ userRole }: NavigationProps) {
    const { user, logout } = useAuth();

    const getNavigationItems = () => {
        switch (userRole || user?.role) {
            case 'PATIENT':
                return [
                    { href: '/patient/dashboard', label: 'Dashboard' },
                    { href: '/patient/appointments', label: 'Appointments' },
                    { href: '/patient/referrals', label: 'Referrals' },
                    { href: '/patient/history', label: 'Medical History' },
                ];
            case 'DOCTOR':
                return [
                    { href: '/doctor/dashboard', label: 'Dashboard' },
                    { href: '/doctor/consultations', label: 'Consultations' },
                    { href: '/doctor/patients', label: 'Patients' },
                    { href: '/doctor/referrals', label: 'Referrals' },
                    { href: '/doctor/calendar', label: 'Calendar' },
                ];
            case 'PHYSIO':
                return [
                    { href: '/physio/dashboard', label: 'Dashboard' },
                    { href: '/physio/appointments', label: 'Appointments' },
                    { href: '/physio/patients', label: 'Patients' },
                    { href: '/physio/services', label: 'Services' },
                    { href: '/physio/calendar', label: 'Calendar' },
                ];
            case 'ADMIN':
                return [
                    { href: '/admin/dashboard', label: 'Dashboard' },
                    { href: '/admin/users', label: 'Users' },
                    { href: '/admin/analytics', label: 'Analytics' },
                    { href: '/admin/settings', label: 'Settings' },
                ];
            default:
                return [];
        }
    };

    const navigationItems = getNavigationItems();

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and brand */}
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-gray-900">
                            Physio-Doctor Platform
                        </Link>
                    </div>

                    {/* Navigation links */}
                    <div className="hidden md:flex items-center space-x-4">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* User menu */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <Avatar className="h-8 w-8 bg-blue-500 text-white">
                    <span className="text-sm font-medium">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                                    </Avatar>
                                    <div className="hidden md:block">
                                        <p className="text-sm font-medium text-gray-700">{user.email}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={logout}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/auth/login">
                                    <Button variant="outline" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button size="sm">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}