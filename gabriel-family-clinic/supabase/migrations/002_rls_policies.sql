-- Gabriel Family Clinic - Row Level Security Policies
-- Migration 002: RLS Policies
-- Created: 2025-11-06
-- Description: Comprehensive security policies for patient data protection

-- ==============================================
-- Enable RLS on all tables
-- ==============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- Helper function to get current user's role
-- ==============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value
    FROM users
    WHERE id = auth.uid();
    
    RETURN user_role_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- RLS POLICIES: users table
-- ==============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (id = auth.uid());

-- Admins and staff can view all users
CREATE POLICY "Admin staff view all users" ON users
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (id = auth.uid());

-- Admins can insert new users
CREATE POLICY "Admin can insert users" ON users
    FOR INSERT
    WITH CHECK (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() = 'admin'
    );

-- ==============================================
-- RLS POLICIES: patients table
-- ==============================================

-- Patients can view their own data
CREATE POLICY "Patients view own data" ON patients
    FOR SELECT
    USING (user_id = auth.uid());

-- Doctors can view their assigned patients
CREATE POLICY "Doctors view assigned patients" ON patients
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() = 'doctor'
        AND id IN (
            SELECT patient_id FROM appointments WHERE doctor_id IN (
                SELECT id FROM doctors WHERE user_id = auth.uid()
            )
        )
    );

-- Admin and staff can view all patients
CREATE POLICY "Admin staff view all patients" ON patients
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- Patients can update their own data
CREATE POLICY "Patients update own data" ON patients
    FOR UPDATE
    USING (user_id = auth.uid());

-- Admin and staff can insert patients
CREATE POLICY "Admin staff insert patients" ON patients
    FOR INSERT
    WITH CHECK (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- Admin and staff can update any patient
CREATE POLICY "Admin staff update patients" ON patients
    FOR UPDATE
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- ==============================================
-- RLS POLICIES: doctors table
-- ==============================================

-- All authenticated users can view doctors
CREATE POLICY "All users view doctors" ON doctors
    FOR SELECT
    USING (auth.role() IN ('anon', 'service_role'));

-- Doctors can update their own profile
CREATE POLICY "Doctors update own profile" ON doctors
    FOR UPDATE
    USING (user_id = auth.uid());

-- Admin can insert and manage doctors
CREATE POLICY "Admin manage doctors" ON doctors
    FOR ALL
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() = 'admin'
    );

-- ==============================================
-- RLS POLICIES: appointments table
-- ==============================================

-- Patients can view their own appointments
CREATE POLICY "Patients view own appointments" ON appointments
    FOR SELECT
    USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

-- Doctors can view their assigned appointments
CREATE POLICY "Doctors view assigned appointments" ON appointments
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    );

-- Admin and staff can view all appointments
CREATE POLICY "Admin staff view all appointments" ON appointments
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- Patients can create their own appointments
CREATE POLICY "Patients create appointments" ON appointments
    FOR INSERT
    WITH CHECK (
        auth.role() IN ('anon', 'service_role')
        AND patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

-- Admin and staff can create any appointment
CREATE POLICY "Admin staff create appointments" ON appointments
    FOR INSERT
    WITH CHECK (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- Patients can update their own appointments (before confirmed)
CREATE POLICY "Patients update own appointments" ON appointments
    FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
        AND status = 'scheduled'
    );

-- Doctors can update their assigned appointments
CREATE POLICY "Doctors update assigned appointments" ON appointments
    FOR UPDATE
    USING (
        auth.role() IN ('anon', 'service_role')
        AND doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    );

-- Admin and staff can update any appointment
CREATE POLICY "Admin staff update appointments" ON appointments
    FOR UPDATE
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- ==============================================
-- RLS POLICIES: medical_records table
-- ==============================================

-- Patients can view their own medical records
CREATE POLICY "Patients view own records" ON medical_records
    FOR SELECT
    USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

-- Doctors can view records for their patients
CREATE POLICY "Doctors view patient records" ON medical_records
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND (
            doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
            OR patient_id IN (
                SELECT patient_id FROM appointments WHERE doctor_id IN (
                    SELECT id FROM doctors WHERE user_id = auth.uid()
                )
            )
        )
    );

-- Admin and staff can view all records
CREATE POLICY "Admin staff view all records" ON medical_records
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- Doctors can create medical records
CREATE POLICY "Doctors create records" ON medical_records
    FOR INSERT
    WITH CHECK (
        auth.role() IN ('anon', 'service_role')
        AND doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    );

-- Doctors can update their own records
CREATE POLICY "Doctors update own records" ON medical_records
    FOR UPDATE
    USING (
        auth.role() IN ('anon', 'service_role')
        AND doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    );

-- ==============================================
-- RLS POLICIES: prescriptions table
-- ==============================================

-- Patients can view their own prescriptions
CREATE POLICY "Patients view own prescriptions" ON prescriptions
    FOR SELECT
    USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

-- Doctors can view prescriptions they issued
CREATE POLICY "Doctors view issued prescriptions" ON prescriptions
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    );

