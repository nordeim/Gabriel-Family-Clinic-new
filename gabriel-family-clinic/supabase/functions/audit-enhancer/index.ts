// Audit Enhancer Edge Function
// Enriches audit logs with contextual data and healthcare-specific tracking

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
        const { action, data } = await req.json();
        
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

        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabase = createClient(supabaseUrl, supabaseKey);

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: { message: 'Invalid authorization token' } }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        switch (action) {
            case 'log_enhanced':
                return await logEnhanced(supabase, user.id, data, req, corsHeaders);
            
            case 'log_medical_access':
                return await logMedicalAccess(supabase, user.id, data, req, corsHeaders);
            
            case 'get_audit_trail':
                return await getAuditTrail(supabase, data, corsHeaders);
            
            case 'get_user_activity':
                return await getUserActivity(supabase, data, corsHeaders);
            
            case 'export_audit_logs':
                return await exportAuditLogs(supabase, data, corsHeaders);
            
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

// Log event with enhanced context
async function logEnhanced(supabase, userId, eventData, req, corsHeaders) {
    const {
        event_type,
        action,
        resource_type,
        resource_id,
        success = true,
        failure_reason = null,
        additional_context = {}
    } = eventData;

    // Extract contextual information
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Get user details for enrichment
    const { data: userData } = await supabase
        .from('users')
        .select('role, full_name, email, department')
        .eq('id', userId)
        .single();

    // Calculate risk score for the action
    const riskScore = calculateRiskScore(event_type, action, resource_type, success);

    // Get geolocation from IP (simplified - in production use GeoIP service)
    const location = getLocationFromIP(ipAddress);

    // Enrich metadata with contextual information
    const enrichedMetadata = {
        ...additional_context,
        user_agent: userAgent,
        browser: parseBrowser(userAgent),
        os: parseOS(userAgent),
        device_type: parseDeviceType(userAgent),
        location,
        timestamp_utc: new Date().toISOString(),
        timestamp_singapore: new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
        session_context: {
            day_of_week: new Date().getDay(),
            hour: new Date().getHours(),
            is_business_hours: isBusinessHours()
        }
    };

    // Create enhanced audit log entry
    const { data: auditLog, error } = await supabase
        .from('security_audit_log')
        .insert({
            event_type,
            user_id: userId,
            user_role: userData?.role,
            user_email: userData?.email,
            user_department: userData?.department,
            ip_address: ipAddress,
            user_agent: userAgent,
            resource_type,
            resource_id,
            action,
            success,
            failure_reason,
            risk_score: riskScore,
            metadata: enrichedMetadata
        })
        .select()
        .single();

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to create audit log', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Create alert if high-risk action
    if (riskScore >= 70) {
        await createSecurityAlert(supabase, userId, auditLog, riskScore);
    }

    return new Response(
        JSON.stringify({
            data: {
                audit_logged: true,
                audit_id: auditLog.id,
                risk_score: riskScore,
                alert_created: riskScore >= 70,
                message: 'Event logged with enhanced context'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Log medical record access (healthcare-specific)
async function logMedicalAccess(supabase, userId, eventData, req, corsHeaders) {
    const {
        patient_id,
        record_type,
        record_id,
        access_purpose,
        record_section,
        data_fields_accessed
    } = eventData;

    // Get patient information
    const { data: patientData } = await supabase
        .from('patients')
        .select('full_name, nric')
        .eq('id', patient_id)
        .single();

    // Get user information
    const { data: userData } = await supabase
        .from('users')
        .select('role, full_name, department')
        .eq('id', userId)
        .single();

    // Check if user has treating relationship
    const { data: relationship } = await supabase
        .from('doctor_patient_relationships')
        .select('relationship_type, established_date')
        .eq('doctor_id', userId)
        .eq('patient_id', patient_id)
        .eq('is_active', true)
        .single();

    const hasRelationship = !!relationship;

    // Singapore healthcare requirement: Track all medical record access
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const { data: accessLog, error } = await supabase
        .from('medical_record_access_log')
        .insert({
            user_id: userId,
            user_role: userData?.role,
            user_name: userData?.full_name,
            patient_id,
            patient_name: patientData?.full_name,
            patient_nric: patientData?.nric,
            record_type,
            record_id,
            record_section,
            data_fields_accessed,
            access_purpose,
            has_treating_relationship: hasRelationship,
            relationship_type: relationship?.relationship_type,
            ip_address: ipAddress,
            user_agent: userAgent,
            access_timestamp: new Date().toISOString(),
            compliance_notes: !hasRelationship ? 'Access without treating relationship - requires justification' : null
        })
        .select()
        .single();

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to log medical access', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Also log in security audit log
    await supabase
        .from('security_audit_log')
        .insert({
            event_type: 'medical_record_access',
            user_id: userId,
            user_role: userData?.role,
            action: `access_${record_type}`,
            resource_type: 'medical_record',
            resource_id: record_id,
            ip_address: ipAddress,
            success: true,
            metadata: {
                patient_id,
                record_type,
                has_treating_relationship: hasRelationship,
                access_purpose,
                compliance_framework: 'Singapore Healthcare Act'
            }
        });

    // Alert if access without relationship
    if (!hasRelationship && userData?.role !== 'admin') {
        await supabase
            .from('security_incidents')
            .insert({
                incident_type: 'unauthorized_access',
                severity: 'medium',
                status: 'open',
                title: `Medical record access without treating relationship`,
                description: `User ${userData?.full_name} (${userData?.role}) accessed patient ${patientData?.full_name}'s medical records without an established treating relationship`,
                affected_users: [patient_id],
                detection_method: 'automated_audit',
                indicators: ['no_treating_relationship', 'medical_record_access']
            });
    }

    return new Response(
        JSON.stringify({
            data: {
                access_logged: true,
                access_id: accessLog.id,
                has_treating_relationship: hasRelationship,
                compliance_warning: !hasRelationship,
                message: 'Medical record access logged'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Get audit trail for specific resource
async function getAuditTrail(supabase, requestData, corsHeaders) {
    const { resource_type, resource_id, time_range = '30d' } = requestData;

    const days = parseInt(time_range);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: logs, error } = await supabase
        .from('security_audit_log')
        .select(`
            *,
            user:users(full_name, email, role)
        `)
        .eq('resource_type', resource_type)
        .eq('resource_id', resource_id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to fetch audit trail', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Generate timeline
    const timeline = logs.map(log => ({
        timestamp: log.created_at,
        event: log.event_type,
        action: log.action,
        user: log.user?.full_name || 'Unknown',
        user_role: log.user?.role,
        success: log.success,
        details: log.metadata
    }));

    // Calculate statistics
    const stats = {
        total_events: logs.length,
        successful_events: logs.filter(l => l.success).length,
        failed_events: logs.filter(l => !l.success).length,
        unique_users: new Set(logs.map(l => l.user_id)).size,
        high_risk_events: logs.filter(l => l.risk_score >= 70).length
    };

    return new Response(
        JSON.stringify({
            data: {
                resource_type,
                resource_id,
                time_range,
                stats,
                timeline,
                raw_logs: logs
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Get user activity summary
async function getUserActivity(supabase, requestData, corsHeaders) {
    const { user_id, time_range = '7d' } = requestData;

    const days = parseInt(time_range);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: logs } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', user_id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

    // Analyze activity patterns
    const activityByHour = Array(24).fill(0);
    const activityByDay = Array(7).fill(0);
    const actionTypes = {};
    const resourcesAccessed = new Set();

    logs?.forEach(log => {
        const date = new Date(log.created_at);
        activityByHour[date.getHours()]++;
        activityByDay[date.getDay()]++;
        
        actionTypes[log.action] = (actionTypes[log.action] || 0) + 1;
        
        if (log.resource_id) {
            resourcesAccessed.add(`${log.resource_type}:${log.resource_id}`);
        }
    });

    // Calculate risk indicators
    const riskIndicators = [];
    
    // Check for off-hours activity
    const offHoursActivity = logs?.filter(log => {
        const hour = new Date(log.created_at).getHours();
        return hour < 8 || hour > 22;
    }).length || 0;

    if (offHoursActivity > 5) {
        riskIndicators.push('High off-hours activity');
    }

    // Check for failed attempts
    const failedAttempts = logs?.filter(l => !l.success).length || 0;
    if (failedAttempts > 10) {
        riskIndicators.push('High number of failed attempts');
    }

    return new Response(
        JSON.stringify({
            data: {
                user_id,
                time_range,
                total_events: logs?.length || 0,
                activity_by_hour: activityByHour,
                activity_by_day: activityByDay,
                action_types: actionTypes,
                resources_accessed_count: resourcesAccessed.size,
                off_hours_activity: offHoursActivity,
                failed_attempts: failedAttempts,
                risk_indicators: riskIndicators,
                recent_activity: logs?.slice(0, 10)
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Export audit logs for compliance
async function exportAuditLogs(supabase, requestData, corsHeaders) {
    const { start_date, end_date, event_types, export_format = 'json' } = requestData;

    let query = supabase
        .from('security_audit_log')
        .select(`
            *,
            user:users(full_name, email, role, department)
        `);

    if (start_date) {
        query = query.gte('created_at', start_date);
    }

    if (end_date) {
        query = query.lte('created_at', end_date);
    }

    if (event_types && event_types.length > 0) {
        query = query.in('event_type', event_types);
    }

    const { data: logs, error } = await query.order('created_at', { ascending: false });

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to export audit logs', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Log the export action
    await supabase
        .from('security_audit_log')
        .insert({
            event_type: 'audit_export',
            action: 'export_audit_logs',
            success: true,
            metadata: {
                start_date,
                end_date,
                record_count: logs.length,
                export_format
            }
        });

    return new Response(
        JSON.stringify({
            data: {
                export_date: new Date().toISOString(),
                record_count: logs.length,
                date_range: { start_date, end_date },
                logs
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Helper functions
function calculateRiskScore(eventType, action, resourceType, success) {
    let score = 0;

    // Base risk by event type
    const eventRisks = {
        'login': 5,
        'data_access': 15,
        'data_export': 40,
        'user_creation': 25,
        'permission_change': 35,
        'medical_record_access': 20,
        'prescription_create': 30,
        'data_deletion': 45
    };

    score += eventRisks[eventType] || 10;

    // Failed attempts increase risk
    if (!success) {
        score += 20;
    }

    // Sensitive resources
    if (resourceType === 'medical_record' || resourceType === 'prescription') {
        score += 15;
    }

    return Math.min(score, 100);
}

function getLocationFromIP(ip) {
    // Simplified - in production use proper GeoIP service
    if (ip.startsWith('192.168') || ip.startsWith('10.') || ip === 'unknown') {
        return { country: 'SG', city: 'Singapore', region: 'Local Network' };
    }
    return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
}

function parseBrowser(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
}

function parseOS(userAgent) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
}

function parseDeviceType(userAgent) {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iOS')) {
        return 'Mobile';
    }
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        return 'Tablet';
    }
    return 'Desktop';
}

function isBusinessHours() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Singapore business hours: Mon-Fri 9 AM - 6 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
}

async function createSecurityAlert(supabase, userId, auditLog, riskScore) {
    await supabase
        .from('security_incidents')
        .insert({
            incident_type: 'high_risk_action',
            severity: riskScore >= 85 ? 'high' : 'medium',
            status: 'open',
            title: `High-risk action detected: ${auditLog.action}`,
            description: `User performed high-risk action with risk score ${riskScore}`,
            affected_users: [userId],
            detection_method: 'automated_audit',
            indicators: ['high_risk_score', auditLog.event_type]
        });
}
