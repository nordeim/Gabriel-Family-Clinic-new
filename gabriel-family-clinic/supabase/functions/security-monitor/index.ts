// Security Monitor Edge Function
// Monitors security events and detects anomalies in real-time

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { action, event_data } = await req.json();
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration');
        }

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: { message: 'Missing authorization header' } }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Import Supabase client (using service role for admin operations)
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabase = createClient(supabaseUrl, supabaseKey);

        switch (action) {
            case 'log_security_event':
                return await logSecurityEvent(supabase, event_data, corsHeaders);
            
            case 'detect_anomaly':
                return await detectAnomaly(supabase, event_data, corsHeaders);
            
            case 'get_security_metrics':
                return await getSecurityMetrics(supabase, event_data, corsHeaders);
            
            case 'check_risk_score':
                return await checkRiskScore(supabase, event_data, corsHeaders);
            
            default:
                return new Response(
                    JSON.stringify({ error: { message: 'Invalid action specified' } }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
        }
    } catch (error) {
        return new Response(
            JSON.stringify({ error: { message: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

// Log security event
async function logSecurityEvent(supabase, eventData, corsHeaders) {
    const { event_type, user_id, action, success, metadata } = eventData;

    const { data, error } = await supabase
        .from('security_audit_log')
        .insert({
            event_type,
            user_id,
            user_role: metadata?.user_role,
            ip_address: metadata?.ip_address,
            user_agent: metadata?.user_agent,
            resource_type: metadata?.resource_type,
            resource_id: metadata?.resource_id,
            action,
            success,
            failure_reason: metadata?.failure_reason,
            risk_score: metadata?.risk_score || 0,
            metadata: metadata
        })
        .select()
        .single();

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to log security event', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
        JSON.stringify({ data: { event_logged: true, event_id: data.id } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Detect anomalies based on user behavior
async function detectAnomaly(supabase, eventData, corsHeaders) {
    const { user_id, current_behavior } = eventData;

    // Get user's behavior profile
    const { data: profile, error: profileError } = await supabase
        .from('user_behavior_profiles')
        .select('*')
        .eq('user_id', user_id)
        .single();

    if (profileError || !profile) {
        // No profile yet, return no anomaly
        return new Response(
            JSON.stringify({ data: { is_anomaly: false, risk_score: 0, reason: 'No behavior profile established' } }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    let riskScore = 0;
    const anomalies = [];

    // Check login time anomaly
    const currentHour = new Date().getHours();
    if (!profile.typical_login_times.includes(currentHour)) {
        riskScore += 20;
        anomalies.push('Unusual login time');
    }

    // Check IP address anomaly
    if (current_behavior.ip_address && !profile.typical_ip_addresses.includes(current_behavior.ip_address)) {
        riskScore += 30;
        anomalies.push('New IP address');
    }

    // Check device anomaly
    if (current_behavior.device && !profile.typical_devices.includes(current_behavior.device)) {
        riskScore += 25;
        anomalies.push('New device');
    }

    const isAnomaly = riskScore >= profile.anomaly_threshold;

    // If anomaly detected, create security incident if risk is high
    if (isAnomaly && riskScore >= 70) {
        await supabase
            .from('security_incidents')
            .insert({
                incident_type: 'suspicious_behavior',
                severity: riskScore >= 85 ? 'high' : 'medium',
                status: 'open',
                title: `Suspicious login activity for user ${user_id}`,
                description: `Anomalies detected: ${anomalies.join(', ')}. Risk score: ${riskScore}`,
                affected_users: [user_id],
                detection_method: 'behavioral_analysis'
            });
    }

    return new Response(
        JSON.stringify({
            data: {
                is_anomaly: isAnomaly,
                risk_score: riskScore,
                anomalies,
                action_required: riskScore >= 85
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Get security metrics for dashboard
async function getSecurityMetrics(supabase, eventData, corsHeaders) {
    const { time_range = '24h' } = eventData;
    
    const now = new Date();
    const startTime = new Date(now.getTime() - (time_range === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000));

    // Get failed login attempts
    const { count: failedLogins } = await supabase
        .from('failed_login_attempts')
        .select('*', { count: 'exact', head: true })
        .gte('attempted_at', startTime.toISOString());

    // Get active security incidents
    const { data: activeIncidents } = await supabase
        .from('security_incidents')
        .select('severity')
        .in('status', ['open', 'investigating']);

    // Get recent audit events
    const { count: auditEvents } = await supabase
        .from('security_audit_log')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startTime.toISOString());

    // Get active sessions
    const { count: activeSessions } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

    const incidentsBySeverity = {
        critical: activeIncidents?.filter(i => i.severity === 'critical').length || 0,
        high: activeIncidents?.filter(i => i.severity === 'high').length || 0,
        medium: activeIncidents?.filter(i => i.severity === 'medium').length || 0,
        low: activeIncidents?.filter(i => i.severity === 'low').length || 0
    };

    return new Response(
        JSON.stringify({
            data: {
                failed_logins: failedLogins || 0,
                active_incidents: activeIncidents?.length || 0,
                incidents_by_severity: incidentsBySeverity,
                audit_events: auditEvents || 0,
                active_sessions: activeSessions || 0,
                time_range
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Check risk score for current action
async function checkRiskScore(supabase, eventData, corsHeaders) {
    const { user_id, action_type, context } = eventData;

    let riskScore = 0;
    const riskFactors = [];

    // Base risk by action type
    const actionRisks = {
        'export_data': 40,
        'delete_record': 35,
        'modify_prescription': 30,
        'access_medical_record': 20,
        'view_appointment': 10
    };
    
    riskScore += actionRisks[action_type] || 0;
    if (actionRisks[action_type]) {
        riskFactors.push(`Action type: ${action_type}`);
    }

    // Check time of day (off-hours = higher risk)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
        riskScore += 15;
        riskFactors.push('Off-hours access');
    }

    // Check recent failed logins
    const { count: recentFailures } = await supabase
        .from('failed_login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('email', context.user_email)
        .gte('attempted_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (recentFailures && recentFailures > 0) {
        riskScore += recentFailures * 10;
        riskFactors.push(`Recent failed logins: ${recentFailures}`);
    }

    // Get risk thresholds from settings
    const { data: settings } = await supabase
        .from('security_settings')
        .select('setting_value')
        .eq('setting_key', 'risk_thresholds')
        .single();

    const thresholds = settings?.setting_value || { low: 30, medium: 60, high: 80 };
    
    let riskLevel = 'low';
    if (riskScore >= thresholds.high) riskLevel = 'high';
    else if (riskScore >= thresholds.medium) riskLevel = 'medium';

    return new Response(
        JSON.stringify({
            data: {
                risk_score: riskScore,
                risk_level: riskLevel,
                risk_factors: riskFactors,
                allow_action: riskScore < 80,
                require_2fa: riskScore >= 60
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}
