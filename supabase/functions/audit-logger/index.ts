// Audit Logger Edge Function
// Comprehensive logging of all healthcare data access

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
        const { userId, action, tableName, recordId, oldData, newData, notes } = await req.json();
        
        if (!action || !tableName) {
            throw new Error('Action and table name are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        const auditLog = await createAuditLog(
            supabaseUrl,
            serviceRoleKey,
            {
                user_id: userId,
                action,
                table_name: tableName,
                record_id: recordId,
                old_data: oldData,
                new_data: newData,
                ip_address: ipAddress,
                user_agent: userAgent,
                notes
            }
        );

        return new Response(JSON.stringify({ data: auditLog }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Audit logger error:', error);

        const errorResponse = {
            error: {
                code: 'AUDIT_LOG_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function createAuditLog(supabaseUrl, serviceRoleKey, logData) {
    const response = await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(logData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create audit log: ${errorText}`);
    }

    const result = await response.json();
    return result[0];
}
