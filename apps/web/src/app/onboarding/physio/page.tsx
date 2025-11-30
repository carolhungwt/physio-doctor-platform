'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, AlertCircle, Plus, X } from 'lucide-react';

// Common physiotherapy specialties in Hong Kong
const SPECIALTIES = [
    'Manual Therapy',
    'Sports Rehabilitation',
    'Orthopedic Physiotherapy',
    'Neurological Rehabilitation',
    'Pediatric Physiotherapy',
    'Geriatric Care',
    'Post-surgical Rehabilitation',
    'Pain Management',
    'Occupational Therapy',
    'Acupuncture',
    'Electrotherapy',
    'Other'
];

interface ServiceOffering {
    name: string;
    description: string;
    duration: string;
    price: string;
    serviceType: 'CLINIC' | 'HOME_VISIT' | 'BOTH';
}

export default function PhysioOnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [customSpecialty, setCustomSpecialty] = useState('');
    const [licenseFile, setLicenseFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        licenseNo: '',
        offersClinicService: true,
        offersHomeService: false,
        clinicAddress: '',
        serviceRadius: '',
        // Banking details
        bankName: '',
        accountNumber: '',
        accountName: ''
    });

    const [services, setServices] = useState<ServiceOffering[]>([
        {
            name: '',
            description: '',
            duration: '',
            price: '',
            serviceType: 'CLINIC'
        }
    ]);

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

    const addService = () => {
        setServices([...services, {
            name: '',
            description: '',
            duration: '',
            price: '',
            serviceType: 'CLINIC'
        }]);
    };

    const updateService = (index: number, field: keyof ServiceOffering, value: string) => {
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: value };
        setServices(updated);
    };

    const removeService = (index: number) => {
        if (services.length > 1) {
            setServices(services.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.licenseNo.trim()) {
            setError('Physiotherapist license number is required');
            setLoading(false);
            return;
        }

        if (selectedSpecialties.length === 0) {
            setError('Please select at least one specialty');
            setLoading(false);
            return;
        }

        if (!formData.offersClinicService && !formData.offersHomeService) {
            setError('Please select at least one service type (clinic or home visit)');
            setLoading(false);
            return;
        }

        // Validate services
        const validServices = services.filter(s =>
            s.name.trim() && s.duration && parseFloat(s.duration) > 0 && s.price && parseFloat(s.price) > 0
        );

        if (validServices.length === 0) {
            setError('Please add at least one service offering with valid details');
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
                licenseNo: formData.licenseNo,
                specialties: selectedSpecialties,
                services: validServices.map(s => ({
                    name: s.name,
                    description: s.description || null,
                    duration: parseInt(s.duration),
                    price: parseFloat(s.price),
                    serviceType: s.serviceType
                })),
                offersClinicService: formData.offersClinicService,
                offersHomeService: formData.offersHomeService,
                clinicAddress: formData.clinicAddress || null,
                serviceRadius: formData.serviceRadius ? parseInt(formData.serviceRadius) : null,
                // Banking details
                bankName: formData.bankName || null,
                accountNumber: formData.accountNumber || null,
                accountName: formData.accountName || null
            };

            // TODO: If file upload is implemented, handle license document upload here
            // For now, we'll proceed without the file upload

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/physio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create physiotherapist profile');
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
                        <CardTitle>Physiotherapist Profile Setup</CardTitle>
                        <CardDescription>
                            Complete your professional profile to start accepting patient bookings
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

                            {/* License Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">License Information</h3>

                                <div>
                                    <Label htmlFor="licenseNo">Physiotherapist License Number *</Label>
                                    <Input
                                        id="licenseNo"
                                        name="licenseNo"
                                        value={formData.licenseNo}
                                        onChange={handleInputChange}
                                        placeholder="e.g., PT12345"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Your Hong Kong Physiotherapy Board registration number
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
                                        Optional: Upload a copy of your license (PDF or image)
                                    </p>
                                </div>
                            </div>

                            {/* Specialties Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Specialties *</h3>
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

                            {/* Service Offerings */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Service Offerings *</h3>
                                    <Button type="button" variant="outline" onClick={addService} size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Service
                                    </Button>
                                </div>

                                {services.map((service, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-sm text-gray-700">Service {index + 1}</h4>
                                            {services.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeService(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2">
                                                <Label>Service Name *</Label>
                                                <Input
                                                    value={service.name}
                                                    onChange={(e) => updateService(index, 'name', e.target.value)}
                                                    placeholder="e.g., Sports Massage Therapy"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={service.description}
                                                    onChange={(e) => updateService(index, 'description', e.target.value)}
                                                    placeholder="Brief description of the service"
                                                    rows={2}
                                                />
                                            </div>

                                            <div>
                                                <Label>Duration (minutes) *</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={service.duration}
                                                    onChange={(e) => updateService(index, 'duration', e.target.value)}
                                                    placeholder="e.g., 60"
                                                />
                                            </div>

                                            <div>
                                                <Label>Price (HKD) *</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={service.price}
                                                    onChange={(e) => updateService(index, 'price', e.target.value)}
                                                    placeholder="e.g., 800"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <Label>Service Type</Label>
                                                <div className="flex gap-4 mt-2">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`serviceType-${index}`}
                                                            value="CLINIC"
                                                            checked={service.serviceType === 'CLINIC'}
                                                            onChange={(e) => updateService(index, 'serviceType', e.target.value)}
                                                        />
                                                        <span className="text-sm">Clinic Only</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`serviceType-${index}`}
                                                            value="HOME_VISIT"
                                                            checked={service.serviceType === 'HOME_VISIT'}
                                                            onChange={(e) => updateService(index, 'serviceType', e.target.value)}
                                                        />
                                                        <span className="text-sm">Home Visit Only</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`serviceType-${index}`}
                                                            value="BOTH"
                                                            checked={service.serviceType === 'BOTH'}
                                                            onChange={(e) => updateService(index, 'serviceType', e.target.value)}
                                                        />
                                                        <span className="text-sm">Both</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Service Type Selection */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Service Availability *</h3>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="offersClinicService"
                                            checked={formData.offersClinicService}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, offersClinicService: checked as boolean })
                                            }
                                        />
                                        <Label htmlFor="offersClinicService" className="cursor-pointer">
                                            I offer clinic-based services
                                        </Label>
                                    </div>

                                    {formData.offersClinicService && (
                                        <div>
                                            <Label htmlFor="clinicAddress">Clinic Address</Label>
                                            <Input
                                                id="clinicAddress"
                                                name="clinicAddress"
                                                value={formData.clinicAddress}
                                                onChange={handleInputChange}
                                                placeholder="Full clinic address"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="offersHomeService"
                                            checked={formData.offersHomeService}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, offersHomeService: checked as boolean })
                                            }
                                        />
                                        <Label htmlFor="offersHomeService" className="cursor-pointer">
                                            I offer home visit services
                                        </Label>
                                    </div>

                                    {formData.offersHomeService && (
                                        <div>
                                            <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                                            <Input
                                                id="serviceRadius"
                                                name="serviceRadius"
                                                type="number"
                                                min="0"
                                                value={formData.serviceRadius}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 10"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                How far from your clinic are you willing to travel?
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Banking Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Banking Information</h3>
                                <p className="text-sm text-gray-500">
                                    Required to receive payment for your services (80% after 20% doctor referral fee)
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
                                    <Label htmlFor="accountName">Account Holder Name</Label>
                                    <Input
                                        id="accountName"
                                        name="accountName"
                                        value={formData.accountName}
                                        onChange={handleInputChange}
                                        placeholder="As shown on bank account"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="accountNumber">Account Number</Label>
                                    <Input
                                        id="accountNumber"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        placeholder="Bank account number"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/dashboard')}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700"
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
