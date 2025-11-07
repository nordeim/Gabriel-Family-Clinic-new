-- Migration: phase6_security_tables
-- Created at: 1762382271

-- Phase 6: Enhanced Authentication & Security Tables
-- Gabriel Family Clinic Healthcare Platform

-- ============================================================================
-- Two-Factor Authentication
-- ============================================================================

CREATE TABLE IF NOT EXISTS two_factor_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL CHECK (method IN ('totp', 'sms')),
    secret TEXT, -- Encrypted TOTP secret
    phone_number VARCHAR(20), -- For SMS 2FA
    is_enabled BOOLEAN DEFAULT false,
    backup_codes TEXT[], -- Encrypted backup codes
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, method)
);

CREATE INDEX idx_2fa_user ON two_factor_auth(user_id);
CREATE INDEX idx_2fa_enabled ON two_factor_auth(is_enabled) WHERE is_enabled = true;

-- ============================================================================
-- Session Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_fingerprint TEXT,
    location JSONB, -- {city, country, coordinates}
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    terminated_at TIMESTAMPTZ,
    termination_reason TEXT
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- ============================================================================
-- Security Audit Log
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role VARCHAR(20),
    ip_address INET,
    user_agent TEXT,
    resource_type VARCHAR(50),
    resource_id UUID,
    action VARCHAR(50) NOT NULL,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON security_audit_log(user_id);
CREATE INDEX idx_audit_created ON security_audit_log(created_at DESC);
CREATE INDEX idx_audit_event_type ON security_audit_log(event_type);
CREATE INDEX idx_audit_resource ON security_audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_success ON security_audit_log(success);

-- ============================================================================
-- User Behavior Profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_behavior_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    typical_login_times INTEGER[], -- Hours of day (0-23)
    typical_ip_addresses INET[],
    typical_devices TEXT[],
    typical_locations JSONB[],
    access_patterns JSONB, -- Typical resource access patterns
    anomaly_threshold INTEGER DEFAULT 70 CHECK (anomaly_threshold BETWEEN 0 AND 100),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_behavior_user ON user_behavior_profiles(user_id);

-- ============================================================================
-- Security Incidents
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_users UUID[],
    affected_resources JSONB,
    detection_method VARCHAR(50),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_to UUID REFERENCES users(id),
    response_actions TEXT[],
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incidents_status ON security_incidents(status);
CREATE INDEX idx_incidents_severity ON security_incidents(severity);
CREATE INDEX idx_incidents_detected ON security_incidents(detected_at DESC);

-- ============================================================================
-- Failed Login Attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    failure_reason TEXT,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    lockout_until TIMESTAMPTZ
);

CREATE INDEX idx_failed_login_email ON failed_login_attempts(email);
CREATE INDEX idx_failed_login_ip ON failed_login_attempts(ip_address);
CREATE INDEX idx_failed_login_attempted ON failed_login_attempts(attempted_at DESC);

-- ============================================================================
-- Data Access Log (Healthcare-Specific)
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    patient_id UUID REFERENCES patients(id),
    resource_type VARCHAR(50) NOT NULL, -- 'medical_record', 'prescription', 'appointment', 'payment'
    resource_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'view', 'create', 'update', 'delete', 'export'
    purpose TEXT, -- Reason for access
    consent_verified BOOLEAN DEFAULT false,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_data_access_user ON data_access_log(user_id);
CREATE INDEX idx_data_access_patient ON data_access_log(patient_id);
CREATE INDEX idx_data_access_resource ON data_access_log(resource_type, resource_id);
CREATE INDEX idx_data_access_created ON data_access_log(created_at DESC);

-- ============================================================================
-- Compliance Reports
-- ============================================================================

CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL,
    framework VARCHAR(20) NOT NULL CHECK (framework IN ('PDPA', 'MOH', 'CHAS', 'CUSTOM')),
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    generated_by UUID NOT NULL REFERENCES users(id),
    report_data JSONB NOT NULL,
    file_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_type ON compliance_reports(report_type);
CREATE INDEX idx_compliance_framework ON compliance_reports(framework);
CREATE INDEX idx_compliance_created ON compliance_reports(created_at DESC);

-- ============================================================================
-- Security Settings
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default security settings
INSERT INTO security_settings (setting_key, setting_value, category, description) VALUES
    ('password_policy', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special": true, "max_age_days": 90, "prevent_reuse_count": 5}'::jsonb, 'authentication', 'Password complexity and rotation policy'),
    ('session_timeout', '{"patient_minutes": 30, "doctor_minutes": 60, "admin_minutes": 120}'::jsonb, 'session', 'Session timeout by role'),
    ('max_concurrent_sessions', '{"patient": 3, "doctor": 2, "admin": 2, "staff": 3}'::jsonb, 'session', 'Maximum concurrent sessions per role'),
    ('login_attempt_limit', '{"max_attempts": 5, "lockout_duration_minutes": 30}'::jsonb, 'authentication', 'Failed login attempt policy'),
    ('2fa_enforcement', '{"admin": true, "doctor": true, "patient": false, "staff": true}'::jsonb, 'authentication', 'Two-factor authentication requirements'),
    ('risk_thresholds', '{"low": 30, "medium": 60, "high": 80}'::jsonb, 'monitoring', 'Risk score thresholds for security alerts')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Two-Factor Auth RLS
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own 2FA settings"
    ON two_factor_auth FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own 2FA settings"
    ON two_factor_auth FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all 2FA settings"
    ON two_factor_auth FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

-- User Sessions RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
    ON user_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
    ON user_sessions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

-- Security Audit Log RLS
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
    ON security_audit_log FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'staff')
    ));

-- Security Incidents RLS
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage incidents"
    ON security_incidents FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

-- Data Access Log RLS
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access logs"
    ON data_access_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Patients can view access to their data"
    ON data_access_log FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM patients WHERE patients.user_id = auth.uid() AND patients.id = patient_id
    ));

CREATE POLICY "Admins can view all access logs"
    ON data_access_log FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'staff')
    ));

-- Compliance Reports RLS
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage compliance reports"
    ON compliance_reports FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'staff')
    ));

-- Security Settings RLS
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view security settings"
    ON security_settings FOR SELECT
    USING (true);

CREATE POLICY "Only admins can update security settings"
    ON security_settings FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

-- ============================================================================
-- Triggers for Updated Timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_two_factor_auth_updated_at BEFORE UPDATE ON two_factor_auth
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON security_incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at BEFORE UPDATE ON security_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;