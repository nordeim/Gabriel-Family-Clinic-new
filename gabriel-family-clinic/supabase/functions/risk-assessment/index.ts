// Risk Assessment Edge Function
// Evaluates security risk levels for user actions and access patterns

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
            case 'assess_action_risk':
                return await assessActionRisk(supabase, user.id, data, corsHeaders);
            
            case 'assess_user_risk':
                return await assessUserRisk(supabase, user.id, data, corsHeaders);
            
            case 'get_risk_factors':
                return await getRiskFactors(supabase, user.id, corsHeaders);
            
            case 'update_risk_threshold':
                return await updateRiskThreshold(supabase, data, corsHeaders);
            
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

// Assess risk for a specific action
async function assessActionRisk(supabase, userId, requestData, corsHeaders) {
    const { action_type, resource_type, resource_id, context } = requestData;

    let riskScore = 0;
    const riskFactors = [];

    // Base risk by action type
    const actionRisks = {
        'export_medical_records': 50,
        'delete_patient': 45,
        'modify_prescription': 40,
        'access_all_patients': 35,
        'change_user_role': 40,
        'download_bulk_data': 45,
        'access_medical_record': 25,
        'view_prescription': 15,
        'book_appointment': 5
    };

    const baseRisk = actionRisks[action_type] || 10;
    riskScore += baseRisk;
    riskFactors.push({ factor: 'action_type', value: action_type, risk: baseRisk });

    // Time-based risk (healthcare-specific: Singapore working hours)
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Singapore clinic hours: typically 8 AM - 10 PM
    if (hour < 8 || hour > 22) {
        riskScore += 20;
        riskFactors.push({ factor: 'off_hours', value: `${hour}:00`, risk: 20 });
    }
    
    // Weekend access to critical operations
    if ((dayOfWeek === 0 || dayOfWeek === 6) && baseRisk > 30) {
        riskScore += 10;
        riskFactors.push({ factor: 'weekend_critical_access', value: true, risk: 10 });
    }

    // Check user behavior patterns
    const { data: behaviorProfile } = await supabase
        .from('user_behavior_profiles')
        .select('typical_actions, typical_access_times')
        .eq('user_id', userId)
        .single();

    if (behaviorProfile) {
        // Unusual action for this user
        if (!behaviorProfile.typical_actions?.includes(action_type)) {
            riskScore += 15;
            riskFactors.push({ factor: 'unusual_action', value: action_type, risk: 15 });
        }

        // Unusual access time
        if (!behaviorProfile.typical_access_times?.includes(hour)) {
            riskScore += 10;
            riskFactors.push({ factor: 'unusual_time', value: hour, risk: 10 });
        }
    }

    // Check recent failed attempts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentFailures } = await supabase
        .from('security_audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('success', false)
        .gte('created_at', oneHourAgo);

    if (recentFailures && recentFailures > 0) {
        const failureRisk = Math.min(recentFailures * 5, 25);
        riskScore += failureRisk;
        riskFactors.push({ factor: 'recent_failures', value: recentFailures, risk: failureRisk });
    }

    // Check for rapid successive actions (potential automation)
    const { count: recentActions } = await supabase
        .from('security_audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString());

    if (recentActions && recentActions > 10) {
        riskScore += 20;
        riskFactors.push({ factor: 'rapid_actions', value: recentActions, risk: 20 });
    }

    // Singapore PDPA compliance: Extra scrutiny for data export
    if (action_type.includes('export') || action_type.includes('download')) {
        riskScore += 15;
        riskFactors.push({ factor: 'pdpa_sensitive', value: 'data_export', risk: 15 });
    }

    // Determine risk level
    let riskLevel = 'low';
    if (riskScore >= 80) riskLevel = 'critical';
    else if (riskScore >= 60) riskLevel = 'high';
    else if (riskScore >= 40) riskLevel = 'medium';

    // Determine required actions
    const requireMFA = riskScore >= 60;
    const requireApproval = riskScore >= 80;
    const allowAction = riskScore < 90;

    // Log the risk assessment
    await supabase
        .from('security_audit_log')
        .insert({
            event_type: 'risk_assessment',
            user_id: userId,
            action: action_type,
            resource_type,
            resource_id,
            risk_score: riskScore,
            success: true,
            metadata: {
                risk_level: riskLevel,
                risk_factors: riskFactors,
                require_mfa: requireMFA,
                require_approval: requireApproval
            }
        });

    return new Response(
        JSON.stringify({
            data: {
                risk_score: riskScore,
                risk_level: riskLevel,
                risk_factors: riskFactors,
                allow_action: allowAction,
                require_mfa: requireMFA,
                require_approval: requireApproval,
                message: allowAction ? 
                    (requireApproval ? 'Action requires administrator approval' :
                     requireMFA ? 'Please complete MFA verification' :
                     'Action permitted') :
                    'Action blocked due to high risk'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Assess overall user risk profile
async function assessUserRisk(supabase, userId, requestData, corsHeaders) {
    const { include_history = true } = requestData;

    const riskFactors = [];
    let totalRisk = 0;

    // Get user account age
    const { data: userData } = await supabase
        .from('users')
        .select('created_at, role, two_factor_enabled')
        .eq('id', userId)
        .single();

    if (userData) {
        const accountAge = Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24));
        
        // New accounts are higher risk
        if (accountAge < 30) {
            const risk = 20 - Math.floor(accountAge / 2);
            totalRisk += risk;
            riskFactors.push({ factor: 'new_account', value: `${accountAge} days`, risk });
        }

        // No 2FA enabled
        if (!userData.two_factor_enabled) {
            totalRisk += 25;
            riskFactors.push({ factor: 'no_2fa', value: true, risk: 25 });
        }
    }

    // Check recent security incidents
    const { count: recentIncidents } = await supabase
        .from('security_incidents')
        .select('*', { count: 'exact', head: true })
        .contains('affected_users', [userId])
        .in('status', ['open', 'investigating'])
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (recentIncidents && recentIncidents > 0) {
        const risk = Math.min(recentIncidents * 15, 45);
        totalRisk += risk;
        riskFactors.push({ factor: 'active_incidents', value: recentIncidents, risk });
    }

    // Check failed login attempts
    const { count: failedLogins } = await supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('success', false)
        .gte('attempted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (failedLogins && failedLogins > 3) {
        const risk = Math.min(failedLogins * 3, 20);
        totalRisk += risk;
        riskFactors.push({ factor: 'failed_logins', value: failedLogins, risk });
    }

    // Check for multiple active sessions
    const { count: activeSessions } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);

    if (activeSessions && activeSessions > 3) {
        totalRisk += 10;
        riskFactors.push({ factor: 'multiple_sessions', value: activeSessions, risk: 10 });
    }

    let riskLevel = 'low';
    if (totalRisk >= 70) riskLevel = 'critical';
    else if (totalRisk >= 50) riskLevel = 'high';
    else if (totalRisk >= 30) riskLevel = 'medium';

    return new Response(
        JSON.stringify({
            data: {
                user_id: userId,
                risk_score: totalRisk,
                risk_level: riskLevel,
                risk_factors: riskFactors,
                recommendations: generateRecommendations(riskFactors)
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Get risk factors configuration
async function getRiskFactors(supabase, userId, corsHeaders) {
    const { data: factors } = await supabase
        .from('security_settings')
        .select('setting_key, setting_value')
        .like('setting_key', 'risk_%');

    const config = {};
    factors?.forEach(setting => {
        config[setting.setting_key] = setting.setting_value;
    });

    return new Response(
        JSON.stringify({ data: { risk_configuration: config } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Update risk threshold settings
async function updateRiskThreshold(supabase, requestData, corsHeaders) {
    const { threshold_type, threshold_value } = requestData;

    const { error } = await supabase
        .from('security_settings')
        .upsert({
            setting_key: `risk_threshold_${threshold_type}`,
            setting_value: threshold_value
        }, {
            onConflict: 'setting_key'
        });

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to update threshold', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
        JSON.stringify({ data: { updated: true, threshold_type, threshold_value } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Helper function to generate security recommendations
function generateRecommendations(riskFactors) {
    const recommendations = [];

    riskFactors.forEach(factor => {
        switch (factor.factor) {
            case 'no_2fa':
                recommendations.push('Enable two-factor authentication for enhanced security');
                break;
            case 'failed_logins':
                recommendations.push('Review recent failed login attempts and consider changing password');
                break;
            case 'active_incidents':
                recommendations.push('Review and resolve open security incidents');
                break;
            case 'multiple_sessions':
                recommendations.push('Review active sessions and terminate unused ones');
                break;
            case 'new_account':
                recommendations.push('Complete profile verification and enable additional security features');
                break;
        }
    });

    if (recommendations.length === 0) {
        recommendations.push('Your account security is in good standing');
    }

    return recommendations;
}
