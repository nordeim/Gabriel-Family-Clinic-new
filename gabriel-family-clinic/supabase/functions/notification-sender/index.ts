// Notification Sender Edge Function
// Sends appointment reminders and health alerts

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
        const { notificationType, recipientId, data } = await req.json();
        
        if (!notificationType || !recipientId) {
            throw new Error('Notification type and recipient ID are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const notification = await createNotification(
            supabaseUrl,
            serviceRoleKey,
            notificationType,
            recipientId,
            data
        );

        return new Response(JSON.stringify({ data: notification }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Notification sender error:', error);

        const errorResponse = {
            error: {
                code: 'NOTIFICATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function createNotification(supabaseUrl, serviceRoleKey, type, userId, data) {
    let title, message;

    switch (type) {
        case 'appointment-reminder':
            title = 'Appointment Reminder';
            message = `You have an upcoming appointment on ${data.appointment_date} at ${data.appointment_time} with ${data.doctor_name}.`;
            break;
        case 'appointment-confirmation':
            title = 'Appointment Confirmed';
            message = `Your appointment has been confirmed for ${data.appointment_date} at ${data.appointment_time}.`;
            break;
        case 'prescription-ready':
            title = 'Prescription Ready';
            message = `Your prescription is ready for collection at Gabriel Family Clinic.`;
            break;
        case 'test-result':
            title = 'Test Results Available';
            message = `Your test results are now available. Please contact the clinic or check your patient portal.`;
            break;
        case 'payment-due':
            title = 'Payment Due';
            message = `You have an outstanding payment of SGD ${data.amount}. Invoice: ${data.invoice_number}`;
            break;
        default:
            title = 'System Alert';
            message = data.message || 'You have a new notification';
    }

    const notificationData = {
        user_id: userId,
        notification_type: type,
        title,
        message,
        related_id: data.related_id || null,
        related_type: data.related_type || null,
        sent_at: new Date().toISOString()
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create notification: ${errorText}`);
    }

    const result = await response.json();
    return result[0];
}
