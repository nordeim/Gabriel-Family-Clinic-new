// Appointment Processor Edge Function
// Handles appointment booking, rescheduling, and cancellation

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { action, appointmentData } = await req.json();
        
        if (!action || !appointmentData) {
            throw new Error('Action and appointment data are required');
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
                result = await createAppointment(supabaseUrl, serviceRoleKey, authHeader, appointmentData);
                break;
            case 'reschedule':
                result = await rescheduleAppointment(supabaseUrl, serviceRoleKey, authHeader, appointmentData);
                break;
            case 'cancel':
                result = await cancelAppointment(supabaseUrl, serviceRoleKey, authHeader, appointmentData);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Appointment processor error:', error);

        const errorResponse = {
            error: {
                code: 'APPOINTMENT_PROCESSING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function createAppointment(supabaseUrl, serviceRoleKey, authHeader, data) {
    const { patient_id, doctor_id, clinic_id, appointment_date, appointment_time, duration, appointment_type, reason } = data;

    const response = await fetch(`${supabaseUrl}/rest/v1/appointments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            patient_id,
            doctor_id,
            clinic_id,
            appointment_date,
            appointment_time,
            duration: duration || 30,
            appointment_type: appointment_type || 'consultation',
            status: 'scheduled',
            reason,
            created_by: patient_id
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create appointment: ${errorText}`);
    }

    const appointment = await response.json();
    
    await createNotification(supabaseUrl, serviceRoleKey, {
        user_id: patient_id,
        notification_type: 'appointment-confirmation',
        title: 'Appointment Confirmed',
        message: `Your appointment on ${appointment_date} at ${appointment_time} has been confirmed.`,
        related_id: appointment[0].id,
        related_type: 'appointment'
    });

    return appointment[0];
}

async function rescheduleAppointment(supabaseUrl, serviceRoleKey, authHeader, data) {
    const { appointment_id, appointment_date, appointment_time } = data;

    const response = await fetch(`${supabaseUrl}/rest/v1/appointments?id=eq.${appointment_id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            appointment_date,
            appointment_time,
            status: 'scheduled'
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reschedule appointment: ${errorText}`);
    }

    const appointment = await response.json();
    return appointment[0];
}

async function cancelAppointment(supabaseUrl, serviceRoleKey, authHeader, data) {
    const { appointment_id, cancellation_reason } = data;

    const response = await fetch(`${supabaseUrl}/rest/v1/appointments?id=eq.${appointment_id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: cancellation_reason || 'Patient requested cancellation'
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to cancel appointment: ${errorText}`);
    }

    const appointment = await response.json();
    return appointment[0];
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
