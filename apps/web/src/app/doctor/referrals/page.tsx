'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Plus, 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';

interface Referral {
  id: string;
  diagnosis: string;
  sessions: number;
  sessionsUsed: number;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'REVOKED';
  issuedAt: string;
  expiryDate: string;
  patient: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export default function ReferralsListPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/referrals/doctor`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }

      const data = await response.json();
      setReferrals(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (patient: any) => {
    if (patient.firstName && patient.lastName) {
      return `${patient.firstName} ${patient.lastName}`;
    }
    return patient.email;
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      ACTIVE: 'default',
      EXPIRED: 'secondary',
      COMPLETED: 'default',
      REVOKED: 'destructive'
    };

    const colors: any = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      REVOKED: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors: any = {
      ROUTINE: 'bg-blue-100 text-blue-800',
      URGENT: 'bg-orange-100 text-orange-800',
      EMERGENCY: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[urgency]}>
        {urgency}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-HK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 14 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">My Referrals</h1>
            <p className="text-gray-600 mt-1">
              Manage physiotherapy referrals for your patients
            </p>
          </div>
          <Button 
            onClick={() => router.push('/doctor/referrals/create')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Referral
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referrals.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {referrals.filter(r => r.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {referrals.filter(r => r.status === 'COMPLETED').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {referrals.filter(r => r.status === 'ACTIVE' && isExpiringSoon(r.expiryDate)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals List */}
        {referrals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first referral to help your patients access physiotherapy services.
                </p>
                <Button 
                  onClick={() => router.push('/doctor/referrals/create')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Referral
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <Card key={referral.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {getPatientName(referral.patient)}
                          </h3>
                          <p className="text-gray-600 text-sm">{referral.diagnosis}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Sessions</p>
                          <p className="text-sm font-medium">
                            {referral.sessionsUsed} / {referral.sessions} used
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Issued</p>
                          <p className="text-sm font-medium">{formatDate(referral.issuedAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Expires</p>
                          <p className="text-sm font-medium">
                            {formatDate(referral.expiryDate)}
                            {isExpiringSoon(referral.expiryDate) && referral.status === 'ACTIVE' && (
                              <span className="ml-2 text-orange-600">⚠️</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Urgency</p>
                          <div>{getUrgencyBadge(referral.urgency)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(referral.status)}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/doctor/referrals/${referral.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

