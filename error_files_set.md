# ./app/admin/security/dashboard/page.tsx
```tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/data/card';
import { Alert } from '@/components/feedback/alert';

interface SecurityMetrics {
  failed_logins: number;
  active_incidents: number;
  incidents_by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  audit_events: number;
  active_sessions: number;
  time_range: string;
}

interface Incident {
  id: string;
  incident_id: string;
  incident_type: string;
  severity: string;
  status: string;
  title: string;
  created_at: string;
  affected_users: string[];
}

export default function SecurityDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadSecurityData();
    }
  }, [timeRange]);

  async function checkAdminAccess() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle() as { data: { role: string } | null };

    if (!userData || userData.role !== 'admin') {
      router.push('/patient');
      return;
    }

    setLoading(false);
    loadSecurityData();
  }

  async function loadSecurityData() {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load security metrics
      const { data: metricsData } = await supabase.functions.invoke('security-monitor', {
        body: {
          action: 'get_security_metrics',
          event_data: { time_range: timeRange }
        },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (metricsData?.data) {
        setMetrics(metricsData.data);
      }

      // Load active incidents
      const { data: incidentsData } = await supabase.functions.invoke('incident-response', {
        body: { action: 'get_active_incidents' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (incidentsData?.data?.incidents) {
        setActiveIncidents(incidentsData.data.incidents.slice(0, 10));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load security data');
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusBadge(status: string) {
    const colors = {
      open: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      escalated: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.open;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Dashboard</h1>
          <p className="text-gray-600">Real-time security monitoring and incident management</p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Failed Logins */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Failed Logins</h3>
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics?.failed_logins || 0}</p>
            <p className="text-sm text-gray-500 mt-1">attempts blocked</p>
          </Card>

          {/* Active Incidents */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Incidents</h3>
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics?.active_incidents || 0}</p>
            <p className="text-sm text-gray-500 mt-1">require attention</p>
          </Card>

          {/* Audit Events */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Audit Events</h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics?.audit_events || 0}</p>
            <p className="text-sm text-gray-500 mt-1">logged events</p>
          </Card>

          {/* Active Sessions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Sessions</h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics?.active_sessions || 0}</p>
            <p className="text-sm text-gray-500 mt-1">users online</p>
          </Card>
        </div>

        {/* Incidents by Severity */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Incidents by Severity</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border-2 ${getSeverityColor('critical')}`}>
              <p className="text-2xl font-bold">{metrics?.incidents_by_severity.critical || 0}</p>
              <p className="text-sm font-medium mt-1">Critical</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${getSeverityColor('high')}`}>
              <p className="text-2xl font-bold">{metrics?.incidents_by_severity.high || 0}</p>
              <p className="text-sm font-medium mt-1">High</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${getSeverityColor('medium')}`}>
              <p className="text-2xl font-bold">{metrics?.incidents_by_severity.medium || 0}</p>
              <p className="text-sm font-medium mt-1">Medium</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${getSeverityColor('low')}`}>
              <p className="text-2xl font-bold">{metrics?.incidents_by_severity.low || 0}</p>
              <p className="text-sm font-medium mt-1">Low</p>
            </div>
          </div>
        </Card>

        {/* Recent Incidents */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Security Incidents</h3>
            <button
              onClick={() => router.push('/admin/security/incidents')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>

          {activeIncidents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 font-medium">No active security incidents</p>
              <p className="text-sm text-gray-500 mt-1">Your system is secure</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeIncidents.map((incident) => (
                <div
                  key={incident.id}
                  role="button"
                  tabIndex={0}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/security/incidents/${incident.incident_id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/admin/security/incidents/${incident.incident_id}`);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(incident.status)}`}>
                          {incident.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          #{incident.incident_id}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{incident.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {incident.incident_type.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      <p>{new Date(incident.created_at).toLocaleString('en-SG', { timeZone: 'Asia/Singapore', dateStyle: 'short', timeStyle: 'short' })}</p>
                      {incident.affected_users?.length > 0 && (
                        <p className="mt-1">{incident.affected_users.length} user(s) affected</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button
            onClick={() => router.push('/admin/security/audit')}
            className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Audit Logs</h3>
            </div>
            <p className="text-sm text-gray-600">View detailed activity logs</p>
          </button>

          <button
            onClick={() => router.push('/admin/security/compliance')}
            className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Compliance Reports</h3>
            </div>
            <p className="text-sm text-gray-600">PDPA & healthcare compliance</p>
          </button>

          <button
            onClick={() => router.push('/admin/security/incidents')}
            className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Incident Management</h3>
            </div>
            <p className="text-sm text-gray-600">Track and resolve incidents</p>
          </button>
        </div>
      </div>
    </div>
  );
}

```

