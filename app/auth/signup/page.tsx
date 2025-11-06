'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/supabase/auth';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/feedback/alert';

import { User, Stethoscope } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'patient' as 'patient' | 'doctor',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.fullName,
          phone: '', // Will be collected during profile setup
          role: formData.role,
        }
      );

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      // Redirect to profile setup after successful registration
      setTimeout(() => {
        router.push('/auth/profile-setup');
      }, 2000);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4">
        <div
          className="max-w-md w-full"
        >
          <Alert variant="success" title="Account Created Successfully!">
            Welcome to Gabriel Family Clinic. Please check your email for verification link.
            Redirecting you to complete your profile...
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 sm:px-6 lg:px-8 py-12">
      <div
        className="max-w-2xl w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-4xl font-bold text-gray-900"
          >
            Create Your Account
          </h1>
          <p
            className="mt-4 text-xl text-gray-700"
          >
            Join Gabriel Family Clinic
          </p>
          <p
            className="mt-2 text-lg text-gray-600"
          >
            Register as a patient or healthcare provider
          </p>
        </div>

        {/* Form Card */}
        <div
          className="bg-white rounded-2xl shadow-xl p-8 space-y-8"
        >
          {error && (
            <Alert variant="error" title="Registration Failed">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Role Selection */}
            <div>
              <p className="block text-xl font-semibold text-gray-900 mb-4">
                Select Your Role
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'patient' })}
                  className={`p-6 rounded-xl border-2 transition-all min-h-[120px] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.role === 'patient'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-blue-400'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <User size={40} className={formData.role === 'patient' ? 'text-blue-600' : 'text-gray-600'} />
                    <span className="text-lg font-semibold">Patient</span>
                    <span className="text-sm text-gray-600">Book appointments and manage your health</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'doctor' })}
                  className={`p-6 rounded-xl border-2 transition-all min-h-[120px] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.role === 'doctor'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-blue-400'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Stethoscope size={40} className={formData.role === 'doctor' ? 'text-blue-600' : 'text-gray-600'} />
                    <span className="text-lg font-semibold">Doctor</span>
                    <span className="text-sm text-gray-600">Manage patients and appointments</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              
              <Input
                label="Full Name"
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                required
                autoComplete="name"
                disabled={isLoading}
                className="text-lg"
              />

              <Input
                label="Email Address"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                required
                autoComplete="email"
                disabled={isLoading}
                className="text-lg"
              />
            </div>

            {/* Password */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Create Password</h3>
              
              <div>
                <Input
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a secure password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="text-lg"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Password must be at least 8 characters long
                </p>
              </div>

              <Input
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
                disabled={isLoading}
                className="text-lg"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full text-lg py-6"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-600">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center w-full px-6 py-4 border-2 border-blue-600 text-lg font-medium rounded-xl text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all min-h-[44px]"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center space-y-4"
        >
          <div className="flex justify-center gap-6 text-base">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2"
            >
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-2"
            >
              Need Help?
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
