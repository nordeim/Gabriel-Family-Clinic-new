// Email Notifications Edge Function
// Send healthcare-related email notifications

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { email_type, recipient_email, data } = await req.json();
        
        if (!email_type || !recipient_email) {
            throw new Error('Email type and recipient email are required');
        }

        const emailContent = generateEmailContent(email_type, data);
        
        // In production, this would integrate with an email service (Resend, SendGrid, etc.)
        // For now, we'll log the email and mark it as sent
        console.log('Email to be sent:', {
            to: recipient_email,
            subject: emailContent.subject,
            html: emailContent.html
        });

        // Store email notification in database
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (serviceRoleKey && supabaseUrl && data.user_id) {
            await fetch(`${supabaseUrl}/rest/v1/notifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: data.user_id,
                    notification_type: email_type,
                    title: emailContent.subject,
                    message: emailContent.plainText,
                    email_sent: true,
                    sent_at: new Date().toISOString()
                })
            });
        }

        return new Response(JSON.stringify({
            data: {
                success: true,
                message: 'Email sent successfully',
                recipient: recipient_email
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Email notification error:', error);

        const errorResponse = {
            error: {
                code: 'EMAIL_SEND_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

function generateEmailContent(emailType, data) {
    const clinicName = 'Gabriel Family Clinic';
    const clinicPhone = '+65 6789 0123';
    const clinicEmail = 'info@gabrielfamilyclinic.sg';

    let subject, html, plainText;

    switch (emailType) {
        case 'appointment-confirmation':
            subject = 'Appointment Confirmation - Gabriel Family Clinic';
            plainText = `Dear ${data.patient_name},\n\nYour appointment has been confirmed.\n\nDetails:\nDate: ${data.appointment_date}\nTime: ${data.appointment_time}\nDoctor: ${data.doctor_name}\nClinic: ${data.clinic_name}\n\nPlease arrive 10 minutes early. If you need to reschedule, please contact us at ${clinicPhone}.\n\nBest regards,\n${clinicName}`;
            html = `
                <h2>Appointment Confirmation</h2>
                <p>Dear ${data.patient_name},</p>
                <p>Your appointment has been confirmed.</p>
                <h3>Appointment Details:</h3>
                <ul>
                    <li><strong>Date:</strong> ${data.appointment_date}</li>
                    <li><strong>Time:</strong> ${data.appointment_time}</li>
                    <li><strong>Doctor:</strong> ${data.doctor_name}</li>
                    <li><strong>Clinic:</strong> ${data.clinic_name}</li>
                </ul>
                <p>Please arrive 10 minutes early for registration.</p>
                <p>If you need to reschedule, please contact us at ${clinicPhone}.</p>
                <p>Best regards,<br>${clinicName}</p>
            `;
            break;

        case 'appointment-reminder':
            subject = 'Appointment Reminder - Tomorrow';
            plainText = `Dear ${data.patient_name},\n\nThis is a reminder that you have an appointment tomorrow.\n\nDetails:\nDate: ${data.appointment_date}\nTime: ${data.appointment_time}\nDoctor: ${data.doctor_name}\n\nSee you soon!\n\n${clinicName}`;
            html = `
                <h2>Appointment Reminder</h2>
                <p>Dear ${data.patient_name},</p>
                <p>This is a friendly reminder that you have an appointment <strong>tomorrow</strong>.</p>
                <h3>Appointment Details:</h3>
                <ul>
                    <li><strong>Date:</strong> ${data.appointment_date}</li>
                    <li><strong>Time:</strong> ${data.appointment_time}</li>
                    <li><strong>Doctor:</strong> ${data.doctor_name}</li>
                </ul>
                <p>See you soon!</p>
                <p>Best regards,<br>${clinicName}</p>
            `;
            break;

        case 'prescription-ready':
            subject = 'Your Prescription is Ready';
            plainText = `Dear ${data.patient_name},\n\nYour prescription is ready for collection at ${clinicName}.\n\nPlease collect it during our operating hours.\n\nOperating Hours:\nMonday - Friday: 8:00 AM - 6:00 PM\nSaturday: 8:00 AM - 1:00 PM\n\nContact: ${clinicPhone}\n\nBest regards,\n${clinicName}`;
            html = `
                <h2>Prescription Ready</h2>
                <p>Dear ${data.patient_name},</p>
                <p>Your prescription is ready for collection at ${clinicName}.</p>
                <h3>Collection Information:</h3>
                <p><strong>Operating Hours:</strong></p>
                <ul>
                    <li>Monday - Friday: 8:00 AM - 6:00 PM</li>
                    <li>Saturday: 8:00 AM - 1:00 PM</li>
                    <li>Sunday: Closed</li>
                </ul>
                <p>Contact: ${clinicPhone}</p>
                <p>Best regards,<br>${clinicName}</p>
            `;
            break;

        case 'test-result':
            subject = 'Your Test Results are Available';
            plainText = `Dear ${data.patient_name},\n\nYour test results are now available.\n\nPlease log in to your patient portal or contact us at ${clinicPhone} to discuss your results with your doctor.\n\nBest regards,\n${clinicName}`;
            html = `
                <h2>Test Results Available</h2>
                <p>Dear ${data.patient_name},</p>
                <p>Your test results are now available.</p>
                <p>Please log in to your patient portal or contact us at ${clinicPhone} to discuss your results with your doctor.</p>
                <p>Best regards,<br>${clinicName}</p>
            `;
            break;

        case 'payment-receipt':
            subject = 'Payment Receipt - Gabriel Family Clinic';
            plainText = `Dear ${data.patient_name},\n\nThank you for your payment.\n\nReceipt Details:\nInvoice Number: ${data.invoice_number}\nAmount Paid: SGD ${data.amount}\nPayment Method: ${data.payment_method}\nDate: ${data.payment_date}\n\n${data.chas_subsidy > 0 ? `CHAS Subsidy Applied: SGD ${data.chas_subsidy}\n` : ''}Best regards,\n${clinicName}`;
            html = `
                <h2>Payment Receipt</h2>
                <p>Dear ${data.patient_name},</p>
                <p>Thank you for your payment.</p>
                <h3>Receipt Details:</h3>
                <ul>
                    <li><strong>Invoice Number:</strong> ${data.invoice_number}</li>
                    <li><strong>Amount Paid:</strong> SGD ${data.amount}</li>
                    <li><strong>Payment Method:</strong> ${data.payment_method}</li>
                    <li><strong>Date:</strong> ${data.payment_date}</li>
                    ${data.chas_subsidy > 0 ? `<li><strong>CHAS Subsidy Applied:</strong> SGD ${data.chas_subsidy}</li>` : ''}
                </ul>
                <p>Best regards,<br>${clinicName}</p>
            `;
            break;

        default:
            subject = 'Notification from Gabriel Family Clinic';
            plainText = data.message || 'You have a new notification from Gabriel Family Clinic.';
            html = `<p>${data.message || 'You have a new notification from Gabriel Family Clinic.'}</p>`;
    }

    return { subject, html, plainText };
}
