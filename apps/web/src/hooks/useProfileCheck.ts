// apps/web/src/hooks/useProfileCheck.ts

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    email: string;
    role: 'PATIENT' | 'DOCTOR' | 'PHYSIO' | 'ADMIN';
    firstName?: string;
    lastName?: string;
}

export function useProfileCheck() {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');

                if (!token || !userStr) {
                    // Not logged in, redirect to login
                    if (!pathname.startsWith('/auth')) {
                        router.push('/auth/login');
                    }
                    setIsChecking(false);
                    return;
                }

                const currentUser: User = JSON.parse(userStr);
                setUser(currentUser);

                // Skip check if already on onboarding pages
                if (pathname.startsWith('/onboarding')) {
                    setIsChecking(false);
                    return;
                }

                // Skip check for auth pages
                if (pathname.startsWith('/auth')) {
                    setIsChecking(false);
                    return;
                }

                // Check if profile is complete based on role
                let profileEndpoint = '';
                let onboardingRoute = '';

                switch (currentUser.role) {
                    case 'PATIENT':
                        profileEndpoint = '/profiles/patient';
                        onboardingRoute = '/onboarding/patient';
                        break;
                    case 'DOCTOR':
                        profileEndpoint = '/profiles/doctor';
                        onboardingRoute = '/onboarding/doctor';
                        break;
                    case 'PHYSIO':
                        profileEndpoint = '/profiles/physio';
                        onboardingRoute = '/onboarding/physio';
                        break;
                    case 'ADMIN':
                        // Admins don't need profile onboarding
                        setIsChecking(false);
                        return;
                }

                // Try to fetch the profile
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}${profileEndpoint}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    // Profile doesn't exist, redirect to onboarding
                    router.push(onboardingRoute);
                }

                setIsChecking(false);
            } catch (error) {
                console.error('Error checking profile:', error);
                setIsChecking(false);
            }
        };

        checkProfile();
    }, [pathname, router]);

    return { isChecking, user };
}

// Usage in any protected page:
// const { isChecking, user } = useProfileCheck();
// if (isChecking) return <LoadingSpinner />;
// return <YourPageContent />;