-- Gabriel Family Clinic - Database Views and Functions
-- Migration 003: Views and Functions
-- Created: 2025-11-06
-- Description: Optimized views and helper functions for common queries

-- ==============================================
-- VIEW: patient_dashboard
-- Comprehensive patient information for dashboard
-- ==============================================
CREATE OR REPLACE VIEW patient_dashboard AS
SELECT 
    p.id as patient_id,
    u.id as user_id,
    u.full_name,
    u.email,
    u.phone,
    p.nric,
    p.date_of_birth,
    p.gender,
    p.address,
    p.postal_code,
    p.blood_type,
    p.allergies,
    p.chronic_conditions,
    p.current_medications,
    p.chas_card_number,
    p.chas_card_type,
    p.preferred_language,
    -- Count of upcoming appointments
    (SELECT COUNT(*) FROM appointments 
     WHERE patient_id = p.id 
     AND appointment_date >= CURRENT_DATE 
     AND status IN ('scheduled', 'confirmed')) as upcoming_appointments,
    -- Last appointment date
    (SELECT MAX(appointment_date) FROM appointments 
     WHERE patient_id = p.id 
     AND status = 'completed') as last_appointment_date,
    -- Total appointments
    (SELECT COUNT(*) FROM appointments 
     WHERE patient_id = p.id) as total_appointments,
    p.created_at,
    p.updated_at
FROM patients p
JOIN users u ON p.user_id = u.id
WHERE u.is_active = true;

COMMENT ON VIEW patient_dashboard IS 'Consolidated patient information for dashboard display';

-- ==============================================
-- VIEW: doctor_schedule
-- Doctor availability and appointments
-- ==============================================
CREATE OR REPLACE VIEW doctor_schedule AS
SELECT 
    d.id as doctor_id,
    u.full_name as doctor_name,
    d.medical_license,
    s.name as specialty_name,
    a.id as appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.duration,
    a.status,
    a.appointment_type,
    p_patient.full_name as patient_name,
    pat.nric as patient_nric,
    c.name as clinic_name,
    c.address as clinic_address
FROM doctors d
JOIN users u ON d.user_id = u.id
LEFT JOIN appointments a ON d.id = a.doctor_id
LEFT JOIN patients pat ON a.patient_id = pat.id
LEFT JOIN users p_patient ON pat.user_id = p_patient.id
LEFT JOIN clinics c ON a.clinic_id = c.id
LEFT JOIN LATERAL (
    SELECT name FROM specialties 
    WHERE id = ANY(d.specialty_ids) 
    LIMIT 1
) s ON true
WHERE u.is_active = true;

COMMENT ON VIEW doctor_schedule IS 'Doctor schedules with appointments and patient information';

-- ==============================================
-- VIEW: appointment_summary
-- Comprehensive appointment information
-- ==============================================
CREATE OR REPLACE VIEW appointment_summary AS
SELECT 
    a.id as appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.duration,
    a.status,
    a.appointment_type,
    a.reason,
    -- Patient information
    p.id as patient_id,
    u_patient.full_name as patient_name,
    u_patient.email as patient_email,
    u_patient.phone as patient_phone,
    p.nric as patient_nric,
    p.date_of_birth as patient_dob,
    -- Doctor information
    d.id as doctor_id,
    u_doctor.full_name as doctor_name,
    d.medical_license,
    -- Clinic information
    c.id as clinic_id,
    c.name as clinic_name,
    c.address as clinic_address,
    c.phone as clinic_phone,
    -- Payment information
    pay.id as payment_id,
    pay.payment_status,
    pay.amount as payment_amount,
    a.created_at,
    a.updated_at
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN users u_patient ON p.user_id = u_patient.id
JOIN doctors d ON a.doctor_id = d.id
JOIN users u_doctor ON d.user_id = u_doctor.id
JOIN clinics c ON a.clinic_id = c.id
LEFT JOIN payments pay ON a.id = pay.appointment_id;

COMMENT ON VIEW appointment_summary IS 'Complete appointment details with patient, doctor, and payment info';

