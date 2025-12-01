'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, AlertCircle, Plus, X } from 'lucide-react';

// Common medical specialties in Hong Kong
const SPECIALTIES = [
    'General Practice',
    'Internal Medicine',
    'Orthopedics',
    'Sports Medicine',
    'Rehabilitation Medicine',
    'Neurology',
    'Rheumatology',
    'Pain Management',
    'Geriatrics',
    'Pediatrics',
    'Cardiology',
    'Other'
];

// Consultation types
const CONSULTATION_TYPES = [
    { value: 'VIDEO', label: 'Video Consultation' },
    { value: 'IN_PERSON', label: 'In-Person' },
    { value: 'BOTH', label: 'Both Video & In-Person' }
];

export default function DoctorOnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [customSpecialty, setCustomSpecialty] = useState('');
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [hospitalAffiliations, setHospitalAffiliations] = useState<string[]>(['']);

    const [formData, setFormData] = useState({
        licenseNumber: '',
        yearsOfExperience: '',
        bio: '',
        consultationFee: '',
        consultationType: 'VIDEO',
        acceptsReferrals: true,
        // Banking details
        bankName: '',
        bankAccountNumber: '',
        bankAccountName: '',
        // Address
        clinicName: '',
        addressLine1: '',
        addressLine2: '',
        city: 'Hong Kong',
        district: '',
        country: 'Hong Kong'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSpecialtyToggle = (specialty: string) => {
        setSelectedSpecialties(prev =>
            prev.includes(specialty)
                ? prev.filter(s => s !== specialty)
                : [...prev, specialty]
        );
    };

    const addCustomSpecialty = () => {
        if (customSpecialty.trim() && !selectedSpecialties.includes(customSpecialty.trim())) {
            setSelectedSpecialties([...selectedSpecialties, customSpecialty.trim()]);
            setCustomSpecialty('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLicenseFile(e.target.files[0]);
        }
    };

    const addHospitalAffiliation = () => {
        setHospitalAffiliations([...hospitalAffiliations, '']);
    };

    const updateHospitalAffiliation = (index: number, value: string) => {
        const updated = [...hospitalAffiliations];
        updated[index] = value;
        setHospitalAffiliations(updated);
    };

    const removeHospitalAffiliation = (index: number) => {
        setHospitalAffiliations(hospitalAffiliations.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.licenseNumber.trim()) {
            setError('Medical license number is required');
            setLoading(false);
            return;
        }

        if (selectedSpecialties.length === 0) {
            setError('Please select at least one specialty');
            setLoading(false);
            return;
        }

        if (!formData.consultationFee || parseFloat(formData.consultationFee) <= 0) {
            setError('Please enter a valid consultation fee');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            // Prepare data
            const profileData = {
                licenseNumber: formData.licenseNumber,
                specialties: selectedSpecialties,
                yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
                bio: formData.bio || null,
                consultationFee: parseFloat(formData.consultationFee),
                consultationType: formData.consultationType,
                acceptsReferrals: formData.acceptsReferrals,
                hospitalAffiliations: hospitalAffiliations.filter(h => h.trim() !== ''),
                // Banking details
                bankName: formData.bankName || null,
                bankAccountNumber: formData.bankAccountNumber || null,
                bankAccountName: formData.bankAccountName || null,
                // Address
                clinicName: formData.clinicName || null,
                addressLine1: formData.addressLine1 || null,
                addressLine2: formData.addressLine2 || null,
                city: formData.city,
                district: formData.district || null,
                country: formData.country
            };

            // TODO: If file upload is implemented, handle license document upload here
            // For now, we'll proceed without the file upload

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/doctor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create doctor profile');
            }

            // Success - redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-4xl mx-auto px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Doctor Profile Setup</CardTitle>
                        <CardDescription>
                            Complete your professional profile to start accepting referrals and consultations
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

                            {/* Medical License Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Medical License Information</h3>

                                <div>
                                    <Label htmlFor="licenseNumber">Medical License Number *</Label>
                                    <Input
                                        id="licenseNumber"
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleInputChange}
                                        placeholder="e.g., M12345"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Your Hong Kong Medical Council registration number
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="licenseDocument">License Document</Label>
                                    <div className="mt-2 flex items-center gap-4">
                                        <Input
                                            id="licenseDocument"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('licenseDocument')?.click()}
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload License Copy
                                        </Button>
                                        {licenseFile && (
                                            <span className="text-sm text-gray-600">{licenseFile.name}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Optional: Upload a copy of your medical license (PDF or image)
                                    </p>
                                </div>
                            </div>

                            {/* Specialties Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Medical Specialties *</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {SPECIALTIES.map((specialty) => (
                                        <div key={specialty} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={specialty}
                                                checked={selectedSpecialties.includes(specialty)}
                                                onCheckedChange={() => handleSpecialtyToggle(specialty)}
                                            />
                                            <Label htmlFor={specialty} className="cursor-pointer">
                                                {specialty}
                                            </Label>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add custom specialty"
                                        value={customSpecialty}
                                        onChange={(e) => setCustomSpecialty(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSpecialty())}
                                    />
                                    <Button type="button" variant="outline" onClick={addCustomSpecialty}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {selectedSpecialties.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSpecialties.map((specialty) => (
                                            <span
                                                key={specialty}
                                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                            >
                        {specialty}
                                                <button
                                                    type="button"
                                                    onClick={() => handleSpecialtyToggle(specialty)}
                                                    className="hover:text-blue-600"
                                                >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Professional Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Professional Details</h3>

                                <div>
                                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                                    <Input
                                        id="yearsOfExperience"
                                        name="yearsOfExperience"
                                        type="number"
                                        min="0"
                                        value={formData.yearsOfExperience}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 10"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="bio">Professional Bio</Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        placeholder="Tell patients about your experience, approach, and areas of expertise..."
                                        rows={4}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        This will be visible to patients on your profile
                                    </p>
                                </div>

                                <div>
                                    <Label>Hospital Affiliations</Label>
                                    {hospitalAffiliations.map((hospital, index) => (
                                        <div key={index} className="flex gap-2 mt-2">
                                            <Input
                                                value={hospital}
                                                onChange={(e) => updateHospitalAffiliation(index, e.target.value)}
                                                placeholder="e.g., Queen Mary Hospital"
                                            />
                                            {hospitalAffiliations.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeHospitalAffiliation(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addHospitalAffiliation}
                                        className="mt-2"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Hospital
                                    </Button>
                                </div>
                            </div>

                            {/* Consultation Settings */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Consultation Settings</h3>

                                <div>
                                    <Label htmlFor="consultationType">Consultation Type *</Label>
                                    <Select
                                        value={formData.consultationType}
                                        onValueChange={(value) => setFormData({ ...formData, consultationType: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CONSULTATION_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="consultationFee">Consultation Fee (HKD) *</Label>
                                    <Input
                                        id="consultationFee"
                                        name="consultationFee"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.consultationFee}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 800"
                                        required
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="acceptsReferrals"
                                        checked={formData.acceptsReferrals}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, acceptsReferrals: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="acceptsReferrals" className="cursor-pointer">
                                        Accept physiotherapy referral requests (earn 20% referral fee)
                                    </Label>
                                </div>
                            </div>

                            {/* Clinic Address */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Clinic Information</h3>

                                <div>
                                    <Label htmlFor="clinicName">Clinic/Hospital Name</Label>
                                    <Input
                                        id="clinicName"
                                        name="clinicName"
                                        value={formData.clinicName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Central Medical Centre"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="addressLine1">Address Line 1</Label>
                                    <Input
                                        id="addressLine1"
                                        name="addressLine1"
                                        value={formData.addressLine1}
                                        onChange={handleInputChange}
                                        placeholder="Building name and street"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="addressLine2">Address Line 2</Label>
                                    <Input
                                        id="addressLine2"
                                        name="addressLine2"
                                        value={formData.addressLine2}
                                        onChange={handleInputChange}
                                        placeholder="Unit/Floor (optional)"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="district">District</Label>
                                        <Input
                                            id="district"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Central"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Banking Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Banking Information</h3>
                                <p className="text-sm text-gray-500">
                                    Required to receive 20% referral fees from physiotherapy bookings
                                </p>

                                <div>
                                    <Label htmlFor="bankName">Bank Name</Label>
                                    <Input
                                        id="bankName"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., HSBC"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="bankAccountName">Account Holder Name</Label>
                                    <Input
                                        id="bankAccountName"
                                        name="bankAccountName"
                                        value={formData.bankAccountName}
                                        onChange={handleInputChange}
                                        placeholder="As shown on bank account"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                                    <Input
                                        id="bankAccountNumber"
                                        name="bankAccountNumber"
                                        value={formData.bankAccountNumber}
                                        onChange={handleInputChange}
                                        placeholder="Bank account number"
                                    />
                                </div>
                            </div>

                            {/* Important Notice */}
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Note:</strong> You can skip this for now, but key features like creating referrals and earning referral fees will be disabled until you complete your profile with:
                                    <ul className="list-disc list-inside mt-2 ml-2 text-sm">
                                        <li>Medical license verification</li>
                                        <li>Specialties and consultation fees</li>
                                        <li>Banking details</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/dashboard')}
                                    disabled={loading}
                                >
                                    Skip for Now
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Profile...
                                        </>
                                    ) : (
                                        'Complete Profile'
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