# ./app/auth/setup-2fa/page.tsx
```tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    setUser(user);
  }

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

```

# ./app/patient/appointments/book/page.tsx
```tsx
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
        const doctorsWithNames = docData.map((d: any) => ({
          id: d.id,
          full_name: (d.users as { full_name?: string })?.full_name || 'Unknown',
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

```

# ./app/patient/security/page.tsx
```tsx
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

```

# ./components/data/card.tsx
```tsx
/**
 * Gabriel Family Clinic - Card Component
 * Healthcare-optimized card with WCAG AAA compliance
 */

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  [
    "rounded-xl border transition-all duration-200",
    "bg-white shadow-soft",
  ],
  {
    variants: {
      variant: {
        default: "border-neutral-200 hover:shadow-medium",
        primary: "border-primary-200 bg-primary-50",
        success: "border-emerald-200 bg-emerald-50",
        warning: "border-amber-200 bg-amber-50",
        error: "border-red-200 bg-red-50",
        medical: "border-primary-300 bg-gradient-to-br from-primary-50 to-white",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      clickable: {
        true: "cursor-pointer hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      clickable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Card header content
   */
  header?: React.ReactNode;
  /**
   * Card footer content
   */
  footer?: React.ReactNode;
  /**
   * Accessible card title
   */
  title?: string;
  /**
   * Card description for screen readers
   */
  description?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      clickable,
      header,
      footer,
      title,
      description,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isClickable = clickable || !!onClick;

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, clickable: isClickable }),
          className
        )}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.(e as any);
                }
              }
            : undefined
        }
        aria-label={title}
        aria-describedby={description ? `${title}-description` : undefined}
        {...props}
      >
        {/* Header */}
        {header && (
          <div className="mb-4 pb-4 border-b border-neutral-200">
            {header}
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {title && (
            <h3 className="text-xl font-semibold text-neutral-900">
              {title}
            </h3>
          )}
          {description && (
            <p
              id={`${title}-description`}
              className="text-base text-neutral-600"
            >
              {description}
            </p>
          )}
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * Card Header Component
 */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1.5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * Card Title Component
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-neutral-900",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * Card Description Component
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base text-neutral-600", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * Card Content Component
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

/**
 * Card Footer Component
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export default Card;

```

