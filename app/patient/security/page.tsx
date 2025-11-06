'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/data/card';
import { Alert } from '@/components/feedback/alert';

interface Session {
  id: string;
  ip_address: string;
  user_agent: {
    browser: string;
    os: string;
    device: string;
  };
  location: string;
  last_activity: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export default function SecurityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSecurityData();
  }, []);

  async function loadSecurityData() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load 2FA status
      const { data: twoFactorData } = await supabase.functions.invoke('two-factor-auth', {
        body: { action: 'get_status' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (twoFactorData?.data) {
        setTwoFactorEnabled(twoFactorData.data.enabled);
      }

      // Load active sessions
      const { data: sessionsData } = await supabase.functions.invoke('session-manager', {
        body: { action: 'get_active_sessions' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (sessionsData?.data?.sessions) {
        setActiveSessions(sessionsData.data.sessions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  }

  async function terminateSession(sessionId: string) {
    setError('');
    setSuccess('');

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'terminate_session',
          data: { session_id: sessionId }
        },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      setSuccess('Session terminated successfully');
      loadSecurityData();
    } catch (err: any) {
      setError(err.message || 'Failed to terminate session');
    }
  }

  async function terminateAllOtherSessions() {
    if (!confirm('Are you sure you want to terminate all other sessions? You will remain logged in on this device.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get current session ID (simplified - in production, track this properly)
      const currentSessionId = activeSessions.find(s => s.is_current)?.id || activeSessions[0]?.id;

      const { error } = await supabase.functions.invoke('session-manager', {
        body: {
          action: 'terminate_all_other_sessions',
          data: { current_session_id: currentSessionId }
        },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      setSuccess('All other sessions terminated successfully');
      loadSecurityData();
    } catch (err: any) {
      setError(err.message || 'Failed to terminate sessions');
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-SG', {
      timeZone: 'Asia/Singapore',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  function getDeviceIcon(device: string) {
    if (device === 'Mobile') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading security settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h1>
          <p className="text-gray-600">Manage your account security and active sessions</p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        {/* Two-Factor Authentication */}
        <Card className="mb-6 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <svg className={`w-6 h-6 ${twoFactorEnabled ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Two-Factor Authentication
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  Add an extra layer of security to your account
                </p>
                {twoFactorEnabled ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Not enabled
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={() => router.push('/auth/setup-2fa')}
              variant={twoFactorEnabled ? 'outline' : 'primary'}
              size="sm"
            >
              {twoFactorEnabled ? 'Manage' : 'Enable'}
            </Button>
          </div>
        </Card>

        {/* Active Sessions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Active Sessions</h3>
              <p className="text-gray-600 text-sm">
                Devices currently logged into your account
              </p>
            </div>
            {activeSessions.length > 1 && (
              <Button
                onClick={terminateAllOtherSessions}
                variant="outline"
                size="sm"
              >
                Sign Out All Others
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {activeSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active sessions found</p>
            ) : (
              activeSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border-2 ${
                    session.is_current
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        session.is_current ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getDeviceIcon(session.user_agent?.device || 'Desktop')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {session.user_agent?.browser || 'Unknown Browser'} on {session.user_agent?.os || 'Unknown OS'}
                          </h4>
                          {session.is_current && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">IP:</span> {session.ip_address}
                          </p>
                          <p>
                            <span className="font-medium">Last active:</span> {formatDate(session.last_activity)}
                          </p>
                          <p>
                            <span className="font-medium">Signed in:</span> {formatDate(session.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!session.is_current && (
                      <Button
                        onClick={() => terminateSession(session.id)}
                        variant="outline"
                        size="sm"
                      >
                        Sign Out
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Security Tips */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Security Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Enable two-factor authentication for enhanced security
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Regularly review your active sessions and sign out unused devices
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Never share your password or verification codes with anyone
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Contact support immediately if you notice any suspicious activity
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
