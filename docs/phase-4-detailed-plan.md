# Phase 4: Database Schema & Backend Integration - Detailed Sub-Plan

## Overview
Phase 4 implements the complete Supabase backend infrastructure for the Gabriel Family Clinic healthcare platform, including comprehensive PostgreSQL database schema, security policies, and edge functions for healthcare operations.

## Phase 4 Objectives
1. Set up Supabase project with proper configuration
2. Implement complete healthcare database schema (15+ tables)
3. Create Row Level Security (RLS) policies for patient data protection
4. Build database views for common healthcare queries
5. Implement Supabase authentication with role-based access control
6. Create edge functions for healthcare workflows
7. Set up storage buckets for medical documents
8. Implement real-time subscriptions for live updates
9. Create audit logging system for healthcare compliance
10. Build database migrations and seed data for development

## Phase 4 Implementation Checklist

### 4.1 Supabase Project Setup
- [ ] Request Supabase credentials from user
- [ ] Set up Supabase project configuration
- [ ] Configure environment variables (.env.local)
- [ ] Install Supabase client libraries
- [ ] Set up database connection and testing
- [ ] Configure Supabase RLS policies
- [ ] Set up authentication providers
- [ ] Configure storage buckets
- [ ] Test Supabase connectivity

### 4.2 Healthcare Database Schema Implementation
- [ ] Create users table for authentication and roles
- [ ] Create patients table with demographic information
- [ ] Create doctors table with specializations
- [ ] Create appointments table with scheduling
- [ ] Create medical_records table for health history
- [ ] Create prescriptions table for medication management
- [ ] Create payments table for billing
- [ ] Create audit_logs table for compliance tracking
- [ ] Create notifications table for system messages
- [ ] Create documents table for medical file storage
- [ ] Create insurance table for CHAS compatibility
- [ ] Create time_slots table for appointment availability
- [ ] Create specialties table for doctor specializations
- [ ] Create clinics table for multi-location support
- [ ] Create settings table for system configuration

### 4.3 Row Level Security (RLS) Policies
- [ ] Enable RLS on all sensitive tables
- [ ] Create patient data access policies
- [ ] Create doctor access policies
- [ ] Create admin access policies
- [ ] Create appointment visibility policies
- [ ] Create medical record privacy policies
- [ ] Create prescription access policies
- [ ] Create audit log access policies
- [ ] Create notification privacy policies
- [ ] Test all RLS policies for security

### 4.4 Database Views and Functions
- [ ] Create patient dashboard view
- [ ] Create doctor schedule view
- [ ] Create appointment summary view
- [ ] Create medical history view
- [ ] Create payment summary view
- [ ] Create notification queue view
- [ ] Create audit trail view
- [ ] Create healthcare analytics view
- [ ] Create CHAS compatibility view
- [ ] Create Singapore localization view

### 4.5 Authentication and Authorization
- [ ] Configure Supabase Auth with email/password
- [ ] Set up role-based authentication (patient, doctor, admin)
- [ ] Create user registration with healthcare validation
- [ ] Implement session management with security
- [ ] Set up password policy and security requirements
- [ ] Create account recovery and password reset
- [ ] Implement two-factor authentication setup
- [ ] Create logout and session cleanup
- [ ] Test authentication flows
- [ ] Validate role-based access control

### 4.6 Edge Functions Development
- [ ] Create appointment booking function
- [ ] Create patient registration validation function
- [ ] Create medical record access function
- [ ] Create prescription management function
- [ ] Create notification delivery function
- [ ] Create audit logging function
- [ ] Create payment processing function
- [ ] Create healthcare analytics function
- [ ] Create email notification function
- [ ] Create CHAS integration function

### 4.7 Storage and File Management
- [ ] Create medical documents storage bucket
- [ ] Set up profile photos storage bucket
- [ ] Configure storage policies and security
- [ ] Implement file upload with validation
- [ ] Create document download with permissions
- [ ] Set up file sharing with healthcare teams
- [ ] Implement document versioning
- [ ] Create file backup and recovery
- [ ] Test storage security and access
- [ ] Validate file type restrictions

### 4.8 Real-time Subscriptions
- [ ] Set up appointment status real-time updates
- [ ] Implement patient dashboard live updates
- [ ] Create doctor notification real-time system
- [ ] Set up medical record change notifications
- [ ] Implement prescription status updates
- [ ] Create payment status real-time tracking
- [ ] Set up system notification real-time delivery
- [ ] Implement audit log real-time monitoring
- [ ] Test real-time subscription performance
- [ ] Validate real-time security policies

