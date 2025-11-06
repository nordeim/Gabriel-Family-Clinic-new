'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/forms/input';
import { Alert } from '@/components/feedback/alert';
import { Card } from '@/components/data/card';

export default function Setup2FAPage() {
  const router = useRouter();
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUser({ id: user.id, email: user.email || '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check authentication';
      setError(errorMessage);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  async function setupTOTP() {
    setLoading(true);
    setError('');
    const supabase = createClient();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('two-factor-auth', {
        body: {
          action: 'setup_totp'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.data) {
        setQrCodeUrl(data.data.qr_code_url);
        setSecret(data.data.secret);
        setStep('verify');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  }

  async function verifyTOTP() {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    const supabase = createClient();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('two-factor-auth', {
        body: {
          action: 'verify_totp',
          data: { code: verificationCode }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.data?.enabled) {
        setBackupCodes(data.data.backup_codes || []);
        setStep('backup');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  function downloadBackupCodes() {
    const content = `Gabriel Family Clinic - Two-Factor Authentication Backup Codes

Generated: ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}
User: ${user?.email}

IMPORTANT: Store these codes in a secure location. Each code can only be used once.

Backup Codes:
${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

If you lose access to your authenticator app, you can use these codes to sign in.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2fa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  function finishSetup() {
    router.push('/patient');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-lg text-gray-600">
            Add an extra layer of security to your account
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {step === 'setup' && (
          <Card className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Enhance Your Account Security
              </h2>
              
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Two-factor authentication (2FA) adds an extra layer of security by requiring a verification code from your authenticator app in addition to your password.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">What you&apos;ll need:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    An authenticator app (Google Authenticator, Authy, Microsoft Authenticator)
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Your mobile phone
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    A secure place to store backup codes
                  </li>
                </ul>
              </div>

              <Button
                onClick={setupTOTP}
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto min-w-[200px]"
              >
                {loading ? 'Setting up...' : 'Get Started'}
              </Button>
            </div>
          </Card>
        )}

        {step === 'verify' && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Scan QR Code
            </h2>

            <div className="space-y-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4 text-center">
                  Scan this QR code with your authenticator app:
                </p>
                
                <div className="bg-gray-50 p-8 rounded-lg flex items-center justify-center mb-4">
                  {qrCodeUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                      alt="2FA QR Code"
                      className="w-48 h-48"
                    />
                  )}
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Can&apos;t scan the code? Enter manually
                  </summary>
                  <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Secret Key:</p>
                    <code className="text-sm font-mono bg-white px-2 py-1 rounded border border-gray-300 break-all">
                      {secret}
                    </code>
                  </div>
                </details>
              </div>

              <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter verification code
                </label>
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-wider font-mono"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('setup')}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={verifyTOTP}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 'backup' && (
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                2FA Enabled Successfully!
              </h2>
              <p className="text-gray-600">
                Save your backup codes before continuing
              </p>
            </div>

            <Alert variant="warning" className="mb-6">
              <strong>Important:</strong> Store these backup codes in a secure location. Each code can only be used once if you lose access to your authenticator app.
            </Alert>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white px-3 py-2 rounded border border-gray-300">
                    <span className="text-gray-500 mr-2">{index + 1}.</span>
                    <span className="font-semibold">{code}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Codes
              </Button>
              <Button
                onClick={finishSetup}
                className="flex-1"
              >
                Continue to Dashboard
              </Button>
            </div>
          </Card>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact support at{' '}
          <a href="mailto:support@gabrielclinic.sg" className="text-blue-600 hover:text-blue-700">
            support@gabrielclinic.sg
          </a>
        </p>
      </div>
    </div>
  );
}
