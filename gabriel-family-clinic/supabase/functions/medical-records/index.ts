// Medical Records Edge Function
// Secure access to medical history with audit logging

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { action, recordData } = await req.json();
        
        if (!action) {
            throw new Error('Action is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        let result;

        switch (action) {
            case 'create':
                result = await createMedicalRecord(supabaseUrl, serviceRoleKey, userId, recordData);
                break;
            case 'view':
                result = await viewMedicalRecord(supabaseUrl, serviceRoleKey, userId, recordData.record_id);
                await logAudit(supabaseUrl, serviceRoleKey, userId, 'read', 'medical_records', recordData.record_id);
                break;
            case 'list':
                result = await listMedicalRecords(supabaseUrl, serviceRoleKey, recordData.patient_id);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Medical records error:', error);

        const errorResponse = {
            error: {
                code: 'MEDICAL_RECORDS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function createMedicalRecord(supabaseUrl, serviceRoleKey, userId, data) {
    const {
        patient_id,
        appointment_id,
        doctor_id,
        record_date,
        chief_complaint,
        vital_signs,
        symptoms,
        diagnosis,
        treatment
    } = data;

    const response = await fetch(`${supabaseUrl}/rest/v1/medical_records`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            patient_id,
            appointment_id,
            doctor_id,
            record_date: record_date || new Date().toISOString().split('T')[0],
            chief_complaint,
            vital_signs: vital_signs || {},
            symptoms,
            diagnosis,
            treatment,
            created_by: userId
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create medical record: ${errorText}`);
    }

    const record = await response.json();
    
    await logAudit(supabaseUrl, serviceRoleKey, userId, 'create', 'medical_records', record[0].id);
    
    return record[0];
}

async function viewMedicalRecord(supabaseUrl, serviceRoleKey, userId, recordId) {
    const response = await fetch(
        `${supabaseUrl}/rest/v1/medical_records?id=eq.${recordId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to retrieve medical record: ${errorText}`);
    }

    const records = await response.json();
    return records[0] || null;
}

async function listMedicalRecords(supabaseUrl, serviceRoleKey, patientId) {
    const response = await fetch(
        `${supabaseUrl}/rest/v1/medical_records?patient_id=eq.${patientId}&order=record_date.desc`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to retrieve medical records: ${errorText}`);
    }

    return await response.json();
}

async function logAudit(supabaseUrl, serviceRoleKey, userId, action, tableName, recordId) {
    await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: userId,
            action,
            table_name: tableName,
            record_id: recordId
        })
    });
}