### 4.9 Audit Logging and Compliance
- [ ] Create comprehensive audit logging system
- [ ] Log all patient data access events
- [ ] Log all medical record interactions
- [ ] Log all appointment management activities
- [ ] Log all user authentication events
- [ ] Log all prescription management actions
- [ ] Log all payment processing activities
- [ ] Create audit log export functionality
- [ ] Set up audit log retention policies
- [ ] Validate audit log integrity

### 4.10 Database Migrations and Seed Data
- [ ] Create initial database migration scripts
- [ ] Create table creation migration files
- [ ] Create RLS policy migration files
- [ ] Create view and function migration files
- [ ] Create seed data for doctors and clinics
- [ ] Create sample patient data for testing
- [ ] Create appointment booking seed data
- [ ] Create medical record sample data
- [ ] Create user role seed data
- [ ] Create Singapore healthcare test data

## Detailed File Structure to Create

### Supabase Configuration
```
/workspace/gabriel-family-clinic/supabase/
├── config.toml                    # Supabase project configuration
├── .env.example                  # Environment variables template
├── migrations/
│   ├── 001_initial_schema.sql    # Create all tables
│   ├── 002_rls_policies.sql      # Row Level Security policies
│   ├── 003_views_and_functions.sql # Database views and functions
│   ├── 004_seed_data.sql         # Sample data for development
│   └── 005_indexes.sql           # Performance indexes
├── functions/
│   ├── appointment-processor/    # Edge function for appointments
│   │   └── index.ts
│   ├── patient-validator/        # Edge function for patient data
│   │   └── index.ts
│   ├── medical-records/          # Edge function for medical records
│   │   └── index.ts
│   ├── prescription-manager/     # Edge function for prescriptions
│   │   └── index.ts
│   ├── notification-sender/      # Edge function for notifications
│   │   └── index.ts
│   ├── audit-logger/             # Edge function for audit logs
│   │   └── index.ts
│   ├── payment-processor/        # Edge function for payments
│   │   └── index.ts
│   ├── email-notifications/      # Edge function for emails
│   │   └── index.ts
│   ├── chas-integration/         # Edge function for CHAS
│   │   └── index.ts
│   └── health-analytics/         # Edge function for analytics
│       └── index.ts
└── seed/
    ├── doctors.sql               # Doctor seed data
    ├── patients.sql              # Patient seed data
    ├── appointments.sql          # Appointment seed data
    ├── medical_records.sql       # Medical record seed data
    ├── prescriptions.sql         # Prescription seed data
    └── users.sql                 # User seed data
```

### Library and Configuration Files
```
/workspace/gabriel-family-clinic/lib/
├── supabase/
│   ├── client.ts                # Supabase client configuration
│   ├── auth.ts                  # Authentication utilities
│   ├── database.ts              # Database utilities
│   ├── storage.ts               # File storage utilities
│   ├── realtime.ts              # Real-time subscription utilities
│   ├── types.ts                 # Database type definitions
│   └── constants.ts             # Database constants
├── auth/
│   ├── auth-provider.tsx        # Authentication provider component
│   ├── protected-route.tsx      # Protected route component
│   ├── role-based-access.tsx    # Role-based access control
│   ├── session-manager.ts       # Session management utilities
│   └── auth-hooks.ts            # Authentication React hooks
├── healthcare/
│   ├── patient-utils.ts         # Patient-specific utilities
│   ├── doctor-utils.ts          # Doctor-specific utilities
│   ├── appointment-utils.ts     # Appointment utilities
│   ├── medical-record-utils.ts  # Medical record utilities
│   ├── prescription-utils.ts    # Prescription utilities
│   └── chas-utils.ts            # CHAS integration utilities
├── singapore/
│   ├── date-utils.ts            # Singapore date formatting
│   ├── phone-utils.ts           # Singapore phone validation
│   ├── address-utils.ts         # Singapore address formatting
│   ├── currency-utils.ts        # SGD currency formatting
│   └── localization.ts          # Singapore localization constants
└── compliance/
    ├── audit-logger.ts          # Audit logging utilities
    ├── privacy-protector.ts     # Patient privacy utilities
    ├── data-retention.ts        # Data retention utilities
    └── healthcare-compliance.ts # Healthcare compliance utilities
```

