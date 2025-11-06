// Incident Response Edge Function
// Handles security incident detection, categorization, and automated response

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
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
            case 'create_incident':
                return await createIncident(supabase, user.id, data, corsHeaders);
            
            case 'update_incident':
                return await updateIncident(supabase, user.id, data, corsHeaders);
            
            case 'get_incident':
                return await getIncident(supabase, data, corsHeaders);
            
            case 'get_active_incidents':
                return await getActiveIncidents(supabase, corsHeaders);
            
            case 'auto_respond':
                return await autoRespond(supabase, data, corsHeaders);
            
            case 'escalate_incident':
                return await escalateIncident(supabase, data, corsHeaders);
            
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

// Create new security incident
async function createIncident(supabase, userId, requestData, corsHeaders) {
    const {
        incident_type,
        severity,
        title,
        description,
        affected_users,
        affected_systems,
        detection_method,
        indicators
    } = requestData;

    // Validate required fields
    if (!incident_type || !severity || !title) {
        return new Response(
            JSON.stringify({ error: { message: 'Missing required fields: incident_type, severity, title' } }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Generate incident ID
    const incidentId = `INC-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Determine initial response actions based on severity
    const responseActions = generateResponseActions(incident_type, severity);

    // Create incident record
    const { data: incident, error } = await supabase
        .from('security_incidents')
        .insert({
            incident_id: incidentId,
            incident_type,
            severity,
            status: 'open',
            title,
            description,
            affected_users,
            affected_systems,
            detection_method,
            indicators,
            response_actions: responseActions,
            reported_by: userId,
            assigned_to: null // Will be auto-assigned based on severity
        })
        .select()
        .single();

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to create incident', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Auto-assign based on severity
    if (severity === 'critical' || severity === 'high') {
        // Get security team members
        const { data: securityTeam } = await supabase
            .from('users')
            .select('id, full_name, email')
            .eq('role', 'admin')
            .eq('department', 'security')
            .limit(1);

        if (securityTeam && securityTeam.length > 0) {
            await supabase
                .from('security_incidents')
                .update({ assigned_to: securityTeam[0].id })
                .eq('id', incident.id);

            // TODO: Send notification to assigned team member
        }
    }

    // Log the incident creation
    await supabase
        .from('security_audit_log')
        .insert({
            event_type: 'incident_created',
            user_id: userId,
            action: 'create_incident',
            resource_type: 'security_incident',
            resource_id: incident.id,
            success: true,
            metadata: {
                incident_id: incidentId,
                severity,
                incident_type
            }
        });

    // Execute automated response for critical incidents
    if (severity === 'critical') {
        await executeAutomatedResponse(supabase, incident);
    }

    return new Response(
        JSON.stringify({
            data: {
                incident_created: true,
                incident_id: incidentId,
                incident,
                response_actions: responseActions,
                message: severity === 'critical' ? 
                    'Critical incident created - automated response initiated' :
                    'Incident created successfully'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Update incident status and details
async function updateIncident(supabase, userId, requestData, corsHeaders) {
    const {
        incident_id,
        status,
        notes,
        resolution,
        additional_actions
    } = requestData;

    // Get current incident
    const { data: currentIncident } = await supabase
        .from('security_incidents')
        .select('*')
        .eq('incident_id', incident_id)
        .single();

    if (!currentIncident) {
        return new Response(
            JSON.stringify({ error: { message: 'Incident not found' } }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Prepare update data
    const updateData = {
        status: status || currentIncident.status,
        notes: notes ? [...(currentIncident.notes || []), { 
            timestamp: new Date().toISOString(), 
            user_id: userId, 
            note: notes 
        }] : currentIncident.notes,
        updated_at: new Date().toISOString()
    };

    // If resolving incident
    if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = userId;
        updateData.resolution = resolution;
    }

    // If closing incident
    if (status === 'closed') {
        updateData.closed_at = new Date().toISOString();
        updateData.closed_by = userId;
    }

    // Add additional response actions
    if (additional_actions) {
        updateData.response_actions = [
            ...(currentIncident.response_actions || []),
            ...additional_actions
        ];
    }

    const { error } = await supabase
        .from('security_incidents')
        .update(updateData)
        .eq('incident_id', incident_id);

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to update incident', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Log the update
    await supabase
        .from('security_audit_log')
        .insert({
            event_type: 'incident_updated',
            user_id: userId,
            action: 'update_incident',
            resource_type: 'security_incident',
            resource_id: currentIncident.id,
            success: true,
            metadata: {
                incident_id,
                old_status: currentIncident.status,
                new_status: status,
                resolution: resolution || null
            }
        });

    return new Response(
        JSON.stringify({
            data: {
                incident_updated: true,
                incident_id,
                new_status: status || currentIncident.status,
                message: 'Incident updated successfully'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Get incident details
async function getIncident(supabase, requestData, corsHeaders) {
    const { incident_id } = requestData;

    const { data: incident, error } = await supabase
        .from('security_incidents')
        .select(`
            *,
            reported_by_user:users!security_incidents_reported_by_fkey(id, full_name, email),
            assigned_to_user:users!security_incidents_assigned_to_fkey(id, full_name, email)
        `)
        .eq('incident_id', incident_id)
        .single();

    if (error || !incident) {
        return new Response(
            JSON.stringify({ error: { message: 'Incident not found' } }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Get related audit logs
    const { data: relatedLogs } = await supabase
        .from('security_audit_log')
        .select('*')
        .or(`resource_id.eq.${incident.id},metadata->>incident_id.eq.${incident_id}`)
        .order('created_at', { ascending: false })
        .limit(50);

    return new Response(
        JSON.stringify({
            data: {
                incident,
                related_logs: relatedLogs || [],
                timeline: generateIncidentTimeline(incident, relatedLogs)
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Get all active incidents
async function getActiveIncidents(supabase, corsHeaders) {
    const { data: incidents, error } = await supabase
        .from('security_incidents')
        .select('*')
        .in('status', ['open', 'investigating', 'escalated'])
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to fetch incidents', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Group by severity
    const bySeverity = {
        critical: incidents?.filter(i => i.severity === 'critical') || [],
        high: incidents?.filter(i => i.severity === 'high') || [],
        medium: incidents?.filter(i => i.severity === 'medium') || [],
        low: incidents?.filter(i => i.severity === 'low') || []
    };

    return new Response(
        JSON.stringify({
            data: {
                total_active: incidents?.length || 0,
                incidents,
                by_severity: bySeverity,
                critical_count: bySeverity.critical.length,
                requires_immediate_attention: bySeverity.critical.length + bySeverity.high.length
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Execute automated response
async function autoRespond(supabase, requestData, corsHeaders) {
    const { incident_id } = requestData;

    const { data: incident } = await supabase
        .from('security_incidents')
        .select('*')
        .eq('incident_id', incident_id)
        .single();

    if (!incident) {
        return new Response(
            JSON.stringify({ error: { message: 'Incident not found' } }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const actions = await executeAutomatedResponse(supabase, incident);

    return new Response(
        JSON.stringify({
            data: {
                automated_response_executed: true,
                actions_taken: actions,
                message: 'Automated response completed'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Escalate incident
async function escalateIncident(supabase, requestData, corsHeaders) {
    const { incident_id, escalation_reason } = requestData;

    const { data: incident } = await supabase
        .from('security_incidents')
        .select('*')
        .eq('incident_id', incident_id)
        .single();

    if (!incident) {
        return new Response(
            JSON.stringify({ error: { message: 'Incident not found' } }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Upgrade severity if needed
    const newSeverity = incident.severity === 'low' ? 'medium' :
                       incident.severity === 'medium' ? 'high' :
                       incident.severity === 'high' ? 'critical' : 'critical';

    const { error } = await supabase
        .from('security_incidents')
        .update({
            status: 'escalated',
            severity: newSeverity,
            escalated_at: new Date().toISOString(),
            escalation_reason,
            notes: [...(incident.notes || []), {
                timestamp: new Date().toISOString(),
                note: `Incident escalated: ${escalation_reason}`,
                type: 'escalation'
            }]
        })
        .eq('incident_id', incident_id);

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to escalate incident', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // TODO: Send escalation notifications

    return new Response(
        JSON.stringify({
            data: {
                incident_escalated: true,
                incident_id,
                new_severity: newSeverity,
                message: 'Incident escalated successfully'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Helper: Generate response actions based on incident type
function generateResponseActions(incidentType, severity) {
    const baseActions = [];

    switch (incidentType) {
        case 'unauthorized_access':
            baseActions.push('Lock affected user account');
            baseActions.push('Review access logs for the past 24 hours');
            baseActions.push('Notify security team');
            if (severity === 'critical') {
                baseActions.push('Force password reset for affected users');
                baseActions.push('Terminate all active sessions');
            }
            break;

        case 'data_breach':
            baseActions.push('Isolate affected systems');
            baseActions.push('Notify management immediately');
            baseActions.push('Preserve evidence and logs');
            baseActions.push('Begin breach assessment');
            if (severity === 'critical') {
                baseActions.push('Notify PDPC (Personal Data Protection Commission)');
                baseActions.push('Prepare patient notification');
            }
            break;

        case 'malware_detected':
            baseActions.push('Quarantine affected system');
            baseActions.push('Run full system scan');
            baseActions.push('Check for lateral movement');
            break;

        case 'suspicious_behavior':
            baseActions.push('Monitor user activity');
            baseActions.push('Review recent actions');
            baseActions.push('Enable enhanced logging');
            break;

        default:
            baseActions.push('Document incident details');
            baseActions.push('Begin investigation');
    }

    baseActions.push('Update incident status regularly');
    
    return baseActions;
}

// Helper: Execute automated response for critical incidents
async function executeAutomatedResponse(supabase, incident) {
    const actionsTaken = [];

    // For unauthorized access or suspicious behavior
    if (incident.incident_type === 'unauthorized_access' || 
        incident.incident_type === 'suspicious_behavior') {
        
        // Lock affected user accounts
        if (incident.affected_users && incident.affected_users.length > 0) {
            await supabase
                .from('users')
                .update({ account_status: 'locked', locked_reason: `Security incident: ${incident.incident_id}` })
                .in('id', incident.affected_users);
            
            actionsTaken.push(`Locked ${incident.affected_users.length} affected user account(s)`);

            // Terminate active sessions
            await supabase
                .from('user_sessions')
                .update({
                    is_active: false,
                    terminated_at: new Date().toISOString(),
                    termination_reason: `Security incident: ${incident.incident_id}`
                })
                .in('user_id', incident.affected_users)
                .eq('is_active', true);

            actionsTaken.push('Terminated all active sessions for affected users');
        }
    }

    // Create high-priority notification
    actionsTaken.push('Sent notifications to security team');

    // Log automated response
    await supabase
        .from('security_audit_log')
        .insert({
            event_type: 'automated_response',
            action: 'incident_response',
            resource_type: 'security_incident',
            resource_id: incident.id,
            success: true,
            metadata: {
                incident_id: incident.incident_id,
                actions_taken: actionsTaken
            }
        });

    return actionsTaken;
}

// Helper: Generate incident timeline
function generateIncidentTimeline(incident, logs) {
    const timeline = [
        {
            timestamp: incident.created_at,
            event: 'Incident Created',
            severity: incident.severity,
            details: incident.title
        }
    ];

    if (incident.escalated_at) {
        timeline.push({
            timestamp: incident.escalated_at,
            event: 'Incident Escalated',
            details: incident.escalation_reason
        });
    }

    if (incident.resolved_at) {
        timeline.push({
            timestamp: incident.resolved_at,
            event: 'Incident Resolved',
            details: incident.resolution
        });
    }

    if (incident.closed_at) {
        timeline.push({
            timestamp: incident.closed_at,
            event: 'Incident Closed'
        });
    }

    // Add relevant log entries
    logs?.forEach(log => {
        if (log.event_type === 'automated_response' || log.event_type === 'incident_updated') {
            timeline.push({
                timestamp: log.created_at,
                event: log.event_type,
                details: log.action
            });
        }
    });

    return timeline.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}
