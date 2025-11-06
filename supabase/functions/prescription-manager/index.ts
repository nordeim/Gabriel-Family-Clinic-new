// Prescription Manager Edge Function
// Handle prescription creation, updates, and tracking

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PATCH',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { action, prescriptionData } = await req.json();
        
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

        let result;

        switch (action) {
            case 'create':
                result = await createPrescription(supabaseUrl, serviceRoleKey, authHeader, prescriptionData);
                break;
            case 'dispense':
                result = await dispensePrescription(supabaseUrl, serviceRoleKey, authHeader, prescriptionData);
                break;
            case 'list':
                result = await listPrescriptions(supabaseUrl, serviceRoleKey, prescriptionData.patient_id);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Prescription manager error:', error);

        const errorResponse = {
            error: {
                code: 'PRESCRIPTION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function createPrescription(supabaseUrl, serviceRoleKey, authHeader, data) {
    const {
        patient_id,
        doctor_id,
        appointment_id,
        medical_record_id,
        medications,
        diagnosis,
        notes,
        is_repeatable,
        repeat_count
    } = data;

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

    // Calculate validity (default 30 days)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const prescriptionData = {
        patient_id,
        doctor_id,
        appointment_id,
        medical_record_id,
        prescription_date: new Date().toISOString().split('T')[0],
        medications: JSON.stringify(medications),
        diagnosis,
        notes,
        is_dispensed: false,
        valid_until: validUntil.toISOString().split('T')[0],
        is_repeatable: is_repeatable || false,
        repeat_count: repeat_count || 0,
        created_by: userId
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/prescriptions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(prescriptionData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create prescription: ${errorText}`);
    }

    const prescription = await response.json();

    // Create notification for patient
    await createNotification(supabaseUrl, serviceRoleKey, {
        user_id: patient_id,
        notification_type: 'prescription-ready',
        title: 'New Prescription',
        message: 'Your doctor has issued a new prescription.',
        related_id: prescription[0].id,
        related_type: 'prescription'
    });

    return prescription[0];
}

async function dispensePrescription(supabaseUrl, serviceRoleKey, authHeader, data) {
    const { prescription_id } = data;

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

    const updateData = {
        is_dispensed: true,
        dispensed_at: new Date().toISOString(),
        dispensed_by: userId
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/prescriptions?id=eq.${prescription_id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to dispense prescription: ${errorText}`);
    }

    const prescription = await response.json();
    return prescription[0];
}

async function listPrescriptions(supabaseUrl, serviceRoleKey, patientId) {
    const response = await fetch(
        `${supabaseUrl}/rest/v1/prescriptions?patient_id=eq.${patientId}&order=prescription_date.desc`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to retrieve prescriptions: ${errorText}`);
    }

    return await response.json();
}

async function createNotification(supabaseUrl, serviceRoleKey, notificationData) {
    await fetch(`${supabaseUrl}/rest/v1/notifications`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
    });
}