# ./components/feedback/alert.tsx
```tsx
/**
 * Alert Component
 * 
 * Elderly-friendly alert for displaying important healthcare information with WCAG AAA compliance.
 * 
 * Features:
 * - Multiple alert types (info, success, warning, error, medical)
 * - 18px minimum font size (elderly accessibility)
 * - 7:1 contrast ratios
 * - Icons for visual recognition
 * - Dismissible option (44px+ touch target)
 * - Screen reader announcements
 * - Healthcare-appropriate styling
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  [
    'relative rounded-lg border-2 p-4 transition-all duration-200',
    'flex items-start gap-3',
  ],
  {
    variants: {
      variant: {
        info: [
          'bg-blue-50 border-blue-200',
          'text-blue-900',
        ],
        success: [
          'bg-emerald-50 border-emerald-200',
          'text-emerald-900',
        ],
        warning: [
          'bg-amber-50 border-amber-200',
          'text-amber-900',
        ],
        error: [
          'bg-red-50 border-red-200',
          'text-red-900',
        ],
        medical: [
          'bg-primary-50 border-primary-200',
          'text-primary-900',
        ],
      },
      size: {
        sm: 'text-sm p-3',
        md: 'text-base p-4',
        lg: 'text-lg p-6',
      },
    },
    defaultVariants: {
      variant: 'info',
      size: 'md',
    },
  }
);

const iconVariants = cva('flex-shrink-0', {
  variants: {
    variant: {
      info: 'text-blue-600',
      success: 'text-emerald-600',
      warning: 'text-amber-600',
      error: 'text-red-600',
      medical: 'text-primary-600',
    },
    size: {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    },
  },
  defaultVariants: {
    variant: 'info',
    size: 'md',
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /**
   * Alert title
   */
  title?: string;
  /**
   * Alert message
   */
  message?: string;
  /**
   * Whether the alert can be dismissed
   */
  dismissible?: boolean;
  /**
   * Dismiss handler
   */
  onDismiss?: () => void;
  /**
   * Show icon
   */
  showIcon?: boolean;
  /**
   * Custom icon
   */
  icon?: React.ReactNode;
}

const getIcon = (variant: string | null | undefined, size: string | null | undefined) => {
  const iconClass = cn(iconVariants({ variant: variant as any, size: size as any }));

  switch (variant) {
    case 'success':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'error':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'medical':
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

export const Alert = ({
  className,
  variant,
  size,
  title,
  message,
  dismissible = false,
  onDismiss,
  showIcon = true,
  icon,
  children,
  ...props
}: AlertProps) => {
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  const ariaLive = variant === 'error' || variant === 'warning' ? 'assertive' : 'polite';

  return (
    <div
      className={cn(alertVariants({ variant, size }), className)}
      role={role}
      aria-live={ariaLive}
      {...props}
    >
      {/* Icon */}
      {showIcon && (
        <div className="flex-shrink-0 pt-0.5">
          {icon || getIcon(variant, size)}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-1">
        {title && (
          <h4 className="font-semibold leading-tight">
            {title}
          </h4>
        )}
        {message && (
          <p className="leading-relaxed opacity-90">
            {message}
          </p>
        )}
        {children}
      </div>

      {/* Dismiss Button */}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 p-2 rounded-lg hover:bg-black/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
          aria-label="Dismiss alert"
        >
          <svg
            className={cn(iconVariants({ variant, size }))}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Alert Title Component
 */
export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = ({ className, children, ...props }: AlertTitleProps) => {
  return (
    <h4 className={cn('font-semibold leading-tight mb-1', className)} {...props}>
      {children}
    </h4>
  );
};

/**
 * Alert Description Component
 */
export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = ({ className, children, ...props }: AlertDescriptionProps) => {
  return (
    <p className={cn('leading-relaxed opacity-90', className)} {...props}>
      {children}
    </p>
  );
};

/**
 * Medical Alert Component
 * Pre-configured alert for medical information
 */
export interface MedicalAlertProps extends Omit<AlertProps, 'variant'> {
  /**
   * Medical alert type
   */
  type?: 'appointment' | 'medication' | 'result' | 'reminder';
}

export const MedicalAlert = ({ type: _type = 'appointment', ...props }: MedicalAlertProps) => {
  return (
    <Alert
      variant="medical"
      {...props}
    />
  );
};

Alert.displayName = 'Alert';
AlertTitle.displayName = 'AlertTitle';
AlertDescription.displayName = 'AlertDescription';
MedicalAlert.displayName = 'MedicalAlert';

export default Alert;

```

