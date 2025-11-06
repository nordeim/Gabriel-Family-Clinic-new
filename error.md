```bash
$ rm -rf .next/

$ npm run build

> gabriel-family-clinic@0.1.0 build
> next build

  ▲ Next.js 14.2.22
  - Environments: .env.local
  - Experiments (use with caution):
    · optimizeCss

   Creating an optimized production build ...
Failed to compile.

./app/patient/security/page.tsx
Error: 
  × await isn't allowed in non-async function
    ╭─[/home/project/Gabriel-Family-Clinic-new/app/patient/security/page.tsx:77:1]
 77 │   }, [loadSecurityData]);
 78 │ 
 79 │       // Load 2FA status
 80 │       const { data: twoFactorData } = await supabase.functions.invoke('two-factor-auth', {
    ·                                             ────────
 81 │         body: { action: 'get_status' },
 82 │         headers: { Authorization: `Bearer ${session.access_token}` }
 83 │       });
    ╰────

  × await isn't allowed in non-async function
    ╭─[/home/project/Gabriel-Family-Clinic-new/app/patient/security/page.tsx:87:1]
 87 │       }
 88 │ 
 89 │       // Load active sessions
 90 │       const { data: sessionsData } = await supabase.functions.invoke('session-manager', {
    ·                                            ────────
 91 │         body: { action: 'get_active_sessions' },
 92 │         headers: { Authorization: `Bearer ${session.access_token}` }
 93 │       });
    ╰────

  × Expected a semicolon
     ╭─[/home/project/Gabriel-Family-Clinic-new/app/patient/security/page.tsx:95:1]
  95 │       if (sessionsData?.data?.sessions) {
  96 │         setActiveSessions(sessionsData.data.sessions);
  97 │       }
  98 │     } catch (err: any) {
     ·       ─────
  99 │       setError(err.message || 'Failed to load security data');
 100 │     } finally {
 101 │       setLoading(false);
     ╰────

  × Expression expected
     ╭─[/home/project/Gabriel-Family-Clinic-new/app/patient/security/page.tsx:100:1]
 100 │     } finally {
 101 │       setLoading(false);
 102 │     }
 103 │   }
     ·   ─
 104 │ 
 105 │   async function terminateSession(sessionId: string) {
 106 │     setError('');
     ╰────

Caused by:
    Syntax Error

Import trace for requested module:
./app/patient/security/page.tsx


> Build failed because of webpack errors
```

# File: app/patient/security/page.tsx
```tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
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

  const loadSecurityData = useCallback(async () => {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load security data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

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

---

# Deep-Dive Investigation of Build Error

## Executive Summary

I've conducted a thorough analysis of the build error. The critical issue is a `ReferenceError: self is not defined` occurring during the "Collecting page data" phase for `/admin/security/dashboard`. This error stems from Supabase client code attempting to access browser-specific globals in a Node.js server environment during the build process.

## Phase 1: Request Analysis & Planning

### Deep Understanding of the Error

The error trace reveals:
1. **Location**: `.next/server/supabase.js:1:14` - A compiled server-side bundle
2. **Context**: "Collecting page data" phase for `/admin/security/dashboard`
3. **Root Cause**: `self` global is undefined in Node.js environment
4. **Impact**: Build failure preventing production deployment

### Research & Exploration

After examining the provided files, I've identified several key issues:

1. **Environment Mismatch**: The Supabase client is being used in server-side code during build
2. **Component Architecture**: Client components are being processed in server context
3. **Data Fetching Pattern**: Improper separation of client/server data fetching
4. **Type Safety Issues**: Multiple `any` types and missing dependencies

### Solution Exploration

I've identified three potential approaches:

**Approach A**: Fix Supabase client configuration with proper environment checks
**Approach B**: Restructure components to ensure proper client/server separation
**Approach C**: Implement dynamic imports and lazy loading for client-side code

**Recommended Approach**: Combination of A and B for optimal results

### Risk Assessment

- **High Risk**: Build failure preventing deployment
- **Medium Risk**: Runtime errors in production
- **Low Risk**: TypeScript warnings (non-blocking)

### Execution Plan

1. **Phase 1**: Fix critical Supabase client configuration
2. **Phase 2**: Update component architecture
3. **Phase 3**: Address TypeScript warnings
4. **Phase 4**: Validate and test

## Phase 2: Implementation

### Step 1: Fix Supabase Client Configuration

The primary issue is that the Supabase client is being used in server-side code. Let's create proper environment-specific clients:

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const createClient = () => {
  // Ensure we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error('Supabase client should only be used in client components');
  }
  
  return createClientComponentClient<Database>()
}
```

