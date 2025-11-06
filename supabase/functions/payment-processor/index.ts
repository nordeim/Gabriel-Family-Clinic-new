// Payment Processor Edge Function
// Handle CHAS-compatible billing and payments

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
        const { action, paymentData } = await req.json();
        
        if (!action || !paymentData) {
            throw new Error('Action and payment data are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let result;

        switch (action) {
            case 'create':
                result = await createPayment(supabaseUrl, serviceRoleKey, paymentData);
                break;
            case 'update':
                result = await updatePayment(supabaseUrl, serviceRoleKey, paymentData);
                break;
            case 'calculate':
                result = await calculatePayment(supabaseUrl, serviceRoleKey, paymentData);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Payment processor error:', error);

        const errorResponse = {
            error: {
                code: 'PAYMENT_PROCESSING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function calculatePayment(supabaseUrl, serviceRoleKey, data) {
    const { patient_id, consultation_fee } = data;

    // Get patient's CHAS card information
    const patientResponse = await fetch(
        `${supabaseUrl}/rest/v1/patients?id=eq.${patient_id}&select=chas_card_type`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!patientResponse.ok) {
        throw new Error('Failed to fetch patient information');
    }

    const patients = await patientResponse.json();
    const patient = patients[0];

    // Get CHAS subsidy rates from settings
    const settingsResponse = await fetch(
        `${supabaseUrl}/rest/v1/settings?key=eq.chas_subsidy_rates`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!settingsResponse.ok) {
        throw new Error('Failed to fetch CHAS subsidy rates');
    }

    const settings = await settingsResponse.json();
    const subsidyRates = settings[0]?.value || {};

    // Calculate CHAS subsidy
    let chasSubsidy = 0;
    if (patient?.chas_card_type) {
        const cardType = patient.chas_card_type.toLowerCase();
        chasSubsidy = subsidyRates[cardType] || 0;
        chasSubsidy = Math.min(chasSubsidy, consultation_fee);
    }

    // Calculate patient payment
    const patientPaid = Math.max(0, consultation_fee - chasSubsidy);

    return {
        consultation_fee,
        chas_subsidy: chasSubsidy,
        patient_paid: patientPaid,
        currency: 'SGD'
    };
}

async function createPayment(supabaseUrl, serviceRoleKey, data) {
    const {
        patient_id,
        appointment_id,
        amount,
        payment_method,
        chas_subsidy,
        insurance_claim,
        created_by
    } = data;

    const patientPaid = Math.max(0, amount - (chas_subsidy || 0) - (insurance_claim || 0));

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const paymentData = {
        patient_id,
        appointment_id,
        amount,
        currency: 'SGD',
        payment_method: payment_method || 'cash',
        payment_status: 'pending',
        invoice_number: invoiceNumber,
        description: 'Consultation fee',
        chas_subsidy: chas_subsidy || 0,
        insurance_claim: insurance_claim || 0,
        patient_paid: patientPaid,
        created_by
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/payments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create payment: ${errorText}`);
    }

    const payment = await response.json();
    return payment[0];
}

async function updatePayment(supabaseUrl, serviceRoleKey, data) {
    const { payment_id, payment_status, transaction_id } = data;

    const updateData = {
        payment_status,
        payment_date: new Date().toISOString()
    };

    if (transaction_id) {
        updateData.transaction_id = transaction_id;
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/payments?id=eq.${payment_id}`, {
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
        throw new Error(`Failed to update payment: ${errorText}`);
    }

    const payment = await response.json();
    return payment[0];
}
