'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/data/card';
import { Alert } from '@/components/feedback/alert';

import {
  Calendar,
  FileText,
  Pill,
  CreditCard,
  User,
  Clock,

  Heart,
  Plus,
} from 'lucide-react';
import { formatDate } from '@/lib/singapore/localization';

interface PatientData {
  full_name: string;
  nric: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  doctor_id: string;
  clinic_id: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient();
        const user = await getCurrentUser();
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }

        // Load patient data
        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (patientError || !patient) {
          // Patient profile not complete, redirect to setup
          router.push('/auth/profile-setup');
          return;
        }

        setPatientData({
          full_name: user.full_name || '',
          nric: patient.nric,
        });

        // Load upcoming appointments
        const { data: appointments, error: apptError } = await supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', patient.id)
          .gte('appointment_date', new Date().toISOString().split('T')[0])
          .order('appointment_date', { ascending: true })
          .limit(3);

        if (!apptError && appointments) {
          setUpcomingAppointments(appointments);
        }

        setIsLoading(false);
      } catch {
        setError('Failed to load dashboard data');
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {patientData?.full_name}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Your health dashboard
              </p>
            </div>
            <div>
              <Link href="/patient/profile">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <User size={20} />
                  My Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/patient/appointments/book">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Book Appointment
                  </h3>
                  <p className="text-base text-gray-600">
                    Schedule a visit with our doctors
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/patient/records">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                    <FileText className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Medical Records
                  </h3>
                  <p className="text-base text-gray-600">
                    View your health history
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/patient/prescriptions">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <Pill className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Prescriptions
                  </h3>
                  <p className="text-base text-gray-600">
                    Manage your medications
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/patient/payments">
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
                    <CreditCard className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Payments
                  </h3>
                  <p className="text-base text-gray-600">
                    View bills and CHAS subsidies
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* Upcoming Appointments */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Upcoming Appointments
            </h2>
            <Link href="/patient/appointments">
              <Button variant="outline" size="md">
                View All
              </Button>
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Upcoming Appointments
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  You don&apos;t have any appointments scheduled
                </p>
                <Link href="/patient/appointments/book">
                  <Button variant="primary" size="lg" className="flex items-center gap-2 mx-auto">
                    <Plus size={20} />
                    Book New Appointment
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                >
                  <Link href={`/patient/appointments/${appointment.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                                appointment.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : appointment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                              <span className="text-base text-gray-600 capitalize">
                                {appointment.appointment_type}
                              </span>
                            </div>
                            <div className="flex items-center gap-6 text-lg">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-gray-900">
                                  {formatDate(new Date(appointment.appointment_date))}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-gray-900">
                                  {appointment.appointment_time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="md">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Health Summary Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Heart className="w-8 h-8 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">Health Status</h3>
              </div>
              <p className="text-lg text-gray-700 mb-4">
                Your health records are up to date
              </p>
              <Link href="/patient/records">
                <Button variant="outline" size="md" className="w-full">
                  View Records
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Pill className="w-8 h-8 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Active Prescriptions</h3>
              </div>
              <p className="text-lg text-gray-700 mb-4">
                Check your current medications
              </p>
              <Link href="/patient/prescriptions">
                <Button variant="outline" size="md" className="w-full">
                  View Prescriptions
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <CreditCard className="w-8 h-8 text-emerald-600" />
                <h3 className="text-xl font-semibold text-gray-900">CHAS Benefits</h3>
              </div>
              <p className="text-lg text-gray-700 mb-4">
                View your subsidy eligibility
              </p>
              <Link href="/patient/payments">
                <Button variant="outline" size="md" className="w-full">
                  View Benefits
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
