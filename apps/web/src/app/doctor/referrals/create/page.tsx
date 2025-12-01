'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Search, User, ArrowLeft } from 'lucide-react';

interface Patient {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  patientProfile?: {
    dateOfBirth?: string;
    gender?: string;
  };
}

interface Physio {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  physioProfile?: {
    licenseNo: string;
    specialties: string[];
  };
}

export default function CreateReferralPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  
  const [physios, setPhysios] = useState<Physio[]>([]);
  const [loadingPhysios, setLoadingPhysios] = useState(true);
  const [physioSearchTerm, setPhysioSearchTerm] = useState('');
  const [selectedPhysio, setSelectedPhysio] = useState<Physio | null>(null);
  
  const [patientType, setPatientType] = useState<'existing' | 'new'>('existing');
  const [newPatientData, setNewPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [formData, setFormData] = useState({
    patientId: '',
    physioId: '',
    diagnosis: '',
    sessions: '6',
    urgency: 'ROUTINE',
    serviceType: 'ANY',
    notes: '',
    validityDays: '90'
  });

  useEffect(() => {
    checkProfileAndFetchPatients();
  }, []);

  const checkProfileAndFetchPatients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Check if doctor profile is complete
      const profileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profiles/doctor`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!profileResponse.ok) {
        setProfileComplete(false);
        setCheckingProfile(false);
        return;
      }

      setProfileComplete(true);
      setCheckingProfile(false);

      // Fetch patients and physios if profile is complete
      await Promise.all([
        fetchPatients(token),
        fetchPhysios(token)
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      setCheckingProfile(false);
      setLoadingPatients(false);
    }
  };

  const fetchPatients = async (token?: string) => {
    try {
      const authToken = token || localStorage.getItem('access_token');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const data = await response.json();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchPhysios = async (token?: string) => {
    try {
      const authToken = token || localStorage.getItem('access_token');
      if (!authToken) {
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users?role=PHYSIO`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch physiotherapists');
      }

      const data = await response.json();
      setPhysios(data);
    } catch (err: any) {
      console.error('Failed to load physiotherapists:', err);
    } finally {
      setLoadingPhysios(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient || null);
    setFormData({ ...formData, patientId });
  };

  const handlePhysioSelect = (physioId: string) => {
    const physio = physios.find(p => p.id === physioId);
    setSelectedPhysio(physio || null);
    setFormData({ ...formData, physioId });
  };

  const handleNewPatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPatientData({ ...newPatientData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (patientType === 'existing' && !formData.patientId) {
      setError('Please select a patient');
      setLoading(false);
      return;
    }

    if (patientType === 'new') {
      if (!newPatientData.firstName.trim() || !newPatientData.lastName.trim()) {
        setError('Patient first name and last name are required');
        setLoading(false);
        return;
      }
      if (!newPatientData.email.trim() && !newPatientData.phone.trim()) {
        setError('Please provide at least email or phone number for the patient');
        setLoading(false);
        return;
      }
    }

    if (!formData.physioId) {
      setError('Please select a physiotherapist');
      setLoading(false);
      return;
    }

    if (!formData.diagnosis.trim()) {
      setError('Diagnosis is required');
      setLoading(false);
      return;
    }

    if (!formData.sessions || parseInt(formData.sessions) < 1) {
      setError('Please specify at least 1 session');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Prepare referral data
      const referralData: any = {
        physioId: formData.physioId,
        diagnosis: formData.diagnosis,
        sessions: parseInt(formData.sessions),
        urgency: formData.urgency,
        serviceType: formData.serviceType === 'ANY' ? undefined : formData.serviceType || undefined,
        notes: formData.notes || undefined,
        validityDays: formData.validityDays ? parseInt(formData.validityDays) : 90
      };

      // Add patient data based on type
      if (patientType === 'existing') {
        referralData.patientId = formData.patientId;
      } else {
        referralData.newPatient = {
          firstName: newPatientData.firstName,
          lastName: newPatientData.lastName,
          email: newPatientData.email,
          phone: newPatientData.phone
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(referralData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create referral');
      }

      const result = await response.json();
      setSuccess(true);

      // Redirect to referral details or list after 2 seconds
      setTimeout(() => {
        router.push(`/doctor/referrals`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    return fullName.includes(searchLower) || 
           p.email.toLowerCase().includes(searchLower) ||
           (p.phone && p.phone.includes(searchTerm));
  });

  const filteredPhysios = physios.filter(p => {
    const searchLower = physioSearchTerm.toLowerCase();
    const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    return fullName.includes(searchLower) || 
           p.email.toLowerCase().includes(searchLower);
  });

  const getPatientDisplayName = (patient: Patient) => {
    if (patient.firstName && patient.lastName) {
      return `${patient.firstName} ${patient.lastName}`;
    }
    return patient.email;
  };

  const getPhysioDisplayName = (physio: Physio) => {
    if (physio.firstName && physio.lastName) {
      return `${physio.firstName} ${physio.lastName}`;
    }
    return physio.email;
  };

  // Show loading while checking profile
  if (checkingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Block access if profile is not complete
  if (!profileComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <CardTitle>Profile Completion Required</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                You must complete your doctor profile before you can create referrals.
              </p>
              <p className="text-sm text-gray-600">
                Required information includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 ml-4">
                <li>Medical license verification</li>
                <li>Specialties and consultation fees</li>
                <li>Banking details for referral fees</li>
              </ul>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => router.push('/onboarding/doctor')}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Complete Profile Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-900 mb-2">Referral Created Successfully!</h3>
                <p className="text-sm text-green-700">
                  The patient has been notified and can now book appointments with physiotherapists.
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Redirecting to referrals list...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Physiotherapy Referral</CardTitle>
            <CardDescription>
              Issue a referral for your patient to book physiotherapy services. You'll earn 20% referral fee on completed appointments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Physiotherapist Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Physiotherapist Assignment</h3>

                {loadingPhysios ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="searchPhysio">Search Physiotherapist</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="searchPhysio"
                          placeholder="Search by name or email"
                          value={physioSearchTerm}
                          onChange={(e) => setPhysioSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="physioId">Select Physiotherapist *</Label>
                      <Select 
                        value={formData.physioId} 
                        onValueChange={handlePhysioSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a physiotherapist" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredPhysios.length === 0 ? (
                            <div className="px-2 py-6 text-center text-sm text-gray-500">
                              No physiotherapists found
                            </div>
                          ) : (
                            filteredPhysios.map((physio) => (
                              <SelectItem key={physio.id} value={physio.id}>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span>{getPhysioDisplayName(physio)}</span>
                                  {physio.physioProfile?.specialties && (
                                    <span className="text-xs text-gray-500">
                                      • {physio.physioProfile.specialties.slice(0, 2).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedPhysio && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-sm text-green-900 mb-2">Selected Physiotherapist</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Name:</strong> {getPhysioDisplayName(selectedPhysio)}</p>
                          <p><strong>Email:</strong> {selectedPhysio.email}</p>
                          {selectedPhysio.physioProfile?.licenseNo && (
                            <p><strong>License:</strong> {selectedPhysio.physioProfile.licenseNo}</p>
                          )}
                          {selectedPhysio.physioProfile?.specialties && selectedPhysio.physioProfile.specialties.length > 0 && (
                            <p><strong>Specialties:</strong> {selectedPhysio.physioProfile.specialties.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Patient Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Patient Information</h3>

                {/* Toggle between existing and new patient */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setPatientType('existing')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      patientType === 'existing'
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Existing Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientType('new')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      patientType === 'new'
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    New Patient
                  </button>
                </div>

                {patientType === 'existing' ? (
                  loadingPatients ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="searchPatient">Search Patient</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="searchPatient"
                            placeholder="Search by name, email, or phone"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="patientId">Select Patient *</Label>
                        <Select 
                          value={formData.patientId} 
                          onValueChange={handlePatientSelect}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a patient" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredPatients.length === 0 ? (
                              <div className="px-2 py-6 text-center text-sm text-gray-500">
                                No patients found
                              </div>
                            ) : (
                              filteredPatients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span>{getPatientDisplayName(patient)}</span>
                                    {patient.phone && (
                                      <span className="text-xs text-gray-500">• {patient.phone}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedPatient && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-sm text-blue-900 mb-2">Selected Patient</h4>
                          <div className="text-sm space-y-1">
                            <p><strong>Name:</strong> {getPatientDisplayName(selectedPatient)}</p>
                            <p><strong>Email:</strong> {selectedPatient.email}</p>
                            {selectedPatient.phone && <p><strong>Phone:</strong> {selectedPatient.phone}</p>}
                          </div>
                        </div>
                      )}
                    </>
                  )
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> A new patient account will be created automatically. 
                        Please provide at least email or phone number for patient contact.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={newPatientData.firstName}
                          onChange={handleNewPatientChange}
                          placeholder="John"
                          required={patientType === 'new'}
                        />
                      </div>

                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={newPatientData.lastName}
                          onChange={handleNewPatientChange}
                          placeholder="Doe"
                          required={patientType === 'new'}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newPatientData.email}
                        onChange={handleNewPatientChange}
                        placeholder="john.doe@example.com (optional)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={newPatientData.phone}
                        onChange={handleNewPatientChange}
                        placeholder="+852 9123 4567 (optional)"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Clinical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Clinical Information</h3>

                <div>
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Input
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="e.g., Lower back pain, Sports injury - knee"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Brief description of the condition requiring physiotherapy
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessions">Number of Sessions *</Label>
                    <Input
                      id="sessions"
                      name="sessions"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.sessions}
                      onChange={handleInputChange}
                      placeholder="e.g., 6"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="validityDays">Valid For (Days)</Label>
                    <Input
                      id="validityDays"
                      name="validityDays"
                      type="number"
                      min="30"
                      max="365"
                      value={formData.validityDays}
                      onChange={handleInputChange}
                      placeholder="90"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select 
                      value={formData.urgency} 
                      onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROUTINE">Routine</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                        <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="serviceType">Preferred Service Type</Label>
                    <Select 
                      value={formData.serviceType} 
                      onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANY">Any</SelectItem>
                        <SelectItem value="CLINIC">Clinic Only</SelectItem>
                        <SelectItem value="HOME_VISIT">Home Visit Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions or considerations for the physiotherapist..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Referral Fee Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-sm text-green-900 mb-2">💰 Referral Fee Structure</h4>
                <p className="text-sm text-green-700">
                  You will automatically receive <strong>20% of the service fee</strong> for each appointment 
                  booked under this referral. The fee will be deposited to your registered bank account 
                  within 7 business days after the appointment is completed.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || loadingPatients}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Referral...
                    </>
                  ) : (
                    'Create Referral'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

