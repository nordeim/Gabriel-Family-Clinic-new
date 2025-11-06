'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/forms/select';
import { DatePicker } from '@/components/forms/date-picker';
import { Textarea } from '@/components/forms/textarea';
import { Card } from '@/components/data/card';
import { Alert } from '@/components/feedback/alert';

import { ArrowLeft, CheckCircle } from 'lucide-react';

interface Doctor {
  id: string;
  full_name: string;
  specialty_id: string;
}

interface Specialty {
  id: string;
  name: string;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const [formData, setFormData] = useState({
    specialtyId: '',
    doctorId: '',
    appointmentDate: new Date(),
    timeSlotId: '',
    appointmentType: 'consultation',
    reason: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.specialtyId) {
      const filtered = doctors.filter(d => d.specialty_id === formData.specialtyId);
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [formData.specialtyId, doctors]);

  useEffect(() => {
    if (formData.doctorId && formData.appointmentDate) {
      loadTimeSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.doctorId, formData.appointmentDate]);

  async function loadInitialData() {
    try {
      const supabase = createClient();
      // Load specialties
      const { data: specData } = await supabase
        .from('specialties')
        .select('*')
        .order('name');

      if (specData) {
        setSpecialties(specData);
      }

      // Load doctors
      const { data: docData } = await supabase
        .from('doctors')
        .select('id, user_id, specialty_id, users(full_name)')
        .eq('is_active', true);

      if (docData) {
        const doctorsWithNames = docData.map((d) => ({
          id: d.id,
          full_name: Array.isArray(d.users) && d.users.length > 0 
            ? d.users[0].full_name || 'Unknown' 
            : 'Unknown',
          specialty_id: d.specialty_id,
        }));
        setDoctors(doctorsWithNames);
        setFilteredDoctors(doctorsWithNames);
      }
    } catch {
      // Error loading data
    }
  }

  async function loadTimeSlots() {
    try {
      const supabase = createClient();
      const dateStr = formData.appointmentDate.toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', formData.doctorId)
        .eq('date', dateStr)
        .eq('is_available', true)
        .order('start_time');

      if (data) {
        setTimeSlots(data);
      } else {
        setTimeSlots([]);
      }
    } catch {
      setTimeSlots([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Get patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) {
        setError('Patient profile not found. Please complete your profile.');
        setIsLoading(false);
        return;
      }

      // Get clinic ID from doctor
      const { data: doctor } = await supabase
        .from('doctors')
        .select('clinic_id')
        .eq('id', formData.doctorId)
        .single();

      if (!doctor) {
        setError('Doctor information not found.');
        setIsLoading(false);
        return;
      }

      // Create appointment via edge function
      const { error: bookingError } = await supabase.functions.invoke(
        'appointment-processor',
        {
          body: {
            action: 'create',
            appointment: {
              patient_id: patient.id,
              doctor_id: formData.doctorId,
              clinic_id: doctor.clinic_id,
              appointment_date: formData.appointmentDate.toISOString().split('T')[0],
              appointment_time: timeSlots.find(ts => ts.id === formData.timeSlotId)?.start_time || '09:00:00',
              appointment_type: formData.appointmentType,
              reason: formData.reason,
            },
          },
        }
      );

      if (bookingError) {
        setError('Failed to book appointment. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/patient/appointments');
      }, 2000);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div
          className="max-w-md w-full"
        >
          <Card>
            <div className="p-12 text-center">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Appointment Booked!
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Your appointment has been successfully scheduled. You will receive a confirmation email shortly.
              </p>
              <Link href="/patient/appointments">
                <Button variant="primary" size="lg" className="w-full text-xl py-6">
                  View My Appointments
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare options for Select components
  const specialtyOptions = [
    { value: '', label: 'Choose a specialty' },
    ...specialties.map(spec => ({
      value: spec.id,
      label: spec.name,
    }))
  ];

  const doctorOptions = [
    { value: '', label: 'Choose a doctor' },
    ...filteredDoctors.map(doc => ({
      value: doc.id,
      label: `Dr. ${doc.full_name}`,
    }))
  ];

  const appointmentTypeOptions = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'check-up', label: 'Health Check-up' },
    { value: 'vaccination', label: 'Vaccination' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/patient"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-lg mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-xl text-gray-700 mt-2">
            Schedule a visit with our doctors
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Booking Form */}
        <Card>
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Select Specialty */}
            <div>
              <p className="block text-xl font-semibold text-gray-900 mb-4">
                1. Select Medical Specialty
              </p>
              <Select
                options={specialtyOptions}
                value={formData.specialtyId}
                onChange={(e) => setFormData({ ...formData, specialtyId: e.target.value, doctorId: '' })}
                required
                disabled={isLoading}
                selectSize="lg"
              />
            </div>

            {/* Select Doctor */}
            <div>
              <p className="block text-xl font-semibold text-gray-900 mb-4">
                2. Select Doctor
              </p>
              <Select
                options={doctorOptions}
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                required
                disabled={isLoading || !formData.specialtyId}
                selectSize="lg"
              />
              {!formData.specialtyId && (
                <p className="mt-2 text-base text-gray-600">
                  Please select a specialty first
                </p>
              )}
            </div>

            {/* Select Date */}
            <div>
              <p className="block text-xl font-semibold text-gray-900 mb-4">
                3. Select Date
              </p>
              <DatePicker
                label=""
                value={formData.appointmentDate}
                onChange={(date) => setFormData({ ...formData, appointmentDate: date || new Date(), timeSlotId: '' })}
                minDate={new Date()}
                required
                disabled={isLoading || !formData.doctorId}
              />
              {!formData.doctorId && (
                <p className="mt-2 text-base text-gray-600">
                  Please select a doctor first
                </p>
              )}
            </div>

            {/* Select Time Slot */}
            <div>
              <p className="block text-xl font-semibold text-gray-900 mb-4">
                4. Select Time
              </p>
              {formData.doctorId && formData.appointmentDate ? (
                timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, timeSlotId: slot.id })}
                        className={`px-4 py-3 rounded-lg border-2 text-lg font-medium transition-all min-h-[52px] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 ${
                          formData.timeSlotId === slot.id
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-400 text-gray-700'
                        }`}
                      >
                        {slot.start_time.substring(0, 5)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-lg text-gray-600">
                    No available time slots for this date. Please select another date.
                  </div>
                )
              ) : (
                <p className="text-base text-gray-600">
                  Please select a doctor and date first
                </p>
              )}
            </div>

            {/* Appointment Type */}
            <div>
              <p className="block text-xl font-semibold text-gray-900 mb-4">
                5. Appointment Type
              </p>
              <Select
                options={appointmentTypeOptions}
                value={formData.appointmentType}
                onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                required
                disabled={isLoading}
                selectSize="lg"
              />
            </div>

            {/* Reason */}
            <div>
              <Textarea
                label="Reason for Visit"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please describe your symptoms or reason for the appointment"
                required
                disabled={isLoading}
                rows={4}
                className="text-lg"
              />
              <p className="mt-2 text-base text-gray-600">
                Help us prepare for your visit by providing details
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || !formData.timeSlotId}
                className="w-full text-xl py-8"
              >
                {isLoading ? 'Booking Appointment...' : 'Confirm Appointment'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