```typescript
// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = () => {
  return createServerComponentClient<Database>({
    cookies
  })
}
```

### Step 2: Update Admin Dashboard Page

The admin dashboard needs to be properly structured for client-side rendering:

```typescript
// app/admin/security/dashboard/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/data/card';
import { Alert } from '@/components/feedback/alert';

// Define proper types
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

  const checkAdminAccess = useCallback(async () => {
    try {
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
        .maybeSingle();

      if (!userData || userData.role !== 'admin') {
        router.push('/patient');
        return;
      }

      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check admin access';
      setError(errorMessage);
      setLoading(false);
    }
  }, [router]);

  const loadSecurityData = useCallback(async () => {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load security data';
      setError(errorMessage);
    }
  }, [timeRange]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    if (!loading) {
      loadSecurityData();
    }
  }, [timeRange, loadSecurityData, loading]);

  // ... rest of the component with proper error handling
}
```

### Step 3: Fix Other Affected Files

```typescript
// app/auth/setup-2fa/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/forms/input';
import { Alert } from '@/components/feedback/alert';
import { Card } from '@/components/data/card';

interface User {
  id: string;
  email: string;
}

export default function Setup2FAPage() {
  const router = useRouter();
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

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

  const setupTOTP = async () => {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to setup 2FA';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component with proper error handling
}
```

```typescript
// app/patient/security/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
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

  const loadSecurityData = useCallback(async () => {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load security data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  // ... rest of the component with proper error handling
}
```

### Step 4: Fix TypeScript Issues in Appointment Booking

```typescript
// app/patient/appointments/book/page.tsx
// Define proper types
interface DoctorData {
  id: string;
  user_id: string;
  specialty_id: string;
  users: {
    full_name: string;
  };
}

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
      const doctorsWithNames = docData.map((d: DoctorData) => ({
        id: d.id,
        full_name: d.users?.full_name || 'Unknown',
        specialty_id: d.specialty_id,
      }));
      setDoctors(doctorsWithNames);
      setFilteredDoctors(doctorsWithNames);
    }
  } catch {
    // Error loading data
  }
}
```

## Phase 3: Validation & Refinement

### Testing Procedure

1. Clear build cache:
   ```bash
   rm -rf .next/
   ```

2. Run build:
   ```bash
   npm run build
   ```

3. Verify successful compilation

4. Test affected pages in development:
   ```bash
   npm run dev
   ```

### Additional Fixes for Remaining Warnings

```typescript
// Fix empty interfaces in alert.tsx
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

// Fix accessibility issues in date-picker.tsx
<input
  role="combobox"
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  // ... other props
/>

// Fix button aria-selected
<button
  role="option"
  aria-selected={isSelected}
  // ... other props
/>
```

## Phase 4: Delivery & Knowledge Transfer

### Solution Summary

1. **Root Cause**: Supabase client accessing browser globals in server environment
2. **Primary Fix**: Environment-specific client configuration
3. **Secondary Fixes**: Proper TypeScript types and React hook dependencies
4. **Validation**: Build process completion and runtime testing

### Future Recommendations

1. Implement strict environment checks for all client-side libraries
2. Create a comprehensive type definition file for the project
3. Set up ESLint rules to prevent similar issues
4. Consider implementing a build-time environment validation

### Lessons Learned

1. Always verify environment compatibility when using client-side libraries
2. Proper error handling prevents build failures
3. TypeScript strict mode catches potential runtime issues
4. Component architecture must consider server/client boundaries

The build error should now be resolved with these changes. The key was ensuring proper environment separation between client and server code, particularly for Supabase client usage.