-- Admin and staff can view all prescriptions
CREATE POLICY "Admin staff view all prescriptions" ON prescriptions
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- Doctors can create prescriptions
CREATE POLICY "Doctors create prescriptions" ON prescriptions
    FOR INSERT
    WITH CHECK (
        auth.role() IN ('anon', 'service_role')
        AND doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    );

-- Staff can update prescriptions (dispensing)
CREATE POLICY "Staff update prescriptions" ON prescriptions
    FOR UPDATE
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- ==============================================
-- RLS POLICIES: payments table
-- ==============================================

-- Patients can view their own payments
CREATE POLICY "Patients view own payments" ON payments
    FOR SELECT
    USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

-- Admin and staff can view all payments
CREATE POLICY "Admin staff view all payments" ON payments
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- Admin and staff can manage payments
CREATE POLICY "Admin staff manage payments" ON payments
    FOR ALL
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- ==============================================
-- RLS POLICIES: notifications table
-- ==============================================

-- Users can view their own notifications
CREATE POLICY "Users view own notifications" ON notifications
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users update own notifications" ON notifications
    FOR UPDATE
    USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System create notifications" ON notifications
    FOR INSERT
    WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- ==============================================
-- RLS POLICIES: documents table
-- ==============================================

-- Patients can view their own documents
CREATE POLICY "Patients view own documents" ON documents
    FOR SELECT
    USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

-- Doctors can view documents for their patients
CREATE POLICY "Doctors view patient documents" ON documents
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND patient_id IN (
            SELECT patient_id FROM appointments WHERE doctor_id IN (
                SELECT id FROM doctors WHERE user_id = auth.uid()
            )
        )
    );

-- Admin and staff can view all documents
CREATE POLICY "Admin staff view all documents" ON documents
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- Doctors and staff can upload documents
CREATE POLICY "Doctors staff upload documents" ON documents
    FOR INSERT
    WITH CHECK (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('doctor', 'admin', 'staff')
    );

-- ==============================================
-- RLS POLICIES: audit_logs table
-- ==============================================

-- Only admin can view audit logs
CREATE POLICY "Admin view audit logs" ON audit_logs
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() = 'admin'
    );

-- System can create audit logs
CREATE POLICY "System create audit logs" ON audit_logs
    FOR INSERT
    WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- ==============================================
-- RLS POLICIES: insurance table
-- ==============================================

-- Patients can view their own insurance
CREATE POLICY "Patients view own insurance" ON insurance
    FOR SELECT
    USING (
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

-- Admin and staff can view all insurance
CREATE POLICY "Admin staff view all insurance" ON insurance
    FOR SELECT
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- Admin and staff can manage insurance
CREATE POLICY "Admin staff manage insurance" ON insurance
    FOR ALL
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() IN ('admin', 'staff')
    );

-- ==============================================
-- RLS POLICIES: time_slots table
-- ==============================================

-- All authenticated users can view time slots
CREATE POLICY "All users view time slots" ON time_slots
    FOR SELECT
    USING (auth.role() IN ('anon', 'service_role'));

-- Doctors can manage their own time slots
CREATE POLICY "Doctors manage own slots" ON time_slots
    FOR ALL
    USING (
        auth.role() IN ('anon', 'service_role')
        AND doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
    );

-- Admin can manage all time slots
CREATE POLICY "Admin manage all slots" ON time_slots
    FOR ALL
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() = 'admin'
    );

-- ==============================================
-- RLS POLICIES: specialties table
-- ==============================================

-- All users can view specialties
CREATE POLICY "All users view specialties" ON specialties
    FOR SELECT
    USING (auth.role() IN ('anon', 'service_role'));

-- Only admin can manage specialties
CREATE POLICY "Admin manage specialties" ON specialties
    FOR ALL
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() = 'admin'
    );

-- ==============================================
-- RLS POLICIES: clinics table
-- ==============================================

-- All users can view clinics
CREATE POLICY "All users view clinics" ON clinics
    FOR SELECT
    USING (auth.role() IN ('anon', 'service_role'));

-- Only admin can manage clinics
CREATE POLICY "Admin manage clinics" ON clinics
    FOR ALL
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() = 'admin'
    );

-- ==============================================
-- RLS POLICIES: settings table
-- ==============================================

-- All authenticated users can view settings
CREATE POLICY "All users view settings" ON settings
    FOR SELECT
    USING (auth.role() IN ('anon', 'service_role'));

-- Only admin can update settings
CREATE POLICY "Admin update settings" ON settings
    FOR ALL
    USING (
        auth.role() IN ('anon', 'service_role')
        AND get_user_role() = 'admin'
    );

-- ==============================================
-- Comments
-- ==============================================
COMMENT ON POLICY "Users can view own profile" ON users IS 'Allow users to view their own profile information';
COMMENT ON POLICY "Patients view own data" ON patients IS 'Patients can only view their own medical information';
COMMENT ON POLICY "Doctors view assigned patients" ON patients IS 'Doctors can view patients they have appointments with';
COMMENT ON POLICY "Patients view own appointments" ON appointments IS 'Patients can view their own appointment history';
COMMENT ON POLICY "Admin view audit logs" ON audit_logs IS 'Only administrators can access audit logs for compliance';