-- ==============================================
-- VIEW: medical_history_timeline
-- Patient medical history in chronological order
-- ==============================================
CREATE OR REPLACE VIEW medical_history_timeline AS
SELECT 
    mr.id as record_id,
    mr.patient_id,
    mr.record_date,
    mr.chief_complaint,
    mr.diagnosis,
    mr.treatment,
    mr.vital_signs,
    mr.follow_up_required,
    mr.follow_up_date,
    -- Doctor information
    d.id as doctor_id,
    u.full_name as doctor_name,
    -- Associated appointment
    a.id as appointment_id,
    a.appointment_date,
    -- Prescription count
    (SELECT COUNT(*) FROM prescriptions 
     WHERE medical_record_id = mr.id) as prescription_count,
    mr.created_at
FROM medical_records mr
JOIN doctors d ON mr.doctor_id = d.id
JOIN users u ON d.user_id = u.id
LEFT JOIN appointments a ON mr.appointment_id = a.id
ORDER BY mr.record_date DESC, mr.created_at DESC;

COMMENT ON VIEW medical_history_timeline IS 'Patient medical history in chronological timeline format';

-- ==============================================
-- VIEW: prescription_details
-- Detailed prescription information
-- ==============================================
CREATE OR REPLACE VIEW prescription_details AS
SELECT 
    pr.id as prescription_id,
    pr.prescription_date,
    pr.medications,
    pr.diagnosis,
    pr.is_dispensed,
    pr.dispensed_at,
    pr.valid_until,
    pr.is_repeatable,
    pr.repeat_count,
    -- Patient information
    p.id as patient_id,
    u_patient.full_name as patient_name,
    p.nric as patient_nric,
    -- Doctor information
    d.id as doctor_id,
    u_doctor.full_name as doctor_name,
    d.medical_license,
    -- Dispensed by
    CASE 
        WHEN pr.dispensed_by IS NOT NULL THEN u_dispensed.full_name
        ELSE NULL
    END as dispensed_by_name,
    pr.created_at
FROM prescriptions pr
JOIN patients p ON pr.patient_id = p.id
JOIN users u_patient ON p.user_id = u_patient.id
JOIN doctors d ON pr.doctor_id = d.id
JOIN users u_doctor ON d.user_id = u_doctor.id
LEFT JOIN users u_dispensed ON pr.dispensed_by = u_dispensed.id
ORDER BY pr.prescription_date DESC;

COMMENT ON VIEW prescription_details IS 'Complete prescription information with patient and doctor details';

-- ==============================================
-- VIEW: payment_summary
-- Payment and billing information
-- ==============================================
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    pay.id as payment_id,
    pay.invoice_number,
    pay.amount,
    pay.currency,
    pay.payment_method,
    pay.payment_status,
    pay.payment_date,
    pay.chas_subsidy,
    pay.insurance_claim,
    pay.patient_paid,
    -- Patient information
    p.id as patient_id,
    u.full_name as patient_name,
    p.nric as patient_nric,
    -- Appointment information
    a.id as appointment_id,
    a.appointment_date,
    a.appointment_type,
    -- Doctor information
    d.id as doctor_id,
    u_doctor.full_name as doctor_name,
    pay.created_at
FROM payments pay
JOIN patients p ON pay.patient_id = p.id
JOIN users u ON p.user_id = u.id
LEFT JOIN appointments a ON pay.appointment_id = a.id
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN users u_doctor ON d.user_id = u_doctor.id
ORDER BY pay.payment_date DESC NULLS LAST, pay.created_at DESC;

COMMENT ON VIEW payment_summary IS 'Payment records with patient and appointment information';

-- ==============================================
-- VIEW: healthcare_analytics
-- Analytics for healthcare operations
-- ==============================================
CREATE OR REPLACE VIEW healthcare_analytics AS
SELECT 
    DATE_TRUNC('month', a.appointment_date) as month,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'cancelled' THEN a.id END) as cancelled_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'no-show' THEN a.id END) as no_show_appointments,
    COUNT(DISTINCT a.patient_id) as unique_patients,
    COUNT(DISTINCT a.doctor_id) as active_doctors,
    AVG(CASE WHEN pay.payment_status = 'paid' THEN pay.amount END) as avg_payment_amount,
    SUM(CASE WHEN pay.payment_status = 'paid' THEN pay.amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN pay.payment_status = 'paid' THEN pay.chas_subsidy ELSE 0 END) as total_chas_subsidy