### Component Integration
```
/workspace/gabriel-family-clinic/components/
├── auth/
│   ├── sign-in-form.tsx         # Sign in form component
│   ├── sign-up-form.tsx         # Sign up form component
│   ├── password-reset.tsx       # Password reset component
│   ├── two-factor-setup.tsx     # 2FA setup component
│   └── auth-status.tsx          # Auth status display
├── healthcare/
│   ├── patient-form.tsx         # Patient registration form
│   ├── appointment-booking.tsx  # Appointment booking interface
│   ├── medical-record-viewer.tsx # Medical record display
│   ├── prescription-manager.tsx # Prescription management
│   └── doctor-schedule.tsx      # Doctor schedule interface
├── database/
│   ├── realtime-subscription.tsx # Real-time data subscription
│   ├── data-table.tsx           # Database table component
│   ├── file-upload.tsx          # File upload component
│   └── audit-log-display.tsx    # Audit log display
└── singapore/
    ├── singapore-form.tsx       # Singapore-specific form
    ├── singapore-address.tsx    # Singapore address component
    └── singapore-payment.tsx    # Singapore payment component
```

## Database Schema Specifications

### Core Tables

**users Table:**
```sql
- id: UUID (Primary Key)
- email: VARCHAR (Unique, Healthcare compliant)
- full_name: VARCHAR (Singapore naming)
- phone: VARCHAR (+65 format)
- role: ENUM ('patient', 'doctor', 'admin', 'staff')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- last_login: TIMESTAMP
- is_active: BOOLEAN
- two_factor_enabled: BOOLEAN
- audit_log: JSONB (Compliance tracking)
```

**patients Table:**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- nric: VARCHAR (Singapore NRIC format)
- date_of_birth: DATE
- gender: ENUM ('M', 'F', 'Other')
- address: TEXT (Singapore address format)
- emergency_contact: JSONB
- medical_history: JSONB
- allergies: JSONB
- current_medications: JSONB
- insurance_info: JSONB (CHAS compatibility)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- created_by: UUID (Audit trail)
```

**doctors Table:**
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- medical_license: VARCHAR (Singapore format)
- specialties: JSONB (Array of specialties)
- qualifications: JSONB
- experience_years: INTEGER
- languages: JSONB (English, Mandarin, Malay, Tamil)
- clinic_assignments: JSONB
- consultation_fee: DECIMAL (SGD)
- availability_schedule: JSONB
- is_available: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**appointments Table:**
```sql
- id: UUID (Primary Key)
- patient_id: UUID (Foreign Key to patients)
- doctor_id: UUID (Foreign Key to doctors)
- appointment_date: DATE (DD/MM/YYYY format)
- appointment_time: TIME (24-hour format)
- duration: INTEGER (minutes)
- appointment_type: ENUM ('consultation', 'follow-up', 'procedure', 'vaccination')
- status: ENUM ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')
- reason: TEXT (Healthcare reason)
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- created_by: UUID (Audit trail)
```

### Security and Compliance

**Row Level Security (RLS) Policies:**
- **Patient Data**: Only patient and authorized healthcare providers can access
- **Medical Records**: Strict access control with audit logging
- **Appointments**: Patient can see own, doctors can see assigned
- **Prescriptions**: Controlled access with prescription-specific permissions
- **Audit Logs**: Admin and compliance officers only

**Data Privacy Features:**
- **Patient Consent**: Explicit consent for data sharing
- **Data Retention**: Automated cleanup based on healthcare regulations
- **Access Logging**: All data access logged with user, timestamp, action
- **Data Export**: Patient data export functionality
- **Data Anonymization**: Analytics with anonymized data

### Singapore Healthcare Integration

**CHAS Compatibility:**
- CHAS card number validation
- Subsidized consultation rates
- Eligibility checking
- Subsidy calculation
- Claim processing integration

**Singapore Localization:**
- NRIC validation (XddddddX format)
- Postal code integration
- Singapore address format
- +65 phone number validation
- SGD currency formatting
- Singapore timezone (Asia/Singapore)

## Supabase Configuration Requirements

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Healthcare Compliance
NEXT_PUBLIC_CHAS_ENABLED=true
NEXT_PUBLIC_SINGAPORE_TIMEZONE=Asia/Singapore
NEXT_PUBLIC_HEALTHCARE_COMPLIANCE=HIPAA

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (for notifications)
RESEND_API_KEY=your_resend_api_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# File Storage
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx
```

