// Compliance Checker Edge Function
// Validates PDPA compliance and healthcare data handling regulations for Singapore

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
            case 'check_data_access':
                return await checkDataAccessCompliance(supabase, user.id, data, corsHeaders);
            
            case 'check_data_export':
                return await checkDataExportCompliance(supabase, user.id, data, corsHeaders);
            
            case 'check_consent':
                return await checkConsentCompliance(supabase, data, corsHeaders);
            
            case 'audit_compliance':
                return await auditCompliance(supabase, data, corsHeaders);
            
            case 'generate_report':
                return await generateComplianceReport(supabase, data, corsHeaders);
            
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

// Check PDPA compliance for data access
async function checkDataAccessCompliance(supabase, userId, requestData, corsHeaders) {
    const { resource_type, resource_id, purpose } = requestData;

    const violations = [];
    const warnings = [];

    // Get user role and permissions
    const { data: userData } = await supabase
        .from('users')
        .select('role, department')
        .eq('id', userId)
        .single();

    if (!userData) {
        violations.push('User not found or unauthorized');
        return new Response(
            JSON.stringify({ 
                data: { 
                    compliant: false, 
                    violations, 
                    warnings 
                } 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // PDPA Requirement: Purpose limitation
    if (!purpose || purpose.trim() === '') {
        violations.push('PDPA Violation: No valid purpose specified for data access');
    }

    // Check if accessing patient medical records
    if (resource_type === 'medical_record') {
        const { data: record } = await supabase
            .from('medical_records')
            .select('patient_id, sensitivity_level')
            .eq('id', resource_id)
            .single();

        if (record) {
            // Check if user has treating relationship with patient
            if (userData.role === 'doctor') {
                const { data: relationship } = await supabase
                    .from('doctor_patient_relationships')
                    .select('*')
                    .eq('doctor_id', userId)
                    .eq('patient_id', record.patient_id)
                    .eq('is_active', true)
                    .single();

                if (!relationship) {
                    violations.push('PDPA Violation: No treating relationship exists with patient');
                }
            } else if (userData.role === 'patient' && record.patient_id !== userId) {
                violations.push('PDPA Violation: Cannot access other patients medical records');
            }

            // PDPA: Extra scrutiny for highly sensitive data
            if (record.sensitivity_level === 'high') {
                warnings.push('Accessing highly sensitive medical data - ensure PDPA compliance');
            }
        }
    }

    // Check consent requirements
    if (resource_type === 'patient_data' || resource_type === 'medical_record') {
        const { data: consent } = await supabase
            .from('patient_consents')
            .select('*')
            .eq('patient_id', resource_id)
            .eq('consent_type', 'data_access')
            .eq('is_active', true)
            .single();

        if (!consent) {
            warnings.push('No explicit consent recorded for this data access');
        }
    }

    // Log the compliance check
    await supabase
        .from('security_audit_log')
        .insert({
            event_type: 'compliance_check',
            user_id: userId,
            action: 'data_access',
            resource_type,
            resource_id,
            success: violations.length === 0,
            metadata: {
                purpose,
                violations,
                warnings,
                compliance_framework: 'PDPA_Singapore'
            }
        });

    return new Response(
        JSON.stringify({
            data: {
                compliant: violations.length === 0,
                violations,
                warnings,
                compliance_framework: 'Singapore PDPA',
                access_allowed: violations.length === 0,
                requires_additional_consent: warnings.length > 0
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Check PDPA compliance for data export
async function checkDataExportCompliance(supabase, userId, requestData, corsHeaders) {
    const { export_type, patient_ids, data_fields, destination, purpose } = requestData;

    const violations = [];
    const warnings = [];

    // PDPA Requirement: Valid purpose for export
    if (!purpose || purpose.trim() === '') {
        violations.push('PDPA Violation: No valid purpose specified for data export');
    }

    // PDPA Requirement: Minimize data exported
    if (data_fields && data_fields.length > 20) {
        warnings.push('Large number of data fields being exported - ensure necessity');
    }

    // PDPA Requirement: Consent for bulk export
    if (patient_ids && patient_ids.length > 1) {
        const { data: consents } = await supabase
            .from('patient_consents')
            .select('patient_id')
            .in('patient_id', patient_ids)
            .eq('consent_type', 'data_export')
            .eq('is_active', true);

        const consentedPatients = consents?.map(c => c.patient_id) || [];
        const missingConsent = patient_ids.filter(id => !consentedPatients.includes(id));

        if (missingConsent.length > 0) {
            violations.push(`PDPA Violation: Missing export consent for ${missingConsent.length} patients`);
        }
    }

    // Check user authorization for export
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    // Only doctors and admins can export medical data
    if (!['doctor', 'admin'].includes(userData?.role)) {
        violations.push('Authorization: User role not authorized for data export');
    }

    // PDPA: Secure destination required
    if (destination && !destination.includes('secure') && !destination.includes('encrypted')) {
        warnings.push('Export destination may not be secure - ensure PDPA compliance');
    }

    // Singapore Healthcare: Audit trail requirement
    await supabase
        .from('data_export_logs')
        .insert({
            user_id: userId,
            export_type,
            patient_count: patient_ids?.length || 0,
            fields_exported: data_fields,
            destination,
            purpose,
            compliant: violations.length === 0,
            violations,
            warnings
        });

    return new Response(
        JSON.stringify({
            data: {
                compliant: violations.length === 0,
                violations,
                warnings,
                export_allowed: violations.length === 0,
                requires_approval: warnings.length > 0 || (patient_ids && patient_ids.length > 10),
                compliance_framework: 'Singapore PDPA + Healthcare Regulations'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Check patient consent compliance
async function checkConsentCompliance(supabase, requestData, corsHeaders) {
    const { patient_id, consent_type, action } = requestData;

    // Get all active consents for patient
    const { data: consents } = await supabase
        .from('patient_consents')
        .select('*')
        .eq('patient_id', patient_id)
        .eq('is_active', true);

    const hasConsent = consents?.some(c => 
        c.consent_type === consent_type || c.consent_type === 'general_treatment'
    );

    // PDPA: Check consent expiry
    const expiredConsents = consents?.filter(c => {
        const expiryDate = c.expiry_date ? new Date(c.expiry_date) : null;
        return expiryDate && expiryDate < new Date();
    }) || [];

    const warnings = [];
    if (expiredConsents.length > 0) {
        warnings.push(`${expiredConsents.length} consent(s) have expired - renewal required`);
    }

    // PDPA: Check if consent covers the specific action
    const actionConsentMap = {
        'access_medical_record': ['data_access', 'general_treatment'],
        'share_with_third_party': ['data_sharing', 'third_party_disclosure'],
        'export_data': ['data_export'],
        'marketing_communication': ['marketing'],
        'research_participation': ['research']
    };

    const requiredConsents = actionConsentMap[action] || [];
    const hasRequiredConsent = requiredConsents.some(required =>
        consents?.some(c => c.consent_type === required && c.is_active)
    );

    return new Response(
        JSON.stringify({
            data: {
                has_consent: hasConsent && hasRequiredConsent,
                consent_types: consents?.map(c => c.consent_type) || [],
                expired_consents: expiredConsents.length,
                warnings,
                action_allowed: hasRequiredConsent,
                renewal_required: expiredConsents.length > 0
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Audit overall compliance status
async function auditCompliance(supabase, requestData, corsHeaders) {
    const { time_range = '30d' } = requestData;

    const days = parseInt(time_range);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get compliance violations
    const { data: violations } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('event_type', 'compliance_check')
        .eq('success', false)
        .gte('created_at', startDate);

    // Get data access without purpose
    const { count: noPurposeAccess } = await supabase
        .from('security_audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'data_access')
        .is('metadata->>purpose', null)
        .gte('created_at', startDate);

    // Get expired consents
    const { count: expiredConsents } = await supabase
        .from('patient_consents')
        .select('*', { count: 'exact', head: true })
        .lt('expiry_date', new Date().toISOString())
        .eq('is_active', true);

    const complianceScore = Math.max(0, 100 - (
        (violations?.length || 0) * 5 +
        (noPurposeAccess || 0) * 2 +
        (expiredConsents || 0) * 1
    ));

    return new Response(
        JSON.stringify({
            data: {
                compliance_score: complianceScore,
                compliance_level: complianceScore >= 90 ? 'excellent' : 
                                 complianceScore >= 75 ? 'good' :
                                 complianceScore >= 60 ? 'fair' : 'needs_improvement',
                violations_count: violations?.length || 0,
                no_purpose_access_count: noPurposeAccess || 0,
                expired_consents_count: expiredConsents || 0,
                time_range: time_range,
                audited_at: new Date().toISOString()
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Generate compliance report
async function generateComplianceReport(supabase, requestData, corsHeaders) {
    const { report_type = 'monthly', include_recommendations = true } = requestData;

    const days = report_type === 'weekly' ? 7 : report_type === 'monthly' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Gather compliance metrics
    const { data: accessLogs } = await supabase
        .from('security_audit_log')
        .select('event_type, success, metadata')
        .gte('created_at', startDate);

    const totalAccess = accessLogs?.length || 0;
    const compliantAccess = accessLogs?.filter(log => log.success).length || 0;
    const complianceRate = totalAccess > 0 ? (compliantAccess / totalAccess * 100).toFixed(2) : 100;

    // Get top violation types
    const violationTypes = {};
    accessLogs?.filter(log => !log.success).forEach(log => {
        const violations = log.metadata?.violations || [];
        violations.forEach(v => {
            violationTypes[v] = (violationTypes[v] || 0) + 1;
        });
    });

    const recommendations = include_recommendations ? generateComplianceRecommendations(violationTypes) : [];

    const report = {
        report_type,
        period_start: startDate,
        period_end: new Date().toISOString(),
        metrics: {
            total_access_events: totalAccess,
            compliant_events: compliantAccess,
            compliance_rate: `${complianceRate}%`,
            top_violations: Object.entries(violationTypes)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => ({ type, count }))
        },
        recommendations,
        generated_at: new Date().toISOString(),
        compliance_framework: 'Singapore PDPA + Healthcare Regulations'
    };

    // Store the report
    await supabase
        .from('compliance_reports')
        .insert({
            report_type,
            report_data: report,
            compliance_rate: parseFloat(complianceRate)
        });

    return new Response(
        JSON.stringify({ data: report }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Generate compliance recommendations
function generateComplianceRecommendations(violationTypes) {
    const recommendations = [];

    if (violationTypes['No valid purpose specified']) {
        recommendations.push({
            priority: 'high',
            issue: 'Data access without valid purpose',
            recommendation: 'Implement mandatory purpose field for all data access operations',
            regulation: 'PDPA Purpose Limitation Principle'
        });
    }

    if (violationTypes['No treating relationship']) {
        recommendations.push({
            priority: 'high',
            issue: 'Access to patient data without established relationship',
            recommendation: 'Strengthen access controls to verify treating relationships',
            regulation: 'Healthcare Confidentiality Requirements'
        });
    }

    if (violationTypes['Missing export consent']) {
        recommendations.push({
            priority: 'medium',
            issue: 'Data export without patient consent',
            recommendation: 'Implement consent verification before allowing data exports',
            regulation: 'PDPA Consent Requirements'
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            priority: 'info',
            issue: 'None',
            recommendation: 'Compliance status is good. Continue monitoring and maintain current practices.',
            regulation: 'General Best Practice'
        });
    }

    return recommendations;
}
