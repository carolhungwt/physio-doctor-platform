'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Medication {
  name: string;
  dosage: string;
  unit: string;
  frequency: string;
}

interface Allergy {
  allergen: string;
  reaction: string;
}

export default function PatientOnboarding() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalHistory: '',
  });
  
  const [hasAllergies, setHasAllergies] = useState(false);
  const [allergies, setAllergies] = useState<Allergy[]>([{ allergen: '', reaction: '' }]);
  
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', unit: '', frequency: '' }]);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAllergyChange = (index: number, field: keyof Allergy, value: string) => {
    const newAllergies = [...allergies];
    newAllergies[index][field] = value;
    setAllergies(newAllergies);
  };

  const addAllergy = () => {
    setAllergies([...allergies, { allergen: '', reaction: '' }]);
  };

  const removeAllergy = (index: number) => {
    if (allergies.length > 1) {
      setAllergies(allergies.filter((_, i) => i !== index));
    }
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', unit: '', frequency: '' }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      const allergiesText = hasAllergies 
        ? allergies
            .filter(a => a.allergen.trim())
            .map(a => a.reaction ? `${a.allergen} (Reaction: ${a.reaction})` : a.allergen)
            .join('; ')
        : 'None';

      const medicationsText = medications
        .filter(m => m.name.trim())
        .map(m => {
          let text = m.name;
          if (m.dosage) text += ` - ${m.dosage}`;
          if (m.unit) text += ` ${m.unit}`;
          if (m.frequency) text += ` (${m.frequency})`;
          return text;
        })
        .join('; ') || 'None';

      const profileData = {
        ...formData,
        allergies: allergiesText,
        currentMedications: medicationsText,
      };

      const response = await fetch('http://localhost:3001/profiles/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to create profile');

      router.push('/patient/dashboard');
    } catch (error) {
      console.error('Profile creation failed:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/patient/dashboard');
  };

  return (
    <DashboardLayout requiredRole="PATIENT" title="Complete Your Profile">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Help us provide you with better care by completing your medical profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="dateOfBirth" className="text-sm font-medium">
                      Date of Birth
                    </label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="gender" className="text-sm font-medium">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={isLoading}
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Your home address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Emergency Contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="emergencyContactName" className="text-sm font-medium">
                      Contact Name
                    </label>
                    <Input
                      id="emergencyContactName"
                      name="emergencyContactName"
                      type="text"
                      placeholder="Emergency contact name"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="emergencyContactPhone" className="text-sm font-medium">
                      Contact Phone
                    </label>
                    <Input
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      type="tel"
                      placeholder="+852 1234 5678"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medical Information</h3>
                
                <div className="space-y-2">
                  <label htmlFor="medicalHistory" className="text-sm font-medium">
                    Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    rows={3}
                    placeholder="Any relevant medical history, past surgeries, or conditions"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isLoading}
                  />
                </div>

                {/* Allergies */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Do you have any allergies?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="hasAllergies"
                        checked={!hasAllergies}
                        onChange={() => setHasAllergies(false)}
                        disabled={isLoading}
                      />
                      <span>No</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="hasAllergies"
                        checked={hasAllergies}
                        onChange={() => setHasAllergies(true)}
                        disabled={isLoading}
                      />
                      <span>Yes</span>
                    </label>
                  </div>

                  {hasAllergies && (
                    <div className="space-y-3 mt-3 p-4 bg-gray-50 rounded-md">
                      {allergies.map((allergy, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Allergen (e.g., Penicillin, Peanuts)"
                              value={allergy.allergen}
                              onChange={(e) => handleAllergyChange(index, 'allergen', e.target.value)}
                              disabled={isLoading}
                            />
                            <Input
                              placeholder="Reaction (optional, e.g., Rash, Difficulty breathing)"
                              value={allergy.reaction}
                              onChange={(e) => handleAllergyChange(index, 'reaction', e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                          {allergies.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeAllergy(index)}
                              disabled={isLoading}
                              className="mt-1"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAllergy}
                        disabled={isLoading}
                      >
                        + Add Another Allergy
                      </Button>
                    </div>
                  )}
                </div>

                {/* Current Medications */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Current Medications</label>
                  <div className="space-y-3 p-4 bg-gray-50 rounded-md">
                    {medications.map((medication, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-3 items-start">
                          <div className="flex items-center justify-center w-6 h-10 text-sm font-medium text-gray-600">
                            {index + 1}.
                          </div>
                          <div className="flex-1 flex flex-col sm:flex-row gap-2">
                            <Input
                              placeholder="Medication name"
                              value={medication.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                              disabled={isLoading}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Dosage (e.g., 500)"
                              value={medication.dosage}
                              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                              disabled={isLoading}
                              className="w-full sm:w-28"
                            />
                            <select
                              value={medication.unit}
                              onChange={(e) => handleMedicationChange(index, 'unit', e.target.value)}
                              className="w-full sm:w-28 p-2 border border-gray-300 rounded-md"
                              disabled={isLoading}
                            >
                              <option value="">Unit</option>
                              <option value="mg">mg</option>
                              <option value="g">g</option>
                              <option value="ml">ml</option>
                              <option value="mcg">mcg</option>
                              <option value="IU">IU</option>
                              <option value="tablets">tablets</option>
                              <option value="capsules">capsules</option>
                            </select>
                          </div>
                          {medications.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeMedication(index)}
                              disabled={isLoading}
                              className="h-10"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="pl-9">
                          <select
                            value={medication.frequency}
                            onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            className="w-full sm:w-64 p-2 border border-gray-300 rounded-md text-sm"
                            disabled={isLoading}
                          >
                            <option value="">Select frequency (optional)</option>
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="Three times daily">Three times daily</option>
                            <option value="Four times daily">Four times daily</option>
                            <option value="Every other day">Every other day</option>
                            <option value="Weekly">Weekly</option>
                            <option value="As needed">As needed</option>
                            <option value="Before meals">Before meals</option>
                            <option value="After meals">After meals</option>
                            <option value="At bedtime">At bedtime</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMedication}
                      disabled={isLoading}
                    >
                      + Add Another Medication
                    </Button>
                  </div>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex gap-4">
                <div className="border-2 border-blue-500 rounded-lg bg-blue-50 flex-1">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Complete Profile'}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
