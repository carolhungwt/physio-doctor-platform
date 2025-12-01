'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, FileText, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Physio-Doctor Platform
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Hong Kong's Premier Healthcare Referral System
          </p>
          <p className="text-lg text-gray-500">
            Connecting Doctors, Physiotherapists, and Patients
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>For Doctors</CardTitle>
              <CardDescription>
                Issue referrals and earn 20% referral fees on completed physiotherapy sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Create digital referrals</li>
                <li>✓ Track patient progress</li>
                <li>✓ Automated fee distribution</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>For Physiotherapists</CardTitle>
              <CardDescription>
                Receive verified referrals and grow your practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Access qualified patients</li>
                <li>✓ Manage appointments</li>
                <li>✓ Secure payments</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>For Patients</CardTitle>
              <CardDescription>
                Book trusted physiotherapy services with doctor referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Find qualified physiotherapists</li>
                <li>✓ Book appointments easily</li>
                <li>✓ Track your treatment</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 min-w-[200px]"
            onClick={() => router.push('/auth/login')}
          >
            Login
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="min-w-[200px]"
            onClick={() => router.push('/auth/register')}
          >
            Register
          </Button>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            🇭🇰 Compliant with Hong Kong Medical Council and Physiotherapy Board regulations
          </p>
        </div>
      </div>
    </div>
  );
}
