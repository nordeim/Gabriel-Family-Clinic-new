'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/supabase/auth';
import { Input } from '@/components/forms/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/feedback/alert';


function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/patient';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: signInError, data } = await signIn(email, password);

      if (signInError) {
        setError(signInError || 'Failed to sign in. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Redirect to appropriate dashboard based on user role
      if (data?.user) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 sm:px-6 lg:px-8">
      <div
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-4xl font-bold text-gray-900"
          >
            Gabriel Family Clinic
          </h1>
          <p
            className="mt-4 text-xl text-gray-700"
          >
            Welcome Back
          </p>
          <p
            className="mt-2 text-lg text-gray-600"
          >
            Sign in to access your healthcare portal
          </p>
        </div>

        {/* Form Card */}
        <div
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          {error && (
            <Alert variant="error" title="Sign In Failed">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Email Address"
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                autoComplete="email"
                disabled={isLoading}
                className="text-lg"
              />
              <p className="mt-2 text-sm text-gray-600">
                Enter your registered email address
              </p>
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
                className="text-lg"
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Enter your secure password
                </p>
                <Link
                  href="/auth/reset-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full text-lg py-6"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-600">New to Gabriel Family Clinic?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center w-full px-6 py-4 border-2 border-blue-600 text-lg font-medium rounded-xl text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all min-h-[44px]"
            >
              Create New Account
            </Link>
            <p className="mt-3 text-base text-gray-600">
              Register as a patient or healthcare provider
            </p>
          </div>
        </div>

        {/* Footer Links */}
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
            By signing in, you agree to our{' '}
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

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