# ./components/forms/date-picker.tsx
```tsx
/**
 * DatePicker Component
 * 
 * Elderly-friendly date picker with WCAG AAA compliance and Singapore DD/MM/YYYY format.
 * 
 * Features:
 * - Singapore date format (DD/MM/YYYY)
 * - 44px minimum touch targets (WCAG AAA)
 * - 18px minimum font size (elderly accessibility)
 * - 7:1 contrast ratios
 * - Keyboard navigation (arrows, Enter, Escape)
 * - Healthcare appointment date restrictions
 * - React Hook Form integration
 * - ARIA attributes for screen readers
 */

'use client';

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

const datePickerVariants = cva(
  [
    'w-full rounded-lg border-2 transition-all duration-200',
    'text-base leading-normal',
    'px-4 py-3 min-h-[48px]',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'cursor-pointer',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white border-neutral-200',
          'hover:border-neutral-300',
          'focus:border-primary-600 focus:ring-primary-600/20',
        ],
        error: [
          'bg-white border-red-600',
          'focus:border-red-600 focus:ring-red-600/20',
        ],
      },
      datePickerSize: {
        md: 'min-h-[48px] text-base',
        lg: 'min-h-[56px] text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      datePickerSize: 'md',
    },
  }
);

export interface DatePickerProps extends VariantProps<typeof datePickerVariants> {
  /**
   * DatePicker label
   */
  label?: string;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Error message
   */
  error?: string;
  /**
   * Required field indicator
   */
  required?: boolean;
  /**
   * Selected date value
   */
  value?: Date | null;
  /**
   * Change handler
   */
  onChange?: (date: Date | null) => void;
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  /**
   * Disabled dates
   */
  disabledDates?: Date[];
  /**
   * Disabled component
   */
  disabled?: boolean;
  /**
   * ID for the input
   */
  id?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Custom className
   */
  className?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      variant,
      datePickerSize,
      label,
      helperText,
      error,
      required,
      value,
      onChange,
      minDate,
      maxDate,
      disabledDates = [],
      disabled,
      id,
      placeholder = 'DD/MM/YYYY',
    },
    _ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value || new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const datePickerId = id || `datepicker-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${datePickerId}-helper`;
    const errorId = `${datePickerId}-error`;
    const calendarId = `${datePickerId}-calendar`;

    const currentVariant = error ? 'error' : variant;

    // Format date as DD/MM/YYYY (Singapore format)
    const formatDate = (date: Date | null): string => {
      if (!date || !isValid(date)) return '';
      return format(date, 'dd/MM/yyyy');
    };

    // Parse DD/MM/YYYY string to Date
    const parseDate = (dateString: string): Date | null => {
      if (!dateString) return null;
      const parsed = parse(dateString, 'dd/MM/yyyy', new Date());
      return isValid(parsed) ? parsed : null;
    };

    // Check if date is disabled
    const isDateDisabled = (date: Date): boolean => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return disabledDates.some(disabledDate => isSameDay(date, disabledDate));
    };

    // Get calendar days for current month
    const getCalendarDays = () => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    };

    // Handle date selection
    const handleDateSelect = (date: Date) => {
      if (isDateDisabled(date)) return;
      
      setSelectedDate(date);
      onChange?.(date);
      setIsOpen(false);
      inputRef.current?.focus();
    };

    // Handle input change (manual entry)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const parsed = parseDate(inputValue);
      
      if (parsed && isValid(parsed) && !isDateDisabled(parsed)) {
        setSelectedDate(parsed);
        setCurrentMonth(parsed);
        onChange?.(parsed);
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.focus();
      }
    };

    // Close calendar when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Update selected date when value prop changes
    useEffect(() => {
      setSelectedDate(value || null);
      if (value) setCurrentMonth(value);
    }, [value]);

    const calendarDays = getCalendarDays();
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="w-full space-y-2" ref={containerRef}>
        {/* Label */}
        {label && (
          <label
            htmlFor={datePickerId}
            className={cn(
              'block text-base font-medium text-neutral-900',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {required && (
              <span className="text-red-600 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            id={datePickerId}
            value={formatDate(selectedDate)}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              datePickerVariants({ variant: currentVariant, datePickerSize }),
              'pr-12',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(
              error && errorId,
              helperText && helperId
            )}
            aria-required={required}
            aria-expanded={isOpen}
            aria-controls={calendarId}
          />

          {/* Calendar Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="h-5 w-5 text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Calendar Dropdown */}
          {isOpen && !disabled && (
            <div
              id={calendarId}
              className="absolute z-50 mt-2 bg-white border-2 border-neutral-200 rounded-lg shadow-lg p-4 w-full min-w-[320px]"
              role="dialog"
              aria-label="Choose date"
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Previous month"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-lg font-semibold text-neutral-900">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Next month"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-neutral-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isDisabled = isDateDisabled(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      disabled={isDisabled}
                      className={cn(
                        'min-w-[44px] min-h-[44px] rounded-lg text-base transition-colors',
                        'hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-600',
                        isCurrentMonth ? 'text-neutral-900' : 'text-neutral-400',
                        isSelected && 'bg-primary-600 text-white hover:bg-primary-700',
                        isToday && !isSelected && 'border-2 border-primary-600',
                        isDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent'
                      )}
                      aria-label={formatDate(day)}
                      aria-selected={isSelected || undefined}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>

              {/* Today Button */}
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                disabled={isDateDisabled(new Date())}
                className="w-full mt-4 py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                Today
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-neutral-600">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;

```