FROM appointments a
LEFT JOIN payments pay ON a.id = pay.appointment_id
GROUP BY DATE_TRUNC('month', a.appointment_date)
ORDER BY month DESC;

COMMENT ON VIEW healthcare_analytics IS 'Monthly healthcare operations analytics and metrics';

-- ==============================================
-- FUNCTION: get_available_time_slots
-- Get available appointment slots for a doctor
-- ==============================================
CREATE OR REPLACE FUNCTION get_available_time_slots(
    p_doctor_id UUID,
    p_date DATE,
    p_clinic_id UUID
)
RETURNS TABLE (
    slot_time TIME,
    is_available BOOLEAN
) AS $$
DECLARE
    v_day_of_week INTEGER;
BEGIN
    -- Get day of week (0 = Sunday, 6 = Saturday)
    v_day_of_week := EXTRACT(DOW FROM p_date);
    
    RETURN QUERY
    WITH time_ranges AS (
        SELECT 
            ts.start_time,
            ts.end_time,
            ts.slot_duration
        FROM time_slots ts
        WHERE ts.doctor_id = p_doctor_id
        AND ts.clinic_id = p_clinic_id
        AND ts.day_of_week = v_day_of_week
        AND ts.is_available = true
    ),
    generated_slots AS (
        SELECT 
            (start_time + (interval '1 minute' * slot_duration * generate_series(0, 
                EXTRACT(EPOCH FROM (end_time - start_time)) / 60 / slot_duration - 1
            )))::TIME as slot_time
        FROM time_ranges
    ),
    booked_slots AS (
        SELECT appointment_time
        FROM appointments
        WHERE doctor_id = p_doctor_id
        AND appointment_date = p_date
        AND status IN ('scheduled', 'confirmed', 'in-progress')
    )
    SELECT 
        gs.slot_time,
        NOT EXISTS (
            SELECT 1 FROM booked_slots bs 
            WHERE bs.appointment_time = gs.slot_time
        ) as is_available
    FROM generated_slots gs
    ORDER BY gs.slot_time;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_available_time_slots IS 'Get available appointment time slots for a doctor on a specific date';

