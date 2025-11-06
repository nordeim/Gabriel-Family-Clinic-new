-- Gabriel Family Clinic - Seed Data
-- Migration 004: Sample Data for Development and Testing
-- Created: 2025-11-06
-- Description: Sample data for healthcare platform testing

-- Note: These IDs are generated using uuid_generate_v4() to ensure uniqueness
-- Passwords should be set through Supabase Auth, not stored here

-- ==============================================
-- Seed Data: Test Users
-- ==============================================
-- Admin user
INSERT INTO users (id, email, full_name, phone, role, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@gabrielfamilyclinic.sg', 'Admin User', '+65 9123 4567', 'admin', true);

-- Doctor users
INSERT INTO users (id, email, full_name, phone, role, is_active) VALUES
    ('22222222-2222-2222-2222-222222222222', 'dr.tan@gabrielfamilyclinic.sg', 'Dr. Tan Wei Ming', '+65 9123 4568', 'doctor', true),
    ('22222222-2222-2222-2222-222222222223', 'dr.lee@gabrielfamilyclinic.sg', 'Dr. Lee Hui Ling', '+65 9123 4569', 'doctor', true),
    ('22222222-2222-2222-2222-222222222224', 'dr.kumar@gabrielfamilyclinic.sg', 'Dr. Kumar Rajesh', '+65 9123 4570', 'doctor', true);

-- Staff users
INSERT INTO users (id, email, full_name, phone, role, is_active) VALUES
    ('33333333-3333-3333-3333-333333333333', 'staff1@gabrielfamilyclinic.sg', 'Sarah Lim', '+65 9123 4571', 'staff', true),
    ('33333333-3333-3333-3333-333333333334', 'staff2@gabrielfamilyclinic.sg', 'Ahmad Hassan', '+65 9123 4572', 'staff', true);

-- Patient users
INSERT INTO users (id, email, full_name, phone, role, is_active) VALUES
    ('44444444-4444-4444-4444-444444444444', 'patient1@example.com', 'Mary Wong', '+65 9234 5678', 'patient', true),
    ('44444444-4444-4444-4444-444444444445', 'patient2@example.com', 'John Lim', '+65 9234 5679', 'patient', true),
    ('44444444-4444-4444-4444-444444444446', 'patient3@example.com', 'Siti Rahman', '+65 9234 5680', 'patient', true),
    ('44444444-4444-4444-4444-444444444447', 'patient4@example.com', 'David Chen', '+65 9234 5681', 'patient', true),
    ('44444444-4444-4444-4444-444444444448', 'patient5@example.com', 'Priya Kumar', '+65 9234 5682', 'patient', true);

-- ==============================================
-- Seed Data: Doctors
-- ==============================================
-- Get specialty IDs from the already-inserted specialties
WITH specialty_mapping AS (
    SELECT id, name FROM specialties
)
INSERT INTO doctors (id, user_id, medical_license, specialty_ids, qualifications, experience_years, languages, consultation_fee, bio, is_accepting_patients) 
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        'M12345',
        ARRAY[(SELECT id FROM specialties WHERE name = 'General Practice'), (SELECT id FROM specialties WHERE name = 'Family Medicine')],
        ARRAY['MBBS (NUS)', 'MRCP (UK)', 'Graduate Diploma in Family Medicine'],
        15,
        ARRAY['English', 'Mandarin', 'Malay'],
        80.00,
        'Dr. Tan is a dedicated family physician with over 15 years of experience in general practice. He specializes in chronic disease management and preventive care.',
        true
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
        '22222222-2222-2222-2222-222222222223',
        'M12346',
        ARRAY[(SELECT id FROM specialties WHERE name = 'Pediatrics'), (SELECT id FROM specialties WHERE name = 'Family Medicine')],
        ARRAY['MBBS (NUS)', 'M.Med (Paediatrics)', 'MRCPCH'],
        12,
        ARRAY['English', 'Mandarin'],
        85.00,
        'Dr. Lee specializes in pediatric care with a gentle, patient-centered approach. She has extensive experience in childhood vaccinations and developmental monitoring.',
        true
    ),
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
        '22222222-2222-2222-2222-222222222224',
        'M12347',
        ARRAY[(SELECT id FROM specialties WHERE name = 'Geriatrics'), (SELECT id FROM specialties WHERE name = 'Internal Medicine')],
        ARRAY['MBBS (India)', 'MD (Internal Medicine)', 'Fellowship in Geriatric Medicine'],
        18,
        ARRAY['English', 'Tamil'],
        90.00,
        'Dr. Kumar is an expert in elderly care and internal medicine. He focuses on comprehensive geriatric assessment and management of multiple chronic conditions.',
        true
    );

