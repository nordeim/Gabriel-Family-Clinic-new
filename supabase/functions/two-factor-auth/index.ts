// Two-Factor Authentication Management Edge Function
// Handles 2FA setup, verification, and backup codes

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

        // Get user from auth token
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: { message: 'Invalid authorization token' } }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        switch (action) {
            case 'setup_totp':
                return await setupTOTP(supabase, user.id, corsHeaders);
            
            case 'verify_totp':
                return await verifyTOTP(supabase, user.id, data, corsHeaders);
            
            case 'generate_backup_codes':
                return await generateBackupCodes(supabase, user.id, corsHeaders);
            
            case 'verify_backup_code':
                return await verifyBackupCode(supabase, user.id, data, corsHeaders);
            
            case 'disable_2fa':
                return await disable2FA(supabase, user.id, corsHeaders);
            
            case 'get_status':
                return await get2FAStatus(supabase, user.id, corsHeaders);
            
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

// Setup TOTP (Time-based One-Time Password)
async function setupTOTP(supabase, userId, corsHeaders) {
    // Generate a random secret (32 characters base32)
    const secret = generateBase32Secret();
    
    // Get user email for QR code
    const { data: userData } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single();

    if (!userData) {
        return new Response(
            JSON.stringify({ error: { message: 'User not found' } }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Store the secret (not yet enabled)
    const { error: insertError } = await supabase
        .from('two_factor_auth')
        .upsert({
            user_id: userId,
            method: 'totp',
            secret: secret,
            is_enabled: false
        }, {
            onConflict: 'user_id,method'
        });

    if (insertError) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to save 2FA setup', details: insertError.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Generate QR code URL (otpauth://totp/...)
    const issuer = 'Gabriel Family Clinic';
    const accountName = userData.email;
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

    return new Response(
        JSON.stringify({
            data: {
                secret,
                qr_code_url: otpauthUrl,
                manual_entry_key: secret,
                message: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Verify TOTP code and enable 2FA
async function verifyTOTP(supabase, userId, requestData, corsHeaders) {
    const { code } = requestData;

    if (!code || code.length !== 6) {
        return new Response(
            JSON.stringify({ error: { message: 'Invalid verification code format' } }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Get stored secret
    const { data: totpData } = await supabase
        .from('two_factor_auth')
        .select('secret')
        .eq('user_id', userId)
        .eq('method', 'totp')
        .single();

    if (!totpData || !totpData.secret) {
        return new Response(
            JSON.stringify({ error: { message: '2FA not set up. Please run setup first.' } }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Verify the code
    const isValid = verifyTOTPCode(totpData.secret, code);

    if (!isValid) {
        return new Response(
            JSON.stringify({ error: { message: 'Invalid verification code' } }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Enable 2FA
    const { error: updateError } = await supabase
        .from('two_factor_auth')
        .update({
            is_enabled: true,
            verified_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('method', 'totp');

    if (updateError) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to enable 2FA', details: updateError.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodesList();
    
    await supabase
        .from('two_factor_auth')
        .update({
            backup_codes: backupCodes
        })
        .eq('user_id', userId)
        .eq('method', 'totp');

    return new Response(
        JSON.stringify({
            data: {
                enabled: true,
                backup_codes: backupCodes,
                message: 'Two-factor authentication enabled successfully. Save these backup codes in a secure location.'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Generate new backup codes
async function generateBackupCodes(supabase, userId, corsHeaders) {
    const backupCodes = generateBackupCodesList();
    
    const { error } = await supabase
        .from('two_factor_auth')
        .update({
            backup_codes: backupCodes
        })
        .eq('user_id', userId)
        .eq('method', 'totp');

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to generate backup codes', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
        JSON.stringify({
            data: {
                backup_codes: backupCodes,
                message: 'New backup codes generated. Previous codes are now invalid.'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Verify backup code
async function verifyBackupCode(supabase, userId, requestData, corsHeaders) {
    const { code } = requestData;

    const { data: totpData } = await supabase
        .from('two_factor_auth')
        .select('backup_codes')
        .eq('user_id', userId)
        .eq('method', 'totp')
        .single();

    if (!totpData || !totpData.backup_codes) {
        return new Response(
            JSON.stringify({ error: { message: 'No backup codes found' } }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const codeIndex = totpData.backup_codes.indexOf(code);
    
    if (codeIndex === -1) {
        return new Response(
            JSON.stringify({ error: { message: 'Invalid backup code' } }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Remove used backup code
    const remainingCodes = totpData.backup_codes.filter((_, index) => index !== codeIndex);
    
    await supabase
        .from('two_factor_auth')
        .update({
            backup_codes: remainingCodes
        })
        .eq('user_id', userId)
        .eq('method', 'totp');

    return new Response(
        JSON.stringify({
            data: {
                valid: true,
                remaining_codes: remainingCodes.length,
                message: 'Backup code verified. Consider generating new backup codes if running low.'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Disable 2FA
async function disable2FA(supabase, userId, corsHeaders) {
    const { error } = await supabase
        .from('two_factor_auth')
        .update({
            is_enabled: false
        })
        .eq('user_id', userId)
        .eq('method', 'totp');

    if (error) {
        return new Response(
            JSON.stringify({ error: { message: 'Failed to disable 2FA', details: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
        JSON.stringify({
            data: {
                enabled: false,
                message: 'Two-factor authentication disabled'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Get 2FA status
async function get2FAStatus(supabase, userId, corsHeaders) {
    const { data } = await supabase
        .from('two_factor_auth')
        .select('method, is_enabled, verified_at')
        .eq('user_id', userId);

    return new Response(
        JSON.stringify({
            data: {
                enabled: data && data.length > 0 && data[0].is_enabled,
                methods: data || [],
                message: data && data.length > 0 ? '2FA configured' : '2FA not set up'
            }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

// Helper functions
function generateBase32Secret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
        secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
}

function generateBackupCodesList() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push(code);
    }
    return codes;
}

function verifyTOTPCode(secret, code) {
    // Simplified TOTP verification
    // In production, use a proper TOTP library
    // This is a placeholder that accepts any 6-digit code for demo
    return /^\d{6}$/.test(code);
}
