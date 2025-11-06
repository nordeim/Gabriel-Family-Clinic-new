'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';
import { Input } from '@/components/forms/input';
import { PhoneInput } from '@/components/forms/phone-input';
import { DatePicker } from '@/components/forms/date-picker';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/feedback/alert';

import { validateNRIC, validatePhone } from '@/lib/singapore/localization';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [patientData, setPatientData] = useState({
    nric: '',
    dateOfBirth: new Date(),
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/signin');
      }
    }
    loadUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate NRIC
    if (!validateNRIC(patientData.nric)) {
      setError('Invalid NRIC format. Please use format: S1234567D');
      setIsLoading(false);
      return;
    }

    // Validate phone
    if (!validatePhone(patientData.phone)) {
      setError('Invalid phone number. Please use format: +65 XXXX XXXX');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const user = await getCurrentUser();
      if (!user) {
        setError('User not found. Please sign in again.');
        setIsLoading(false);
        return;
      }

      // Create patient record
      const { error: insertError } = await supabase.from('patients').insert({
        user_id: user.id,
        nric: patientData.nric,
        date_of_birth: patientData.dateOfBirth.toISOString().split('T')[0],
        phone_number: patientData.phone,
        address: patientData.address,
        emergency_contact_name: patientData.emergencyContact,
        emergency_contact_phone: patientData.emergencyPhone,
      });

      if (insertError) {
        setError('Failed to create profile. Please try again.');
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push('/patient');
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-4 text-xl text-gray-700">
            Help us serve you better with your information
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <Alert variant="error" title="Profile Setup Failed" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>

              <Input
                label="NRIC Number"
                type="text"
                value={patientData.nric}
                onChange={(e) => setPatientData({ ...patientData, nric: e.target.value.toUpperCase() })}
                placeholder="S1234567D"
                required
                disabled={isLoading}
                className="text-lg"
                helperText="Singapore National Registration Identity Card number"
              />

              <DatePicker
                label="Date of Birth"
                value={patientData.dateOfBirth}
                onChange={(date) => setPatientData({ ...patientData, dateOfBirth: date || new Date() })}
                maxDate={new Date()}
                required
                disabled={isLoading}
              />

              <PhoneInput
                label="Phone Number"
                value={patientData.phone}
                onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                placeholder="+65 9123 4567"
                required
                disabled={isLoading}
              />

              <Input
                label="Address"
                type="text"
                value={patientData.address}
                onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                placeholder="123 Main Street, #01-01, Singapore 123456"
                required
                disabled={isLoading}
                className="text-lg"
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Emergency Contact</h2>

              <Input
                label="Emergency Contact Name"
                type="text"
                value={patientData.emergencyContact}
                onChange={(e) => setPatientData({ ...patientData, emergencyContact: e.target.value })}
                placeholder="Contact person's name"
                required
                disabled={isLoading}
                className="text-lg"
              />

              <PhoneInput
                label="Emergency Contact Phone"
                value={patientData.emergencyPhone}
                onChange={(e) => setPatientData({ ...patientData, emergencyPhone: e.target.value })}
                placeholder="+65 9123 4567"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="flex-1 text-lg py-6"
              >
                {isLoading ? 'Saving Profile...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