-- ==============================================
-- Seed Data: Patients
-- ==============================================
INSERT INTO patients (id, user_id, nric, date_of_birth, gender, address, postal_code, emergency_contact, blood_type, allergies, chronic_conditions, chas_card_number, chas_card_type, created_by) 
VALUES
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '44444444-4444-4444-4444-444444444444',
        'S8012345A',
        '1980-03-15',
        'F',
        'Block 123, Ang Mo Kio Avenue 3, #05-678',
        '560123',
        '{"name": "Peter Wong", "relationship": "Husband", "phone": "+65 9876 5432"}'::jsonb,
        'O+',
        ARRAY['Penicillin'],
        ARRAY['Type 2 Diabetes', 'Hypertension'],
        'C123456789',
        'Blue',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
        '44444444-4444-4444-4444-444444444445',
        'S7512345B',
        '1975-07-22',
        'M',
        'Block 456, Jurong West Street 42, #12-345',
        '640456',
        '{"name": "Jane Lim", "relationship": "Wife", "phone": "+65 9876 5433"}'::jsonb,
        'A+',
        ARRAY[],
        ARRAY['Hyperlipidemia'],
        'C123456790',
        'Orange',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd',
        '44444444-4444-4444-4444-444444444446',
        'S8512345C',
        '1985-11-08',
        'F',
        'Block 789, Bedok North Street 1, #08-901',
        '460789',
        '{"name": "Ahmad Rahman", "relationship": "Husband", "phone": "+65 9876 5434"}'::jsonb,
        'B+',
        ARRAY['Sulfa drugs'],
        ARRAY[],
        'C123456791',
        'Green',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbe',
        '44444444-4444-4444-4444-444444444447',
        'S6012345D',
        '1960-05-30',
        'M',
        'Block 234, Clementi Avenue 5, #03-567',
        '120234',
        '{"name": "Linda Chen", "relationship": "Wife", "phone": "+65 9876 5435"}'::jsonb,
        'AB+',
        ARRAY['Aspirin'],
        ARRAY['Type 2 Diabetes', 'Hypertension', 'High Cholesterol'],
        'C123456792',
        'Blue',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbf',
        '44444444-4444-4444-4444-444444444448',
        'S9012345E',
        '1990-09-12',
        'F',
        'Block 567, Tampines Street 32, #15-234',
        '520567',
        '{"name": "Raj Kumar", "relationship": "Husband", "phone": "+65 9876 5436"}'::jsonb,
        'O-',
        ARRAY[],
        ARRAY[],
        NULL,
        NULL,
        '33333333-3333-3333-3333-333333333333'
    );

-- ==============================================
-- Seed Data: Time Slots for Doctors
-- ==============================================
-- Get clinic ID
WITH clinic_data AS (
    SELECT id FROM clinics LIMIT 1
)
-- Dr. Tan's schedule (Monday to Friday, 9am-5pm)
INSERT INTO time_slots (doctor_id, clinic_id, day_of_week, start_time, end_time, slot_duration, is_available)
SELECT 
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    (SELECT id FROM clinic_data),
    day,
    '09:00'::TIME,
    '17:00'::TIME,
    30,
    true
FROM generate_series(1, 5) as day; -- Monday to Friday

-- Dr. Lee's schedule (Monday to Friday, 8am-4pm)
INSERT INTO time_slots (doctor_id, clinic_id, day_of_week, start_time, end_time, slot_duration, is_available)
SELECT 
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
    (SELECT id FROM clinic_data),
    day,
    '08:00'::TIME,
    '16:00'::TIME,
    30,
    true