-- ==============================================
-- FUNCTION: calculate_chas_subsidy
-- Calculate CHAS subsidy based on card type
-- ==============================================
CREATE OR REPLACE FUNCTION calculate_chas_subsidy(
    p_chas_card_type VARCHAR,
    p_consultation_fee DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    v_subsidy_rates JSONB;
    v_subsidy_amount DECIMAL;
BEGIN
    -- Get CHAS subsidy rates from settings
    SELECT value INTO v_subsidy_rates
    FROM settings
    WHERE key = 'chas_subsidy_rates';
    
    -- Calculate subsidy based on card type
    v_subsidy_amount := CASE 
        WHEN LOWER(p_chas_card_type) = 'blue' THEN 
            (v_subsidy_rates->>'blue')::DECIMAL
        WHEN LOWER(p_chas_card_type) = 'orange' THEN 
            (v_subsidy_rates->>'orange')::DECIMAL
        WHEN LOWER(p_chas_card_type) = 'green' THEN 
            (v_subsidy_rates->>'green')::DECIMAL
        ELSE 0.00
    END;
    
    -- Subsidy cannot exceed consultation fee
    RETURN LEAST(v_subsidy_amount, p_consultation_fee);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_chas_subsidy IS 'Calculate CHAS subsidy amount based on card type and consultation fee';

-- ==============================================
-- FUNCTION: validate_singapore_nric
-- Validate Singapore NRIC format
-- ==============================================
CREATE OR REPLACE FUNCTION validate_singapore_nric(p_nric VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    -- NRIC format: XddddddX where X is a letter and d is a digit
    -- First letter: S (Singapore citizen born before 2000), T (born after 2000), F (foreigner before 2000), G (foreigner after 2000)
    -- Last letter: Checksum letter
    RETURN p_nric ~ '^[STFG]\d{7}[A-Z]$';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_singapore_nric IS 'Validate Singapore NRIC format (XddddddX)';

-- ==============================================
-- FUNCTION: validate_singapore_phone
-- Validate Singapore phone number format
-- ==============================================
CREATE OR REPLACE FUNCTION validate_singapore_phone(p_phone VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    -- Singapore phone format: +65 XXXX XXXX (8 digits)
    RETURN p_phone ~ '^\+65\s?\d{4}\s?\d{4}$';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_singapore_phone IS 'Validate Singapore phone number format (+65 XXXX XXXX)';

-- ==============================================
-- FUNCTION: format_singapore_currency
-- Format amount as Singapore currency
-- ==============================================
CREATE OR REPLACE FUNCTION format_singapore_currency(p_amount DECIMAL)
RETURNS TEXT AS $$
BEGIN
    RETURN 'SGD ' || TO_CHAR(p_amount, 'FM999,999,990.00');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION format_singapore_currency IS 'Format decimal amount as Singapore currency (SGD X,XXX.XX)';

-- ==============================================
-- FUNCTION: get_patient_next_appointment
-- Get patient's next upcoming appointment
-- ==============================================
CREATE OR REPLACE FUNCTION get_patient_next_appointment(p_patient_id UUID)
RETURNS TABLE (
    appointment_id UUID,
    appointment_date DATE,
    appointment_time TIME,
    doctor_name VARCHAR,
    clinic_name VARCHAR,
    status appointment_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        u.full_name,
        c.name,
        a.status
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users u ON d.user_id = u.id
    JOIN clinics c ON a.clinic_id = c.id
    WHERE a.patient_id = p_patient_id
    AND a.appointment_date >= CURRENT_DATE
    AND a.status IN ('scheduled', 'confirmed')
    ORDER BY a.appointment_date, a.appointment_time
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_patient_next_appointment IS 'Get patient''s next upcoming appointment';

-- ==============================================
-- FUNCTION: create_audit_log
-- Create audit log entry
-- ==============================================
CREATE OR REPLACE FUNCTION create_audit_log(
    p_user_id UUID,
    p_action audit_action,
    p_table_name VARCHAR,
    p_record_id UUID,
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data,
        notes
    ) VALUES (
        p_user_id,
        p_action,
        p_table_name,
        p_record_id,
        p_old_data,
        p_new_data,
        p_notes
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_audit_log IS 'Create audit log entry for compliance tracking';

-- ==============================================
-- TRIGGER FUNCTION: audit_patient_data_access
-- Automatically log patient data access
-- ==============================================
CREATE OR REPLACE FUNCTION audit_patient_data_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Log patient data modifications
    IF TG_OP = 'UPDATE' THEN
        PERFORM create_audit_log(
            auth.uid(),
            'update'::audit_action,
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD)::jsonb,
            row_to_json(NEW)::jsonb,
            'Patient data updated'
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM create_audit_log(
            auth.uid(),
            'delete'::audit_action,
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)::jsonb,
            NULL,
            'Patient data deleted'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_patients_changes
    AFTER UPDATE OR DELETE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION audit_patient_data_access();

CREATE TRIGGER audit_medical_records_changes
    AFTER UPDATE OR DELETE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION audit_patient_data_access();

CREATE TRIGGER audit_prescriptions_changes
    AFTER UPDATE OR DELETE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION audit_patient_data_access();

COMMENT ON FUNCTION audit_patient_data_access IS 'Automatically log patient data access for compliance';

-- ==============================================
-- Performance Indexes
-- ==============================================
-- Composite indexes for common queries
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date) WHERE status IN ('scheduled', 'confirmed');
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, appointment_date DESC);
CREATE INDEX idx_medical_records_patient_date ON medical_records(patient_id, record_date DESC);
CREATE INDEX idx_prescriptions_patient_date ON prescriptions(patient_id, prescription_date DESC);
CREATE INDEX idx_payments_patient_status ON payments(patient_id, payment_status);

-- Text search indexes
CREATE INDEX idx_patients_name_search ON patients USING gin(to_tsvector('english', (SELECT full_name FROM users WHERE id = patients.user_id)));
CREATE INDEX idx_doctors_name_search ON doctors USING gin(to_tsvector('english', (SELECT full_name FROM users WHERE id = doctors.user_id)));

COMMENT ON INDEX idx_appointments_doctor_date IS 'Optimize doctor schedule queries';
COMMENT ON INDEX idx_medical_records_patient_date IS 'Optimize patient medical history queries';
