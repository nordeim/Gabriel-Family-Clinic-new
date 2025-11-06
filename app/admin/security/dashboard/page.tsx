'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
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
        .maybeSingle() as { data: { role: string } | null };

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
