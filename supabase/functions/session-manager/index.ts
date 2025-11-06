// Session Management Edge Function
// Handles active session tracking, monitoring, and termination

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
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
            case 'create_session':
                return await createSession(supabase, user.id, data, corsHeaders);
            
            case 'get_active_sessions':
                return await getActiveSessions(supabase, user.id, corsHeaders);
            
            case 'terminate_session':
                return await terminateSession(supabase, user.id, data, corsHeaders);
            
            case 'terminate_all_other_sessions':
                return await terminateAllOtherSessions(supabase, user.id, data, corsHeaders);
            
            case 'update_activity':
                return await updateSessionActivity(supabase, data, corsHeaders);
            
            case 'check_session_limit':
                return await checkSessionLimit(supabase, user.id, corsHeaders);
            
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

// Create new session
async function createSession(supabase, userId, sessionData, corsHeaders) {
    const { session_token, ip_address, user_agent, device_fingerprint } = sessionData;

    // Get user role for session timeout
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (!userData) {
        return new Response(
            JSON.stringify({ error: { message: 'User not found' } }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Get session timeout from settings
    const { data: timeoutSettings } = await supabase
        .from('security_settings')
        .select('setting_value')
        .eq('setting_key', 'session_timeout')
        .single();

    const timeouts = timeoutSettings?.setting_value || { patient_minutes: 30, doctor_minutes: 60, admin_minutes: 120 };
    const timeoutMinutes = timeouts[`${userData.role}_minutes`] || 30;
    
    const expiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000).toISOString();

    // Check concurrent session limit
    const { data: maxSessions } = await supabase
        .from('security_settings')
        .select('setting_value')
        .eq('setting_key', 'max_concurrent_sessions')
        .single();

    const limits = maxSessions?.setting_value || { patient: 3, doctor: 2, admin: 2, staff: 3 };
    const maxConcurrent = limits[userData.role] || 3;

    // Count active sessions
    const { count: activeCount } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

    if (activeCount >= maxConcurrent) {
        // Terminate oldest session
        const { data: oldestSession } = await supabase
            .from('user_sessions')
            .select('id')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('last_activity_at', { ascending: true })
            .limit(1)
            .single();

        if (oldestSession) {
            await supabase
                .from('user_sessions')
                .update({
                    is_active: false,
                    terminated_at: new Date().toISOString(),
                    termination_reason: 'Session limit exceeded'
                })
                .eq('id', oldestSession.id);
        }
    }

    // Create new session
    const { data: session, error } = await supabase
        .from('user_sessions')
        .insert({
            user_id: userId,
            session_token,
            ip_address,
            user_agent,
            device_fingerprint,
            expires_at: expiresAt
        })
        .select()
        .single();

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to create session', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
        JSON.stringify({ data: { session_created: true, session_id: session.id, expires_at: expiresAt } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Get active sessions for user
async function getActiveSessions(supabase, userId, corsHeaders) {
    const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false });

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to fetch sessions', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Format sessions for display
    const formattedSessions = sessions.map(session => ({
        id: session.id,
        ip_address: session.ip_address,
        user_agent: parseUserAgent(session.user_agent),
        location: session.location,
        last_activity: session.last_activity_at,
        created_at: session.created_at,
        expires_at: session.expires_at,
        is_current: false // Client should set this based on current session token
    }));

    return new Response(
        JSON.stringify({ data: { sessions: formattedSessions } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Terminate specific session
async function terminateSession(supabase, userId, requestData, corsHeaders) {
    const { session_id } = requestData;

    const { error } = await supabase
        .from('user_sessions')
        .update({
            is_active: false,
            terminated_at: new Date().toISOString(),
            termination_reason: 'User requested termination'
        })
        .eq('id', session_id)
        .eq('user_id', userId);

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to terminate session', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
        JSON.stringify({ data: { session_terminated: true } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Terminate all other sessions (keep current one)
async function terminateAllOtherSessions(supabase, userId, requestData, corsHeaders) {
    const { current_session_id } = requestData;

    const { error } = await supabase
        .from('user_sessions')
        .update({
            is_active: false,
            terminated_at: new Date().toISOString(),
            termination_reason: 'User terminated all other sessions'
        })
        .eq('user_id', userId)
        .neq('id', current_session_id)
        .eq('is_active', true);

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to terminate sessions', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
        JSON.stringify({ data: { sessions_terminated: true } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Update session activity timestamp
async function updateSessionActivity(supabase, requestData, corsHeaders) {
    const { session_token } = requestData;

    const { error } = await supabase
        .from('user_sessions')
        .update({
            last_activity_at: new Date().toISOString()
        })
        .eq('session_token', session_token)
        .eq('is_active', true);

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to update session', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
        JSON.stringify({ data: { activity_updated: true } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Check if user is at session limit
async function checkSessionLimit(supabase, userId, corsHeaders) {
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (!userData) {
        return new Response(
            JSON.stringify({ error: { message: 'User not found' } }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const { data: maxSessions } = await supabase
        .from('security_settings')
        .select('setting_value')
        .eq('setting_key', 'max_concurrent_sessions')
        .single();

    const limits = maxSessions?.setting_value || { patient: 3, doctor: 2, admin: 2, staff: 3 };
    const maxConcurrent = limits[userData.role] || 3;

    const { count: activeCount } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

    return new Response(
        JSON.stringify({
            data: {
                active_sessions: activeCount || 0,
                max_sessions: maxConcurrent,
                at_limit: (activeCount || 0) >= maxConcurrent
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Helper function to parse user agent
function parseUserAgent(userAgent) {
    if (!userAgent) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };
    
    // Simplified user agent parsing
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) { os = 'Android'; device = 'Mobile'; }
    else if (userAgent.includes('iOS')) { os = 'iOS'; device = 'Mobile'; }

    return { browser, os, device };
}
