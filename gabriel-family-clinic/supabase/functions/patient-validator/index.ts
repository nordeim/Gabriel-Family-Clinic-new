// Patient Validator Edge Function
// Validates patient registration data and NRIC format

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
        const { patientData } = await req.json();
        
        if (!patientData) {
            throw new Error('Patient data is required');
        }

        const validationErrors = validatePatientData(patientData);
        
        if (validationErrors.length > 0) {
            return new Response(JSON.stringify({
                data: {
                    isValid: false,
                    errors: validationErrors
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const nricExists = await checkNricExists(supabaseUrl, serviceRoleKey, patientData.nric);
        
        if (nricExists) {
            return new Response(JSON.stringify({
                data: {
                    isValid: false,
                    errors: ['NRIC already registered in system']
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            data: {
                isValid: true,
                errors: []
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Patient validation error:', error);

        const errorResponse = {
            error: {
                code: 'VALIDATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

function validatePatientData(data) {
    const errors = [];

    if (!validateNRIC(data.nric)) {
        errors.push('Invalid NRIC format. Must be in format: XddddddX (e.g., S8012345A)');
    }

    if (!validatePhone(data.phone)) {
        errors.push('Invalid phone number. Must be in Singapore format: +65 XXXX XXXX');
    }

    if (!data.full_name || data.full_name.trim().length < 2) {
        errors.push('Full name is required and must be at least 2 characters');
    }

    if (!data.date_of_birth) {
        errors.push('Date of birth is required');
    } else {
        const dob = new Date(data.date_of_birth);
        const today = new Date();
        if (dob >= today) {
            errors.push('Date of birth must be in the past');
        }
        
        const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
        if (age > 150) {
            errors.push('Invalid date of birth');
        }
    }

    if (!data.gender || !['M', 'F', 'Other'].includes(data.gender)) {
        errors.push('Gender must be M, F, or Other');
    }

    if (!data.address || data.address.trim().length < 10) {
        errors.push('Valid address is required');
    }

    if (data.postal_code && !validatePostalCode(data.postal_code)) {
        errors.push('Invalid Singapore postal code. Must be 6 digits');
    }

    if (!data.emergency_contact || !data.emergency_contact.name || !data.emergency_contact.phone) {
        errors.push('Emergency contact with name and phone number is required');
    }

    return errors;
}

function validateNRIC(nric) {
    if (!nric) return false;
    const nricPattern = /^[STFG]\d{7}[A-Z]$/;
    return nricPattern.test(nric);
}

function validatePhone(phone) {
    if (!phone) return false;
    const phonePattern = /^\+65\s?\d{4}\s?\d{4}$/;
    return phonePattern.test(phone);
}

function validatePostalCode(postalCode) {
    if (!postalCode) return true;
    return /^\d{6}$/.test(postalCode);
}

async function checkNricExists(supabaseUrl, serviceRoleKey, nric) {
    const response = await fetch(
        `${supabaseUrl}/rest/v1/patients?nric=eq.${nric}&select=id`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!response.ok) {
        return false;
    }

    const data = await response.json();
    return data.length > 0;
}
