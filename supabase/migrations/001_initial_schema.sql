-- Gabriel Family Clinic Healthcare Database Schema
-- Migration 001: Initial Schema
-- Created: 2025-11-06
-- Description: Complete healthcare database with Singapore localization

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom ENUM types for healthcare operations
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin', 'staff');
CREATE TYPE gender_type AS ENUM ('M', 'F', 'Other');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show');
CREATE TYPE appointment_type AS ENUM ('consultation', 'follow-up', 'procedure', 'vaccination', 'health-screening');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partially-paid', 'refunded', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'credit-card', 'debit-card', 'nets', 'paynow', 'insurance', 'chas');
CREATE TYPE notification_type AS ENUM ('appointment-reminder', 'appointment-confirmation', 'prescription-ready', 'test-result', 'payment-due', 'system-alert');
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'export');

-- ==============================================
-- TABLE 1: users
-- Core authentication and user management
-- ==============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL, -- Singapore format: +65 XXXX XXXX
    role user_role NOT NULL DEFAULT 'patient',
    is_active BOOLEAN NOT NULL DEFAULT true,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ==============================================
-- TABLE 2: patients
-- Patient demographic and medical information
-- ==============================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    nric VARCHAR(9) UNIQUE NOT NULL, -- Singapore NRIC: XddddddX
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(6), -- Singapore postal code
    emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb, -- {name, relationship, phone}
    blood_type VARCHAR(5),
    allergies TEXT[] DEFAULT '{}',
    chronic_conditions TEXT[] DEFAULT '{}',
    current_medications TEXT[] DEFAULT '{}',
    insurance_provider VARCHAR(255),
    insurance_number VARCHAR(100),
    chas_card_number VARCHAR(50), -- CHAS card for subsidies
    chas_card_type VARCHAR(20), -- Blue, Orange, Green
    preferred_language VARCHAR(50) DEFAULT 'English',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    created_by UUID NOT NULL
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_nric ON patients(nric);
CREATE INDEX idx_patients_chas_card ON patients(chas_card_number);

-- ==============================================
-- TABLE 3: specialties
-- Medical specializations for doctors
-- ==============================================
CREATE TABLE specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW())
);

-- Insert common specialties
INSERT INTO specialties (name, description) VALUES
    ('General Practice', 'Primary healthcare and routine medical care'),
    ('Pediatrics', 'Medical care for infants, children, and adolescents'),
    ('Internal Medicine', 'Prevention, diagnosis, and treatment of adult diseases'),
    ('Geriatrics', 'Healthcare for elderly patients'),
    ('Family Medicine', 'Comprehensive healthcare for all ages'),
    ('Cardiology', 'Heart and cardiovascular system care'),
    ('Dermatology', 'Skin, hair, and nail care'),
    ('Orthopedics', 'Musculoskeletal system care');

-- ==============================================
-- TABLE 4: doctors
-- Doctor profiles and qualifications
-- ==============================================
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    medical_license VARCHAR(100) UNIQUE NOT NULL, -- Singapore Medical Council registration
    specialty_ids UUID[] DEFAULT '{}',
    qualifications TEXT[] DEFAULT '{}', -- Degrees, certifications
    experience_years INTEGER NOT NULL DEFAULT 0,
    languages TEXT[] DEFAULT ARRAY['English'], -- English, Mandarin, Malay, Tamil
    consultation_fee DECIMAL(10, 2) NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    is_accepting_patients BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW())
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_medical_license ON doctors(medical_license);
CREATE INDEX idx_doctors_specialty ON doctors USING GIN(specialty_ids);

-- ==============================================
-- TABLE 5: clinics
-- Clinic locations and information
-- ==============================================
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(6) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    operating_hours JSONB NOT NULL DEFAULT '{}'::jsonb, -- {monday: {open, close}, ...}
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW())
);

-- Insert main clinic
INSERT INTO clinics (name, address, postal_code, phone, email, operating_hours) VALUES
    ('Gabriel Family Clinic', '123 Medical Drive, Singapore', '123456', '+65 6789 0123', 'info@gabrielfamilyclinic.sg', 
    '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "13:00"}, "sunday": {"open": "closed", "close": "closed"}}'::jsonb);

-- ==============================================
-- TABLE 6: time_slots
-- Doctor availability for appointments
-- ==============================================
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL,
    clinic_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INTEGER NOT NULL DEFAULT 30, -- Minutes per appointment
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW())
);

CREATE INDEX idx_time_slots_doctor ON time_slots(doctor_id);
CREATE INDEX idx_time_slots_clinic ON time_slots(clinic_id);
CREATE INDEX idx_time_slots_day ON time_slots(day_of_week);

-- ==============================================
-- TABLE 7: appointments
-- Patient appointment scheduling and management
-- ==============================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    clinic_id UUID NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER NOT NULL DEFAULT 30, -- Minutes
    appointment_type appointment_type NOT NULL DEFAULT 'consultation',
    status appointment_status NOT NULL DEFAULT 'scheduled',
    reason TEXT NOT NULL,
    symptoms TEXT,
    notes TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    reminder_sent BOOLEAN NOT NULL DEFAULT false,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    created_by UUID NOT NULL
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);

-- ==============================================
-- TABLE 8: medical_records
-- Patient medical history and health records
-- ==============================================
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    appointment_id UUID,
    doctor_id UUID NOT NULL,
    record_date DATE NOT NULL,
    chief_complaint TEXT NOT NULL,
    vital_signs JSONB DEFAULT '{}'::jsonb, -- {bp, hr, temp, weight, height, bmi}
    symptoms TEXT,
    diagnosis TEXT,
    treatment TEXT,
    lab_results TEXT,
    imaging_results TEXT,
    notes TEXT,
    follow_up_required BOOLEAN NOT NULL DEFAULT false,
    follow_up_date DATE,
    is_confidential BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    created_by UUID NOT NULL
);

CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_appointment ON medical_records(appointment_id);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);

-- ==============================================
-- TABLE 9: prescriptions
-- Medication prescriptions and management
-- ==============================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    appointment_id UUID,
    medical_record_id UUID,
    prescription_date DATE NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{name, dosage, frequency, duration, instructions}]
    diagnosis TEXT,
    notes TEXT,
    is_dispensed BOOLEAN NOT NULL DEFAULT false,
    dispensed_at TIMESTAMP WITH TIME ZONE,
    dispensed_by UUID,
    valid_until DATE,
    is_repeatable BOOLEAN NOT NULL DEFAULT false,
    repeat_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    created_by UUID NOT NULL
);

CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_appointment ON prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_date ON prescriptions(prescription_date);

-- ==============================================
-- TABLE 10: payments
-- Billing and payment tracking
-- ==============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    appointment_id UUID,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'SGD',
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE,
    transaction_id VARCHAR(255),
    invoice_number VARCHAR(100) UNIQUE,
    description TEXT,
    chas_subsidy DECIMAL(10, 2) DEFAULT 0.00,
    insurance_claim DECIMAL(10, 2) DEFAULT 0.00,
    patient_paid DECIMAL(10, 2) NOT NULL,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    created_by UUID NOT NULL
);

CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- ==============================================
-- TABLE 11: notifications
-- System notifications and alerts
-- ==============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    notification_type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID, -- appointment_id, prescription_id, etc.
    related_type VARCHAR(50), -- appointment, prescription, etc.
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    email_sent BOOLEAN NOT NULL DEFAULT false,
    sms_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW())
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ==============================================
-- TABLE 12: documents
-- Medical document storage and management
-- ==============================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    uploaded_by UUID NOT NULL,
    appointment_id UUID,
    medical_record_id UUID,
    document_type VARCHAR(100) NOT NULL, -- lab-result, imaging, prescription, etc.
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL, -- bytes
    file_type VARCHAR(50) NOT NULL, -- pdf, jpg, png, etc.
    description TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW())
);

CREATE INDEX idx_documents_patient ON documents(patient_id);
CREATE INDEX idx_documents_appointment ON documents(appointment_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_created ON documents(created_at);

-- ==============================================
-- TABLE 13: audit_logs
-- Comprehensive audit trail for compliance
-- ==============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action audit_action NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW())
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ==============================================
-- TABLE 14: settings
-- System configuration and preferences
-- ==============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW())
);

-- Insert default settings
INSERT INTO settings (key, value, description, is_system) VALUES
    ('appointment_slot_duration', '30'::jsonb, 'Default appointment duration in minutes', true),
    ('appointment_buffer_time', '5'::jsonb, 'Buffer time between appointments in minutes', true),
    ('max_appointments_per_day', '20'::jsonb, 'Maximum appointments per doctor per day', true),
    ('reminder_hours_before', '24'::jsonb, 'Hours before appointment to send reminder', true),
    ('chas_subsidy_rates', '{"blue": 18.50, "orange": 10.50, "green": 5.00}'::jsonb, 'CHAS subsidy rates by card type', true),
    ('consultation_fee_default', '50.00'::jsonb, 'Default consultation fee in SGD', true);

-- ==============================================
-- TABLE 15: insurance
-- Patient insurance information
-- ==============================================
CREATE TABLE insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    policy_holder_name VARCHAR(255),
    policy_holder_relationship VARCHAR(50),
    coverage_type VARCHAR(100), -- hospitalization, outpatient, dental, etc.
    coverage_amount DECIMAL(10, 2),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore', NOW())
);

CREATE INDEX idx_insurance_patient ON insurance(patient_id);
CREATE INDEX idx_insurance_policy ON insurance(policy_number);
CREATE INDEX idx_insurance_active ON insurance(is_active);

-- ==============================================
-- Functions for automatic timestamp updates
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('Asia/Singapore', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_updated_at BEFORE UPDATE ON insurance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- Comments for documentation
-- ==============================================
COMMENT ON TABLE users IS 'Core user authentication and profile information';
COMMENT ON TABLE patients IS 'Patient demographic and medical information with Singapore NRIC validation';
COMMENT ON TABLE doctors IS 'Doctor profiles with medical licenses and specializations';
COMMENT ON TABLE appointments IS 'Appointment scheduling with Singapore date/time formats';
COMMENT ON TABLE medical_records IS 'Patient health records with comprehensive audit trails';
COMMENT ON TABLE prescriptions IS 'Medication prescriptions with clear labeling';
COMMENT ON TABLE payments IS 'Billing records with SGD currency and CHAS compatibility';
COMMENT ON TABLE audit_logs IS 'Comprehensive compliance and access tracking';
COMMENT ON TABLE notifications IS 'System messaging and appointment reminders';
COMMENT ON TABLE documents IS 'Medical document storage with security controls';
COMMENT ON TABLE insurance IS 'Patient insurance and CHAS card information';
COMMENT ON TABLE time_slots IS 'Doctor availability scheduling';
COMMENT ON TABLE specialties IS 'Medical specialization categories';
COMMENT ON TABLE clinics IS 'Clinic locations and operating hours';
COMMENT ON TABLE settings IS 'System configuration and preferences';