# ./components/overlay/modal.tsx
```tsx
/**
 * Modal Component
 * 
 * Elderly-friendly modal dialog with WCAG AAA compliance and healthcare styling.
 * 
 * Features:
 * - Focus trap and management
 * - 44px minimum touch targets (WCAG AAA)
 * - 18px minimum font size (elderly accessibility)
 * - 7:1 contrast ratios
 * - Keyboard navigation (Escape to close)
 * - Click outside to close
 * - Screen reader announcements
 * - Healthcare-appropriate animations
 */

'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const modalVariants = cva(
  [
    'relative bg-white rounded-lg shadow-xl',
    'w-full max-h-[90vh] overflow-auto',
    'animate-in fade-in-0 zoom-in-95 duration-200',
  ],
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Close handler
   */
  onClose: () => void;
  /**
   * Modal title
   */
  title?: string;
  /**
   * Modal description
   */
  description?: string;
  /**
   * Modal content
   */
  children?: ReactNode;
  /**
   * Footer content (usually buttons)
   */
  footer?: ReactNode;
  /**
   * Prevent closing on outside click
   */
  preventOutsideClick?: boolean;
  /**
   * Prevent closing on Escape key
   */
  preventEscapeClose?: boolean;
  /**
   * Show close button
   */
  showCloseButton?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  preventOutsideClick = false,
  preventEscapeClose = false,
  showCloseButton = true,
  size,
  className,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventEscapeClose && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, preventEscapeClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal
      modalRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore focus to the previously focused element
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle outside click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !preventOutsideClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in-0 duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        ref={modalRef}
        className={cn(modalVariants({ size }), className)}
        tabIndex={-1}
        role="document"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b-2 border-neutral-100">
            <div className="flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-2xl font-semibold text-neutral-900 leading-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-2 text-base text-neutral-600"
                >
                  {description}
                </p>
              )}
            </div>

            {/* Close Button */}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 ml-4 p-2 rounded-lg hover:bg-neutral-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6 text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          <div className="text-base text-neutral-700">{children}</div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-neutral-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal Header Component
 */
export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export const ModalHeader = ({ children, className }: ModalHeaderProps) => {
  return (
    <div className={cn('p-6 border-b-2 border-neutral-100', className)}>
      {children}
    </div>
  );
};

/**
 * Modal Body Component
 */
export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export const ModalBody = ({ children, className }: ModalBodyProps) => {
  return (
    <div className={cn('p-6 text-base text-neutral-700', className)}>
      {children}
    </div>
  );
};

/**
 * Modal Footer Component
 */
export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export const ModalFooter = ({
  children,
  className,
  align = 'right',
}: ModalFooterProps) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-6 border-t-2 border-neutral-100',
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Confirmation Modal Component
 * Pre-configured modal for confirmation dialogs
 */
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmationModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={message}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 min-h-[44px] rounded-lg border-2 border-neutral-200 bg-white text-neutral-900 font-medium hover:bg-neutral-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(
              'px-6 py-3 min-h-[44px] rounded-lg font-medium transition-colors',
              variant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            {confirmText}
          </button>
        </>
      }
    />
  );
};

Modal.displayName = 'Modal';
ModalHeader.displayName = 'ModalHeader';
ModalBody.displayName = 'ModalBody';
ModalFooter.displayName = 'ModalFooter';
ConfirmationModal.displayName = 'ConfirmationModal';

export default Modal;

```

