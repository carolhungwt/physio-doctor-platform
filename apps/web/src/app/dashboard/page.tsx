'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    Users,
    FileText,
    DollarSign,
    Activity,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

interface User {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role: 'PATIENT' | 'DOCTOR' | 'PHYSIO' | 'ADMIN';
}

interface DashboardStats {
    patient: {
        upcomingAppointments: number;
        activeReferrals: number;
        completedSessions: number;
    };
    doctor: {
        pendingReferrals: number;
        totalReferrals: number;
        monthlyEarnings: number;
        patients: number;
    };
    physio: {
        todayAppointments: number;
        weekAppointments: number;
        monthlyRevenue: number;
        activePatients: number;
    };
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileComplete, setProfileComplete] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                router.push('/auth/login');
                return;
            }

            const currentUser: User = JSON.parse(userStr);
            setUser(currentUser);

            // Check if profile is complete
            await checkProfile(currentUser, token);

            setLoading(false);
        };

        checkAuth();
    }, [router]);

    const checkProfile = async (currentUser: User, token: string) => {
        try {
            let endpoint = '';
            switch (currentUser.role) {
                case 'PATIENT':
                    endpoint = '/profiles/patient';
                    break;
                case 'DOCTOR':
                    endpoint = '/profiles/doctor';
                    break;
                case 'PHYSIO':
                    endpoint = '/profiles/physio';
                    break;
                default:
                    setProfileComplete(true);
                    return;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                setProfileComplete(true);
                // TODO: Fetch real stats from API
                // For now, using mock data
                setStats({
                    patient: {
                        upcomingAppointments: 2,
                        activeReferrals: 1,
                        completedSessions: 5
                    },
                    doctor: {
                        pendingReferrals: 3,
                        totalReferrals: 15,
                        monthlyEarnings: 4500,
                        patients: 12
                    },
                    physio: {
                        todayAppointments: 4,
                        weekAppointments: 18,
                        monthlyRevenue: 28000,
                        activePatients: 25
                    }
                });
            } else {
                setProfileComplete(false);
            }
        } catch (error) {
            console.error('Error checking profile:', error);
            setProfileComplete(false);
        }
    };

    const handleCompleteProfile = () => {
        if (!user) return;

        switch (user.role) {
            case 'PATIENT':
                router.push('/onboarding/patient');
                break;
            case 'DOCTOR':
                router.push('/onboarding/doctor');
                break;
            case 'PHYSIO':
                router.push('/onboarding/physio');
                break;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!profileComplete && user?.role !== 'ADMIN') {
        return (
            <div className="container max-w-2xl mx-auto px-4 py-16">
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                            <CardTitle>Complete Your Profile</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-700">
                            Welcome! To start using the platform, please complete your {user?.role.toLowerCase()} profile.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                            {user?.role === 'PATIENT' && (
                                <>
                                    <li>Medical history</li>
                                    <li>Emergency contact information</li>
                                    <li>Allergies and current medications</li>
                                </>
                            )}
                            {user?.role === 'DOCTOR' && (
                                <>
                                    <li>Medical license verification</li>
                                    <li>Specialties and consultation fees</li>
                                    <li>Banking details for referral fees</li>
                                </>
                            )}
                            {user?.role === 'PHYSIO' && (
                                <>
                                    <li>License verification</li>
                                    <li>Services and pricing</li>
                                    <li>Availability schedule</li>
                                </>
                            )}
                        </ul>
                        <Button onClick={handleCompleteProfile} className="w-full">
                            Complete Profile Setup
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getDisplayName = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user?.username || user?.email || 'User';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome back, {getDisplayName()}!</h1>
                <p className="text-gray-600 mt-2">
                    {user?.role === 'PATIENT' && 'Manage your appointments and referrals'}
                    {user?.role === 'DOCTOR' && 'Manage your patients and referrals'}
                    {user?.role === 'PHYSIO' && 'Manage your appointments and services'}
                    {user?.role === 'ADMIN' && 'Platform administration'}
                </p>
            </div>

            {/* Patient Dashboard */}
            {user?.role === 'PATIENT' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.patient.upcomingAppointments}</div>
                            <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
                            <FileText className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.patient.activeReferrals}</div>
                            <p className="text-xs text-gray-500 mt-1">Valid referrals</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
                            <CheckCircle className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.patient.completedSessions}</div>
                            <p className="text-xs text-gray-500 mt-1">Total sessions</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Doctor Dashboard */}
            {user?.role === 'DOCTOR' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
                            <Clock className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.doctor.pendingReferrals}</div>
                            <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                            <FileText className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.doctor.totalReferrals}</div>
                            <p className="text-xs text-gray-500 mt-1">All time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
                            <DollarSign className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">HK${stats.doctor.monthlyEarnings}</div>
                            <p className="text-xs text-gray-500 mt-1">Referral fees (20%)</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                            <Users className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.doctor.patients}</div>
                            <p className="text-xs text-gray-500 mt-1">Under your care</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Physio Dashboard */}
            {user?.role === 'PHYSIO' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.physio.todayAppointments}</div>
                            <p className="text-xs text-gray-500 mt-1">Scheduled for today</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <Activity className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.physio.weekAppointments}</div>
                            <p className="text-xs text-gray-500 mt-1">Appointments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">HK${stats.physio.monthlyRevenue}</div>
                            <p className="text-xs text-gray-500 mt-1">This month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                            <Users className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.physio.activePatients}</div>
                            <p className="text-xs text-gray-500 mt-1">Under treatment</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {user?.role === 'PATIENT' && (
                            <>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                                    <Calendar className="h-6 w-6" />
                                    <span>Book Appointment</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                                    <FileText className="h-6 w-6" />
                                    <span>View Referrals</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    <span>Find Doctors</span>
                                </Button>
                            </>
                        )}
                        {user?.role === 'DOCTOR' && (
                            <>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                                    <FileText className="h-6 w-6" />
                                    <span>Create Referral</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    <span>View Patients</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                                    <DollarSign className="h-6 w-6" />
                                    <span>Earnings Report</span>
                                </Button>
                            </>
                        )}
                        {user?.role === 'PHYSIO' && (
                            <>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                                    <Calendar className="h-6 w-6" />
                                    <span>View Schedule</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                                    <Activity className="h-6 w-6" />
                                    <span>Manage Services</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    <span>Patient List</span>
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}