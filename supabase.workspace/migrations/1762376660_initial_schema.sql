-- Migration: initial_schema
-- Created at: 1762376660

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
CREATE INDEX idx_users_is_active ON users(is_active);;