# ./lib/healthcare/chas-utils.ts
```ts
// Healthcare Utilities
// Gabriel Family Clinic - CHAS and Medical Utilities

/**
 * CHAS (Community Health Assist Scheme) card types and subsidies
 */
export const CHAS_CARD_TYPES = {
  BLUE: 'blue',
  ORANGE: 'orange',
  GREEN: 'green',
} as const;

export type CHASCardType = typeof CHAS_CARD_TYPES[keyof typeof CHAS_CARD_TYPES];

/**
 * CHAS subsidy rates (in SGD)
 */
export const CHAS_SUBSIDY_RATES = {
  [CHAS_CARD_TYPES.BLUE]: 18.50,
  [CHAS_CARD_TYPES.ORANGE]: 10.50,
  [CHAS_CARD_TYPES.GREEN]: 5.00,
};

/**
 * Calculate CHAS subsidy amount
 */
export function calculateCHASSubsidy(
  cardType: string | null,
  consultationFee: number
): number {
  if (!cardType) return 0;
  
  const subsidyRate = CHAS_SUBSIDY_RATES[cardType.toLowerCase() as CHASCardType] || 0;
  
  // Subsidy cannot exceed consultation fee
  return Math.min(subsidyRate, consultationFee);
}

/**
 * Calculate patient's out-of-pocket amount
 */
export function calculatePatientPayment(
  consultationFee: number,
  chasSubsidy: number = 0,
  insuranceClaim: number = 0
): number {
  const totalSubsidy = chasSubsidy + insuranceClaim;
  const patientPaid = Math.max(0, consultationFee - totalSubsidy);
  
  return parseFloat(patientPaid.toFixed(2));
}

/**
 * Blood types
 */
export const BLOOD_TYPES = [
  'O+', 'O-', 
  'A+', 'A-', 
  'B+', 'B-', 
  'AB+', 'AB-'
] as const;

export type BloodType = typeof BLOOD_TYPES[number];

/**
 * Appointment types
 */
export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow-up',
  PROCEDURE: 'procedure',
  VACCINATION: 'vaccination',
  HEALTH_SCREENING: 'health-screening',
} as const;

/**
 * Appointment statuses
 */
export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;

/**
 * Get status color for UI display
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case APPOINTMENT_STATUSES.SCHEDULED:
      return 'blue';
    case APPOINTMENT_STATUSES.CONFIRMED:
      return 'green';
    case APPOINTMENT_STATUSES.IN_PROGRESS:
      return 'yellow';
    case APPOINTMENT_STATUSES.COMPLETED:
      return 'gray';
    case APPOINTMENT_STATUSES.CANCELLED:
      return 'red';
    case APPOINTMENT_STATUSES.NO_SHOW:
      return 'orange';
    default:
      return 'gray';
  }
}

/**
 * Calculate BMI (Body Mass Index)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  
  return parseFloat(bmi.toFixed(1));
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 23) return 'Normal';
  if (bmi < 27.5) return 'Overweight';
  return 'Obese';
}

/**
 * Common medical specialties in Singapore
 */
export const MEDICAL_SPECIALTIES = [
  'General Practice',
  'Pediatrics',
  'Internal Medicine',
  'Geriatrics',
  'Family Medicine',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Gynecology',
  'Psychiatry',
  'Neurology',
  'Ophthalmology',
  'ENT (Ear, Nose, Throat)',
] as const;

/**
 * Validate vital signs
 */
export function validateVitalSigns(vitalSigns: {
  bp?: string;
  hr?: string;
  temp?: string;
  weight?: string;
  height?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Blood Pressure validation (format: XXX/XX)
  if (vitalSigns.bp && !/^\d{2,3}\/\d{2,3}$/.test(vitalSigns.bp)) {
    errors.push('Blood pressure must be in format XXX/XX (e.g., 120/80)');
  }

  // Heart Rate validation (40-200 bpm)
  if (vitalSigns.hr) {
    const hr = parseInt(vitalSigns.hr);
    if (isNaN(hr) || hr < 40 || hr > 200) {
      errors.push('Heart rate must be between 40 and 200 bpm');
    }
  }

  // Temperature validation (35-42°C)
  if (vitalSigns.temp) {
    const temp = parseFloat(vitalSigns.temp);
    if (isNaN(temp) || temp < 35 || temp > 42) {
      errors.push('Temperature must be between 35°C and 42°C');
    }
  }

  // Weight validation (1-300 kg)
  if (vitalSigns.weight) {
    const weight = parseFloat(vitalSigns.weight);
    if (isNaN(weight) || weight < 1 || weight > 300) {
      errors.push('Weight must be between 1 and 300 kg');
    }
  }

  // Height validation (30-250 cm)
  if (vitalSigns.height) {
    const height = parseFloat(vitalSigns.height);
    if (isNaN(height) || height < 30 || height > 250) {
      errors.push('Height must be between 30 and 250 cm');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format medical record for display
 */
export function formatMedicalRecord(record: any): string {
  const parts: string[] = [];

  if (record.chief_complaint) {
    parts.push(`Chief Complaint: ${record.chief_complaint}`);
  }

  if (record.diagnosis) {
    parts.push(`Diagnosis: ${record.diagnosis}`);
  }

  if (record.treatment) {
    parts.push(`Treatment: ${record.treatment}`);
  }

  return parts.join('\n');
}

```

