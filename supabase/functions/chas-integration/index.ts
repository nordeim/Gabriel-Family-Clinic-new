// CHAS Integration Edge Function
// CHAS eligibility checking and subsidy calculation

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
        const { action, data } = await req.json();
        
        if (!action) {
            throw new Error('Action is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let result;

        switch (action) {
            case 'check_eligibility':
                result = await checkCHASEligibility(supabaseUrl, serviceRoleKey, data);
                break;
            case 'calculate_subsidy':
                result = await calculateSubsidy(supabaseUrl, serviceRoleKey, data);
                break;
            case 'update_card':
                result = await updateCHASCard(supabaseUrl, serviceRoleKey, data);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('CHAS integration error:', error);

        const errorResponse = {
            error: {
                code: 'CHAS_INTEGRATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function checkCHASEligibility(supabaseUrl, serviceRoleKey, data) {
    const { patient_id, chas_card_number } = data;

    // Get patient information
    const patientResponse = await fetch(
        `${supabaseUrl}/rest/v1/patients?id=eq.${patient_id}`,
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

    if (!patient) {
        throw new Error('Patient not found');
    }

    // Validate CHAS card number format
    const isValidFormat = /^C\d{9}$/.test(chas_card_number);

    if (!isValidFormat) {
        return {
            is_eligible: false,
            message: 'Invalid CHAS card number format. Must be C followed by 9 digits.',
            card_type: null
        };
    }

    // In real implementation, this would call actual CHAS API
    // For now, we validate based on existing card information
    const hasValidCard = patient.chas_card_number === chas_card_number && patient.chas_card_type;

    if (!hasValidCard) {
        return {
            is_eligible: false,
            message: 'CHAS card not found or does not match patient records.',
            card_type: null
        };
    }

    return {
        is_eligible: true,
        message: 'Patient is eligible for CHAS subsidy.',
        card_type: patient.chas_card_type,
        patient_name: patient.nric
    };
}

async function calculateSubsidy(supabaseUrl, serviceRoleKey, data) {
    const { patient_id, consultation_fee, service_type } = data;

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

    if (!patient || !patient.chas_card_type) {
        return {
            subsidy_amount: 0,
            card_type: null,
            message: 'Patient does not have a valid CHAS card'
        };
    }

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
    const subsidyRates = settings[0]?.value || { blue: 18.50, orange: 10.50, green: 5.00 };

    // Calculate subsidy based on card type
    const cardType = patient.chas_card_type.toLowerCase();
    let subsidyAmount = subsidyRates[cardType] || 0;

    // Subsidy cannot exceed consultation fee
    subsidyAmount = Math.min(subsidyAmount, consultation_fee);

    // Calculate patient's out-of-pocket cost
    const patientPays = Math.max(0, consultation_fee - subsidyAmount);

    return {
        subsidy_amount: subsidyAmount,
        patient_pays: patientPays,
        card_type: patient.chas_card_type,
        consultation_fee: consultation_fee,
        currency: 'SGD',
        message: `CHAS ${patient.chas_card_type} card applied. Subsidy: SGD ${subsidyAmount.toFixed(2)}`
    };
}

async function updateCHASCard(supabaseUrl, serviceRoleKey, data) {
    const { patient_id, chas_card_number, chas_card_type } = data;

    // Validate card type
    const validCardTypes = ['Blue', 'Orange', 'Green'];
    if (!validCardTypes.includes(chas_card_type)) {
        throw new Error('Invalid CHAS card type. Must be Blue, Orange, or Green.');
    }

    // Validate card number format
    if (!/^C\d{9}$/.test(chas_card_number)) {
        throw new Error('Invalid CHAS card number format. Must be C followed by 9 digits.');
    }

    const updateData = {
        chas_card_number,
        chas_card_type
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/patients?id=eq.${patient_id}`, {
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
        throw new Error(`Failed to update CHAS card: ${errorText}`);
    }

    const patient = await response.json();
    return {
        success: true,
        patient: patient[0],
        message: 'CHAS card information updated successfully'
    };
}