FROM generate_series(1, 5) as day;

-- Dr. Kumar's schedule (Monday to Saturday, 10am-6pm)
INSERT INTO time_slots (doctor_id, clinic_id, day_of_week, start_time, end_time, slot_duration, is_available)
SELECT 
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
    (SELECT id FROM clinic_data),
    day,
    '10:00'::TIME,
    '18:00'::TIME,
    30,
    true
FROM generate_series(1, 6) as day; -- Monday to Saturday

-- ==============================================
-- Seed Data: Sample Appointments
-- ==============================================
WITH clinic_data AS (
    SELECT id FROM clinics LIMIT 1
)
INSERT INTO appointments (patient_id, doctor_id, clinic_id, appointment_date, appointment_time, duration, appointment_type, status, reason, created_by)
VALUES
    -- Upcoming appointments
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        (SELECT id FROM clinic_data),
        CURRENT_DATE + INTERVAL '3 days',
        '10:00'::TIME,
        30,
        'consultation',
        'scheduled',
        'Diabetes follow-up and blood pressure check',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        (SELECT id FROM clinic_data),
        CURRENT_DATE + INTERVAL '5 days',
        '14:00'::TIME,
        30,
        'consultation',
        'confirmed',
        'General check-up and cholesterol screening',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbe',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
        (SELECT id FROM clinic_data),
        CURRENT_DATE + INTERVAL '7 days',
        '11:00'::TIME,
        30,
        'follow-up',
        'scheduled',
        'Chronic disease management review',
        '33333333-3333-3333-3333-333333333333'
    ),
    -- Past completed appointments
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        (SELECT id FROM clinic_data),
        CURRENT_DATE - INTERVAL '30 days',
        '10:00'::TIME,
        30,
        'consultation',
        'completed',
        'Routine diabetes check',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
        (SELECT id FROM clinic_data),
        CURRENT_DATE - INTERVAL '15 days',
        '09:00'::TIME,
        30,
        'vaccination',
        'completed',
        'Flu vaccination',
        '33333333-3333-3333-3333-333333333333'
    );

-- ==============================================
-- Seed Data: Sample Medical Records
-- ==============================================
INSERT INTO medical_records (patient_id, appointment_id, doctor_id, record_date, chief_complaint, vital_signs, symptoms, diagnosis, treatment, follow_up_required, follow_up_date, created_by)
VALUES
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        (SELECT id FROM appointments WHERE patient_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND status = 'completed' LIMIT 1),
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        CURRENT_DATE - INTERVAL '30 days',
        'Routine diabetes follow-up',
        '{"bp": "135/85", "hr": "78", "temp": "36.5", "weight": "68.5", "height": "162", "bmi": "26.1"}'::jsonb,
        'Feeling well, no specific complaints',
        'Type 2 Diabetes Mellitus - controlled, Hypertension - controlled',
        'Continue current medications. Advised on diet and exercise.',
        true,
        CURRENT_DATE + INTERVAL '60 days',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd',
        (SELECT id FROM appointments WHERE patient_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd' AND status = 'completed' LIMIT 1),
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
        CURRENT_DATE - INTERVAL '15 days',
        'Flu vaccination',
        '{"bp": "120/78", "hr": "72", "temp": "36.7", "weight": "58.0", "height": "165", "bmi": "21.3"}'::jsonb,
        'No active symptoms',
        'Healthy adult - preventive care',
        'Administered influenza vaccine. Advised to monitor for any adverse reactions.',
        false,
        NULL,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab'
    );