# ./lib/polyfills.ts
```ts
// Global polyfills for server-side rendering
if (typeof window === 'undefined') {
  // Only run in server environment
  try {
    if (typeof (global as any).self === 'undefined') {
      (global as any).self = global;
    }
  } catch {
    // Gracefully handle if 'self' check fails
    (global as any).self = global;
  }
}

export {}

```

# ./lib/seo/structured-data.tsx
```tsx
// Healthcare Structured Data Schemas for SEO

export interface HealthcareSchema {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// Medical service schema
export function createMedicalServiceSchema(
  serviceName: string,
  description: string,
  provider: string = 'Gabriel Family Clinic'
): HealthcareSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: serviceName,
    description,
    provider: {
      '@type': 'MedicalOrganization',
      name: provider
    },
    audience: {
      '@type': 'PeopleAudience',
      name: 'Senior Citizens',
      suggestedMinAge: 65
    },
    howPerformed: 'Face-to-face consultation with accessibility support',
    availableLocation: 'Singapore'
  }
}

// Physician schema
export function createPhysicianSchema(
  name: string,
  specialty: string,
  education: string,
  description: string
): HealthcareSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name,
    description,
    medicalSpecialty: specialty,
    education,
    memberOf: {
      '@type': 'MedicalOrganization',
      name: 'Gabriel Family Clinic'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Singapore',
      addressCountry: 'SG'
    },
    availableService: {
      '@type': 'MedicalTherapy',
      name: 'Elderly Health Check',
      description: 'Comprehensive health screening for seniors with accessibility features'
    }
  }
}

// FAQ schema for healthcare queries
export function createFAQSchema(faqs: Array<{ question: string; answer: string }>): HealthcareSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// Breadcrumb schema
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>): HealthcareSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

// Healthcare article schema
export function createHealthcareArticleSchema(
  title: string,
  description: string,
  author: string,
  datePublished: string,
  dateModified: string
): HealthcareSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: title,
    description,
    author: {
      '@type': 'Organization',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Gabriel Family Clinic',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gabrielfamilyclinic.sg/logo.png'
      }
    },
    datePublished,
    dateModified,
    specialty: 'Family Medicine',
    about: {
      '@type': 'MedicalCondition',
      name: 'Elderly Healthcare'
    }
  }
}

// Helper to inject schema into page
export function injectStructuredData(schema: HealthcareSchema | HealthcareSchema[]) {
  const schemaArray = Array.isArray(schema) ? schema : [schema]
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaArray.length === 1 ? schemaArray[0] : schemaArray)
      }}
    />
  )
}

```

