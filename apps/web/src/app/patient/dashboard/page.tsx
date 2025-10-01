'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PatientDashboard() {
    return (
        <DashboardLayout requiredRole="PATIENT" title="Patient Dashboard">
            <div className="space-y-6">
                {/* Welcome Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome Back!</CardTitle>
                        <CardDescription>
                            Manage your appointments, view referrals, and track your health journey.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Upcoming Appointments"
                        value={2}
                        description="Next: Tomorrow 2:00 PM"
                        icon={
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Active Referrals"
                        value={1}
                        description="Sports injury treatment"
                        icon={
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Completed Sessions"
                        value={8}
                        description="This month"
                        icon={
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Health Score"
                        value="85%"
                        description="Improving"
                        trend={{ value: 5, isPositive: true }}
                        icon={
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common tasks you might want to perform
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start" variant="outline">
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Book New Appointment
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Find Physiotherapist
                            </Button>
                            <Button className="w-full justify-start" variant="outline">
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View Medical Records
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your latest appointments and updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Appointment completed</p>
                                        <p className="text-xs text-gray-600">Dr. Smith - Back Pain Treatment</p>
                                    </div>
                                    <span className="text-xs text-gray-500">2 days ago</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">New referral received</p>
                                        <p className="text-xs text-gray-600">Dr. Wong - Physiotherapy</p>
                                    </div>
                                    <span className="text-xs text-gray-500">1 week ago</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Appointment scheduled</p>
                                        <p className="text-xs text-gray-600">PhysioClinic HK - Tomorrow</p>
                                    </div>
                                    <span className="text-xs text-gray-500">3 days ago</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}