-- ==============================================
-- Seed Data: Sample Prescriptions
-- ==============================================
INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, prescription_date, medications, diagnosis, is_dispensed, valid_until, is_repeatable, repeat_count, created_by)
VALUES
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        (SELECT id FROM appointments WHERE patient_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND status = 'completed' LIMIT 1),
        CURRENT_DATE - INTERVAL '30 days',
        '[
            {
                "name": "Metformin",
                "dosage": "500mg",
                "frequency": "Twice daily",
                "duration": "30 days",
                "instructions": "Take with meals"
            },
            {
                "name": "Amlodipine",
                "dosage": "5mg",
                "frequency": "Once daily",
                "duration": "30 days",
                "instructions": "Take in the morning"
            }
        ]'::jsonb,
        'Type 2 Diabetes Mellitus, Hypertension',
        true,
        CURRENT_DATE + INTERVAL '30 days',
        true,
        3,
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    );

-- ==============================================
-- Seed Data: Sample Payments
-- ==============================================
INSERT INTO payments (patient_id, appointment_id, amount, currency, payment_method, payment_status, payment_date, invoice_number, description, chas_subsidy, patient_paid, created_by)
VALUES
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        (SELECT id FROM appointments WHERE patient_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND status = 'completed' LIMIT 1),
        80.00,
        'SGD',
        'cash',
        'paid',
        CURRENT_DATE - INTERVAL '30 days',
        'INV-2025-001',
        'Consultation fee',
        18.50,
        61.50,
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd',
        (SELECT id FROM appointments WHERE patient_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd' AND status = 'completed' LIMIT 1),
        85.00,
        'SGD',
        'nets',
        'paid',
        CURRENT_DATE - INTERVAL '15 days',
        'INV-2025-002',
        'Vaccination and consultation',
        5.00,
        80.00,
        '33333333-3333-3333-3333-333333333333'
    );

-- ==============================================
-- Seed Data: Sample Notifications
-- ==============================================
INSERT INTO notifications (user_id, notification_type, title, message, related_id, related_type, is_read, sent_at)
VALUES
    (
        '44444444-4444-4444-4444-444444444444',
        'appointment-reminder',
        'Upcoming Appointment Reminder',
        'Your appointment with Dr. Tan Wei Ming is scheduled for ' || TO_CHAR(CURRENT_DATE + INTERVAL '3 days', 'DD/MM/YYYY') || ' at 10:00 AM.',
        (SELECT id FROM appointments WHERE patient_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND status = 'scheduled' LIMIT 1),
        'appointment',
        false,
        CURRENT_DATE
    ),
    (
        '44444444-4444-4444-4444-444444444445',
        'appointment-confirmation',
        'Appointment Confirmed',
        'Your appointment has been confirmed for ' || TO_CHAR(CURRENT_DATE + INTERVAL '5 days', 'DD/MM/YYYY') || ' at 2:00 PM.',
        (SELECT id FROM appointments WHERE patient_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc' AND status = 'confirmed' LIMIT 1),
        'appointment',
        false,
        CURRENT_DATE - INTERVAL '1 day'
    );

-- ==============================================
-- Seed Data: Sample Insurance
-- ==============================================
INSERT INTO insurance (patient_id, provider_name, policy_number, policy_holder_name, policy_holder_relationship, coverage_type, coverage_amount, valid_from, valid_until, is_active)
VALUES
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
        'AIA Singapore',
        'POL123456789',
        'John Lim',
        'Self',
        'Outpatient',
        5000.00,
        '2025-01-01',
        '2025-12-31',
        true
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbe',
        'Great Eastern',
        'POL987654321',
        'David Chen',
        'Self',
        'Hospitalization',
        100000.00,
        '2025-01-01',
        '2025-12-31',
        true
    );

-- ==============================================
-- Comments
-- ==============================================
COMMENT ON TABLE users IS 'Sample users for testing: 1 admin, 3 doctors, 2 staff, 5 patients';
COMMENT ON TABLE doctors IS 'Sample doctors with different specializations';
COMMENT ON TABLE patients IS 'Sample patients with various medical conditions and CHAS cards';
COMMENT ON TABLE appointments IS 'Sample appointments including upcoming and completed';
COMMENT ON TABLE medical_records IS 'Sample medical records with vital signs';
COMMENT ON TABLE prescriptions IS 'Sample prescriptions with medication details';
COMMENT ON TABLE payments IS 'Sample payments with CHAS subsidies';
