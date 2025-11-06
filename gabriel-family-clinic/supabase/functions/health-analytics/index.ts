// Health Analytics Edge Function
// Generate healthcare analytics with anonymized data

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
        const { metric_type, start_date, end_date, filters } = await req.json();
        
        if (!metric_type) {
            throw new Error('Metric type is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let result;

        switch (metric_type) {
            case 'appointments':
                result = await getAppointmentMetrics(supabaseUrl, serviceRoleKey, start_date, end_date);
                break;
            case 'patients':
                result = await getPatientMetrics(supabaseUrl, serviceRoleKey, start_date, end_date);
                break;
            case 'revenue':
                result = await getRevenueMetrics(supabaseUrl, serviceRoleKey, start_date, end_date);
                break;
            case 'doctors':
                result = await getDoctorPerformance(supabaseUrl, serviceRoleKey, start_date, end_date);
                break;
            case 'chas':
                result = await getCHASMetrics(supabaseUrl, serviceRoleKey, start_date, end_date);
                break;
            default:
                throw new Error(`Unknown metric type: ${metric_type}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Health analytics error:', error);

        const errorResponse = {
            error: {
                code: 'ANALYTICS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function getAppointmentMetrics(supabaseUrl, serviceRoleKey, startDate, endDate) {
    let query = `${supabaseUrl}/rest/v1/appointments?select=*`;
    
    if (startDate) {
        query += `&appointment_date=gte.${startDate}`;
    }
    if (endDate) {
        query += `&appointment_date=lte.${endDate}`;
    }

    const response = await fetch(query, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch appointment data');
    }

    const appointments = await response.json();

    // Calculate metrics
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
    const noShowAppointments = appointments.filter(a => a.status === 'no-show').length;
    const scheduledAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;

    // Group by appointment type
    const appointmentsByType = appointments.reduce((acc, apt) => {
        acc[apt.appointment_type] = (acc[apt.appointment_type] || 0) + 1;
        return acc;
    }, {});

    // Completion rate
    const completionRate = totalAppointments > 0 
        ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
        : 0;

    // No-show rate
    const noShowRate = totalAppointments > 0
        ? ((noShowAppointments / totalAppointments) * 100).toFixed(2)
        : 0;

    return {
        total_appointments: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        no_show: noShowAppointments,
        scheduled: scheduledAppointments,
        by_type: appointmentsByType,
        completion_rate: parseFloat(completionRate),
        no_show_rate: parseFloat(noShowRate),
        period: { start_date: startDate, end_date: endDate }
    };
}

async function getPatientMetrics(supabaseUrl, serviceRoleKey, startDate, endDate) {
    let query = `${supabaseUrl}/rest/v1/patients?select=*`;
    
    if (startDate) {
        query += `&created_at=gte.${startDate}`;
    }
    if (endDate) {
        query += `&created_at=lte.${endDate}`;
    }

    const response = await fetch(query, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch patient data');
    }

    const patients = await response.json();

    // Calculate metrics (anonymized)
    const totalPatients = patients.length;
    
    // Gender distribution
    const genderDistribution = patients.reduce((acc, p) => {
        acc[p.gender] = (acc[p.gender] || 0) + 1;
        return acc;
    }, {});

    // Age groups
    const ageGroups = { '0-17': 0, '18-35': 0, '36-55': 0, '56-70': 0, '70+': 0 };
    patients.forEach(p => {
        const age = calculateAge(p.date_of_birth);
        if (age < 18) ageGroups['0-17']++;
        else if (age <= 35) ageGroups['18-35']++;
        else if (age <= 55) ageGroups['36-55']++;
        else if (age <= 70) ageGroups['56-70']++;
        else ageGroups['70+']++;
    });

    // CHAS card holders
    const chasCardHolders = patients.filter(p => p.chas_card_number).length;
    const chasByType = patients.reduce((acc, p) => {
        if (p.chas_card_type) {
            acc[p.chas_card_type] = (acc[p.chas_card_type] || 0) + 1;
        }
        return acc;
    }, {});

    return {
        total_patients: totalPatients,
        gender_distribution: genderDistribution,
        age_groups: ageGroups,
        chas_card_holders: chasCardHolders,
        chas_by_type: chasByType,
        period: { start_date: startDate, end_date: endDate }
    };
}

async function getRevenueMetrics(supabaseUrl, serviceRoleKey, startDate, endDate) {
    let query = `${supabaseUrl}/rest/v1/payments?select=*&payment_status=eq.paid`;
    
    if (startDate) {
        query += `&payment_date=gte.${startDate}`;
    }
    if (endDate) {
        query += `&payment_date=lte.${endDate}`;
    }

    const response = await fetch(query, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch payment data');
    }

    const payments = await response.json();

    // Calculate metrics
    const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalCHASSubsidy = payments.reduce((sum, p) => sum + parseFloat(p.chas_subsidy || 0), 0);
    const totalInsuranceClaim = payments.reduce((sum, p) => sum + parseFloat(p.insurance_claim || 0), 0);
    const totalPatientPaid = payments.reduce((sum, p) => sum + parseFloat(p.patient_paid), 0);

    // Average values
    const avgConsultationFee = payments.length > 0 ? totalRevenue / payments.length : 0;
    const avgCHASSubsidy = payments.length > 0 ? totalCHASSubsidy / payments.length : 0;

    // Payment method distribution
    const paymentMethods = payments.reduce((acc, p) => {
        acc[p.payment_method] = (acc[p.payment_method] || 0) + 1;
        return acc;
    }, {});

    return {
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
        total_chas_subsidy: parseFloat(totalCHASSubsidy.toFixed(2)),
        total_insurance_claim: parseFloat(totalInsuranceClaim.toFixed(2)),
        total_patient_paid: parseFloat(totalPatientPaid.toFixed(2)),
        avg_consultation_fee: parseFloat(avgConsultationFee.toFixed(2)),
        avg_chas_subsidy: parseFloat(avgCHASSubsidy.toFixed(2)),
        payment_methods: paymentMethods,
        total_transactions: payments.length,
        currency: 'SGD',
        period: { start_date: startDate, end_date: endDate }
    };
}

async function getDoctorPerformance(supabaseUrl, serviceRoleKey, startDate, endDate) {
    let query = `${supabaseUrl}/rest/v1/appointments?select=doctor_id,status`;
    
    if (startDate) {
        query += `&appointment_date=gte.${startDate}`;
    }
    if (endDate) {
        query += `&appointment_date=lte.${endDate}`;
    }

    const response = await fetch(query, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch appointment data');
    }

    const appointments = await response.json();

    // Group by doctor (anonymized - use ID only)
    const doctorMetrics = appointments.reduce((acc, apt) => {
        if (!acc[apt.doctor_id]) {
            acc[apt.doctor_id] = { total: 0, completed: 0, cancelled: 0, no_show: 0 };
        }
        acc[apt.doctor_id].total++;
        if (apt.status === 'completed') acc[apt.doctor_id].completed++;
        if (apt.status === 'cancelled') acc[apt.doctor_id].cancelled++;
        if (apt.status === 'no-show') acc[apt.doctor_id].no_show++;
        return acc;
    }, {});

    return {
        doctor_performance: Object.entries(doctorMetrics).map(([id, metrics]) => ({
            doctor_id: id,
            total_appointments: metrics.total,
            completed: metrics.completed,
            cancelled: metrics.cancelled,
            no_show: metrics.no_show,
            completion_rate: ((metrics.completed / metrics.total) * 100).toFixed(2)
        })),
        period: { start_date: startDate, end_date: endDate }
    };
}

async function getCHASMetrics(supabaseUrl, serviceRoleKey, startDate, endDate) {
    let query = `${supabaseUrl}/rest/v1/payments?select=*&chas_subsidy=gt.0`;
    
    if (startDate) {
        query += `&payment_date=gte.${startDate}`;
    }
    if (endDate) {
        query += `&payment_date=lte.${endDate}`;
    }

    const response = await fetch(query, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch CHAS payment data');
    }

    const chasPayments = await response.json();

    const totalCHASClaims = chasPayments.length;
    const totalCHASSubsidy = chasPayments.reduce((sum, p) => sum + parseFloat(p.chas_subsidy), 0);
    const avgCHASSubsidy = totalCHASClaims > 0 ? totalCHASSubsidy / totalCHASClaims : 0;

    return {
        total_chas_claims: totalCHASClaims,
        total_chas_subsidy: parseFloat(totalCHASSubsidy.toFixed(2)),
        avg_chas_subsidy: parseFloat(avgCHASSubsidy.toFixed(2)),
        currency: 'SGD',
        period: { start_date: startDate, end_date: endDate }
    };
}

function calculateAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}