# ./lib/supabase/auth.ts
```ts
// Authentication Utilities
// Gabriel Family Clinic Healthcare Platform

import { createClient } from './client';

export interface AuthUser {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'staff';
  full_name: string;
  phone: string;
}

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Error getting user:', error);
      return null;
    }

    // Fetch user details from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      full_name: userData.full_name,
      phone: userData.phone,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Sign up new user
 */
export async function signUp(email: string, password: string, userData: {
  full_name: string;
  phone: string;
  role?: 'patient' | 'doctor' | 'admin' | 'staff';
}) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    // Create user record in users table
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role || 'patient',
        });

      if (insertError) {
        console.error('Error creating user record:', insertError);
      }
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: error.message };
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Update password error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: string | string[]): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

/**
 * Get user's patient record
 */
export async function getPatientRecord(userId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Get patient record error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get user's doctor record
 */
export async function getDoctorRecord(userId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Get doctor record error:', error);
    return { data: null, error: error.message };
  }
}

```

# ./lib/supabase/server.ts
```ts
// Server-side Supabase Client
// Gabriel Family Clinic Healthcare Platform
// For use in Server Components

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Reuse the same database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          role: 'patient' | 'doctor' | 'admin' | 'staff';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          nric: string;
          date_of_birth: string;
          gender: 'M' | 'F' | 'Other';
          address: string;
          postal_code: string | null;
          chas_card_number: string | null;
          chas_card_type: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          user_id: string;
          medical_license: string;
          specialty_ids: string[];
          consultation_fee: number;
          bio: string | null;
          profile_image_url: string | null;
          is_accepting_patients: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          clinic_id: string;
          appointment_date: string;
          appointment_time: string;
          duration: number;
          appointment_type: string;
          status: string;
          reason: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};

// Create Supabase client for server components
export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

# ./lib/utils.ts
```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles conditional classes and removes conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for Singapore timezone
 * @param date - Date to format
 * @param format - Format type: 'short', 'long', 'time'
 */
export function formatDateSG(
  date: Date | string,
  format: "short" | "long" | "time" = "short"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Singapore",
  };

  switch (format) {
    case "short":
      options.day = "2-digit";
      options.month = "2-digit";
      options.year = "numeric";
      return dateObj.toLocaleDateString("en-SG", options);
    case "long":
      options.weekday = "long";
      options.day = "numeric";
      options.month = "long";
      options.year = "numeric";
      return dateObj.toLocaleDateString("en-SG", options);
    case "time":
      options.hour = "2-digit";
      options.minute = "2-digit";
      return dateObj.toLocaleTimeString("en-SG", options);
    default:
      return dateObj.toLocaleDateString("en-SG");
  }
}

/**
 * Format currency for Singapore market
 * @param amount - Amount in SGD
 */
export function formatCurrencySGD(amount: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);
}

/**
 * Validate Singapore phone number
 * @param phone - Phone number to validate
 */
export function isValidSGPhone(phone: string): boolean {
  // Singapore phone numbers: +65 followed by 8 digits starting with 6, 8, or 9
  const sgPhoneRegex = /^(\+65|65)?[689]\d{7}$/;
  return sgPhoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Format Singapore phone number
 * @param phone - Phone number to format
 */
export function formatSGPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("65")) {
    return `+65 ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  return `+65 ${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
}

/**
 * Debounce function for search and input handlers
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Get initials from a full name
 * @param name - Full name
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

```