### Supabase Configuration
- **Database**: PostgreSQL with RLS enabled
- **Auth**: Email/password with 2FA support
- **Storage**: Multiple buckets for different file types
- **Edge Functions**: Healthcare workflow processing
- **Real-time**: Live updates for appointments and notifications
- **API**: RESTful API with role-based access

## Success Criteria for Phase 4

### Database Implementation
- [ ] All 15+ tables created and functional
- [ ] RLS policies implemented and tested
- [ ] Database views created for common queries
- [ ] Indexes created for performance optimization
- [ ] Data integrity constraints enforced

### Security and Compliance
- [ ] Patient data privacy protected with RLS
- [ ] All data access logged with audit trails
- [ ] Role-based access control implemented
- [ ] Healthcare compliance standards met
- [ ] Singapore healthcare regulations followed

### Authentication and Authorization
- [ ] Supabase Auth integrated with email/password
- [ ] Role-based authentication working (patient, doctor, admin)
- [ ] Session management secure and functional
- [ ] Password policies and security enforced
- [ ] Account recovery and 2FA implemented

### Edge Functions and Storage
- [ ] All healthcare workflow functions deployed
- [ ] File storage configured with security policies
- [ ] Real-time subscriptions functional
- [ ] Notification system operational
- [ ] Audit logging comprehensive

### Testing and Validation
- [ ] Database connectivity tested
- [ ] Security policies validated
- [ ] Authentication flows tested
- [ ] Edge functions tested end-to-end
- [ ] Real-time features validated
- [ ] Healthcare compliance verified

## Phase 4 Deliverables

### Database Infrastructure
1. **Complete Healthcare Schema** - 15+ tables with relationships
2. **Security Policies** - RLS policies for data protection
3. **Database Views** - Optimized queries for common operations
4. **Edge Functions** - Healthcare workflow processing
5. **Storage Buckets** - Secure file storage for medical documents

### Authentication System
1. **User Management** - Registration, login, password reset
2. **Role-Based Access** - Patient, doctor, admin, staff roles
3. **Session Management** - Secure session handling
4. **Two-Factor Authentication** - Enhanced security
5. **Account Recovery** - Password reset functionality

### Healthcare Compliance
1. **Audit Logging** - Comprehensive access tracking
2. **Data Privacy** - Patient data protection
3. **CHAS Integration** - Singapore healthcare compatibility
4. **Singapore Localization** - Local formatting and validation
5. **Compliance Reporting** - Healthcare regulation compliance

### Integration and Testing
1. **Database Migrations** - Version-controlled schema changes
2. **Seed Data** - Sample data for development and testing
3. **Testing Suite** - Database testing and validation
4. **Documentation** - Database schema and API documentation
5. **Performance Optimization** - Query optimization and indexing

## Integration with Previous Phases

### Phase 1 Integration
- Build upon Next.js 14 project structure
- Enhance testing infrastructure with database testing
- Extend TypeScript configuration for database types
- Maintain accessibility infrastructure

### Phase 2 Integration
- Use design system tokens for all database display
- Implement accessibility utilities from Phase 2
- Apply healthcare theme throughout database interfaces
- Use animation tokens for database operations

### Phase 3 Integration
- Integrate components with database data
- Connect form components to database validation
- Link navigation components to user roles
- Connect overlay components to database operations

### Phase 4 Enhancement for Phase 5
- Database ready for complex healthcare workflows
- Authentication system prepared for application pages
- Audit system ready for user activity tracking
- Storage system ready for medical document handling

## Phase 5 Preparation

After completing Phase 4, the database infrastructure will enable:
1. **Complex Healthcare Workflows** - Full appointment management
2. **Patient Registration** - Complete patient onboarding
3. **Medical Record Management** - Secure health information access
4. **Doctor Dashboard** - Comprehensive practice management
5. **Payment Processing** - CHAS-compatible billing system

## Risk Mitigation

### Common Database Risks
- **Data Privacy Breaches**: Comprehensive RLS and audit logging
- **Performance Issues**: Proper indexing and query optimization
- **Security Vulnerabilities**: Regular security audits and updates
- **Compliance Violations**: Healthcare regulation monitoring

### Mitigation Strategies
- Regular security audits and penetration testing
- Automated compliance monitoring and alerting
- Database backup and disaster recovery procedures
- Healthcare user feedback and validation

This comprehensive sub-plan ensures Phase 4 delivers a robust, secure, and healthcare-compliant database infrastructure that supports the complete Gabriel Family Clinic healthcare platform while meeting Singapore healthcare regulations and elderly accessibility requirements.