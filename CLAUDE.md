# CLAUDE.md - Gabriel Family Clinic Healthcare Platform
**Technical Briefing for AI Coding Agents**

---

## 🚀 Quick Start Commands

```bash
# Essential setup commands
git clone <repo-url>
cd gabriel-family-clinic
npm install
cp .env.example .env.local
npm run dev
```

**Critical Prerequisites:**
- Node.js 20.x or higher (check: `node --version`)
- npm 9.x or higher
- Supabase account and project setup

**Environment Variables (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://qqtaqfqowpkqapgrljmb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk
```

**Application Access:**
- Development: http://localhost:3000
- Patient Portal: http://localhost:3000/auth/signin
- Doctor Portal: http://localhost:3000/doctor/dashboard
- Admin Portal: http://localhost:3000/admin/dashboard

---

## 🏗️ Technical Architecture Overview

### Core Technology Stack
- **Frontend**: Next.js 14.2.22 (App Router) + TypeScript 5.x
- **Backend**: Supabase (PostgreSQL 15.x + Edge Functions + Auth + Storage)
- **UI**: Tailwind CSS 3.4.1 + Radix UI + Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + Testing Library + Playwright + axe-core
- **Deployment**: Vercel (frontend) + Supabase (backend)

### Database Architecture (15 Tables)
```
Core User Tables:
├── users (authentication, role-based access)
├── patients (demographics, CHAS, NRIC)
├── doctors (medical license, specialties, fees)
├── insurance (CHAS cards, coverage types)

Healthcare Core:
├── appointments (booking, status, scheduling)
├── time_slots (doctor availability)
├── medical_records (diagnoses, treatment)
├── prescriptions (medications, dosage)
├── specialties (medical specializations)

Operations:
├── payments (CHAS subsidies, billing)
├── notifications (email/SMS alerts)
├── documents (medical files, images)
├── audit_logs (compliance tracking)
├── settings (system configuration)
├── clinics (location, operating hours)
```

### Backend API (10 Edge Functions)
```typescript
supabase/functions/
├── appointment-processor/     // Booking logic, availability
├── patient-validator/         // NRIC validation, eligibility
├── payment-processor/         // CHAS calculations, billing
├── medical-records/          // Patient history access
├── prescription-manager/     // Medication management
├── chas-integration/         // Subsidy processing
├── notification-sender/      // Email/SMS alerts
├── audit-logger/            // Access tracking
├── security-monitor/        // Security alerts
└── two-factor-auth/         // 2FA implementation
```

---

## 📁 Critical File Structure & Key Modification Points

### 🎯 Primary Application Files
```
app/
├── page.tsx                    # Homepage (public landing)
├── layout.tsx                  # Root layout + metadata
├── globals.css                 # Global styles (18px base font)
│
├── auth/                       # Authentication flow
│   ├── signin/page.tsx         # User login
│   ├── signup/page.tsx         # User registration
│   └── profile-setup/page.tsx  # User onboarding
│
├── patient/                    # Patient portal
│   ├── page.tsx                # Patient dashboard
│   ├── appointments/           # Book/view appointments
│   ├── records/                # Medical history
│   ├── payments/               # Billing, CHAS
│   └── profile/                # Patient data
│
├── doctor/                     # Doctor portal
│   ├── page.tsx                # Doctor dashboard
│   ├── appointments/           # Schedule management
│   ├── patients/               # Patient list
│   └── prescriptions/          # Medication management
│
├── admin/                      # Admin portal
│   ├── page.tsx                # Admin dashboard
│   ├── users/                  # User management
│   ├── system/                 # System settings
│   └── security/               # Security monitoring
│
└── api/                        # API routes (if needed)
```

### 🔧 Core Configuration Files
```
├── next.config.js              # Next.js configuration
├── instrumentation.ts          # Server-side polyfills
├── package.json               # Dependencies, scripts
├── tailwind.config.ts         # CSS framework config
├── tsconfig.json              # TypeScript settings
├── jest.config.js             # Testing configuration
├── playwright.config.ts       # E2E testing config
└── vercel.json                # Deployment configuration
```

### 🛠️ Library & Utility Files
```
lib/
├── supabase/
│   ├── client.ts               # Browser client setup
│   ├── server.ts               # Server client setup
│   └── auth.ts                 # Auth utilities
├── types/                      # TypeScript definitions
│   └── database.ts             # DB schema types
├── healthcare/
│   ├── chas-utils.ts           # CHAS calculation logic
│   ├── nric-validation.ts     # Singapore NRIC validation
│   └── singapore/             # Localization utilities
├── compliance/
│   ├── audit.ts               # Healthcare compliance
│   └── privacy.ts             # Data protection
├── seo/                       # SEO optimization
├── auth/                      # Authentication helpers
└── utils.ts                   # General utilities
```

### 🎨 UI Components Structure
```
components/
├── ui/                        # Base UI components (Radix)
│   ├── button.tsx
│   ├── dialog.tsx
│   └── input.tsx
├── forms/                     # Form components
│   ├── input.tsx              # Text input
│   ├── phone-input.tsx        # Singapore phone format
│   ├── date-picker.tsx        # Date selection
│   ├── select.tsx             # Dropdown
│   └── textarea.tsx
├── healthcare/                # Healthcare-specific components
├── layout/                    # Layout components
├── navigation/                # Navigation components
└── data/                      # Data display
    └── card.tsx               # Healthcare cards
```

### 🎨 Design System Files
```
design-system/
├── tokens/
│   ├── colors.ts              # Healthcare color palette
│   ├── typography.ts          # 18px base font system
│   ├── accessibility.ts       # WCAG AAA compliance
│   ├── spacing.ts             # 44px+ touch targets
│   └── breakpoints.ts         # Responsive design
├── themes/
│   └── healthcare.ts          # Healthcare theme
└── utilities/                 # Design utilities
```

---

## 🏥 Healthcare-Specific Implementation

### 💳 CHAS (Community Health Assist Scheme) Integration
**Key File**: `lib/healthcare/chas-utils.ts`

```typescript
// CHAS Card Types and Subsidies
const CHAS_RATES = {
  blue: { consultation: 18.50, followUp: 12.50 },
  orange: { consultation: 11.00, followUp: 5.00 },
  green: { consultation: 7.50, followUp: 3.50 }
};

// Usage Example:
const calculateCHASSubsidy = (cardType, serviceType, amount) => {
  const subsidy = CHAS_RATES[cardType]?.[serviceType] || 0;
  return { subsidy, patientPays: amount - subsidy };
};
```

**Database Storage**:
- `patients.chas_card_number` (VARCHAR)
- `patients.chas_card_type` (ENUM: 'blue', 'orange', 'green')

**Edge Function**: `supabase/functions/chas-integration/index.ts`

### 🆔 NRIC Validation & Privacy
**Key File**: `lib/healthcare/nric-validation.ts`

```typescript
// Singapore NRIC Validation
const validateNRIC = (nric: string): boolean => {
  const pattern = /^[STFG]\d{7}[A-Z]$/;
  return pattern.test(nric);
};

// NRIC Privacy Masking
const maskNRIC = (nric: string): string => {
  if (nric.length === 9) {
    return `${nric[0]}****${nric.slice(-4)}`; // S****567D
  }
  return nric;
};
```

**Database Storage**:
- `patients.nric` (VARCHAR(9)) - Encrypted at rest
- Display: Always masked except in healthcare provider context

### 📞 Singapore Phone Validation
**Key File**: `lib/healthcare/phone-validation.ts`

```typescript
// Singapore Mobile Format
const validateSingaporePhone = (phone: string): boolean => {
  const pattern = /^(\+65|65)?[689]\d{7}$/;
  return pattern.test(phone.replace(/\s/g, ''));
};

const formatPhone = (phone: string): string => {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 8) {
    return `+65 ${clean.slice(0, 4)} ${clean.slice(4)}`;
  }
  return phone;
};
```

**Database Storage**: `users.phone` (VARCHAR(20)) - Singapore format: +65 XXXX XXXX

---

## 🔐 Security & Compliance Implementation

### 🛡️ Row Level Security (RLS) Policies
**Location**: `supabase/migrations/002_rls_policies.sql`

```sql
-- Example: Patient can only access their own data
CREATE POLICY "patients_access_own_data"
ON medical_records FOR ALL
TO authenticated
USING (
  auth.uid() = patient_id
  AND EXISTS (
    SELECT 1 FROM patients 
    WHERE user_id = auth.uid() 
    AND id = medical_records.patient_id
  )
);

-- Example: Doctor can only access assigned patients
CREATE POLICY "doctors_access_assigned_patients"
ON medical_records FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'doctor'
  )
  AND EXISTS (
    SELECT 1 FROM appointments 
    WHERE patient_id = medical_records.patient_id 
    AND doctor_id = auth.uid()
  )
);
```

### 📊 Audit Logging Implementation
**Key File**: `lib/compliance/audit.ts`

```typescript
// Log sensitive data access
const logDataAccess = async (
  table: string,
  action: 'create' | 'read' | 'update' | 'delete',
  recordId: string,
  userId: string
) => {
  await supabase
    .from('audit_logs')
    .insert({
      table_name: table,
      record_id: recordId,
      user_id: userId,
      action: action,
      timestamp: new Date().toISOString(),
      ip_address: getClientIP()
    });
};
```

**Audit Tables**: `audit_logs` tracks all sensitive data access

### 🔒 Environment Security
**Production Security Headers** (in `next.config.js`):
```javascript
securityHeaders: [
  'X-DNS-Prefetch-Control: on',
  'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: SAMEORIGIN',
  'X-XSS-Protection: 1; mode=block',
  'Referrer-Policy: strict-origin-when-cross-origin'
]
```

---

## ⚡ Development Workflow & Commands

### 🏃‍♂️ Essential Development Commands
```bash
# Core Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Code quality check

# Type Checking
npm run type-check            # TypeScript validation

# Code Formatting
npm run format                # Prettier formatting
npm run format:check          # Check formatting
```

### 🧪 Testing Commands
```bash
# Test Suites
npm run test                  # Jest tests (watch mode)
npm run test:ci               # CI mode with coverage
npm run test:e2e              # Playwright E2E tests
npm run test:e2e:ui           # E2E tests with UI
npm run test:accessibility    # WCAG AAA compliance
npm run test:healthcare       # Healthcare-specific tests
npm run test:security         # Security tests
npm run test:all              # Run all tests

# Healthcare-Specific Testing
npm run chas:validate         # Validate CHAS calculations
npm run nric:validate         # Validate NRIC formats
npm run audit:check           # Security audit
```

### 🗄️ Database Commands
```bash
# Supabase CLI Commands
supabase start                # Start local Supabase
supabase db reset            # Reset local database
supabase migration new <name> # Create migration
supabase db push             # Push to production
supabase functions deploy    # Deploy edge functions
```

### 🚀 Deployment Commands
```bash
# Build and Deploy
npm run build                 # Production build
npm run vercel-build         # Vercel deployment build
vercel --prod                # Deploy to Vercel
```

---

## 🗃️ Database Schema & Key Tables

### 📊 Core Tables with Key Fields

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,           -- +65 XXXX XXXX
  role user_role NOT NULL,              -- patient, doctor, admin, staff
  is_active BOOLEAN NOT NULL DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Singapore', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Singapore', NOW())
);
```

#### patients
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,                -- FK to users
  nric VARCHAR(9) UNIQUE NOT NULL,      -- S1234567D (encrypted)
  date_of_birth DATE NOT NULL,
  gender gender_type NOT NULL,          -- M, F, Other
  address TEXT NOT NULL,
  chas_card_number VARCHAR(50),         -- CHAS card number
  chas_card_type VARCHAR(20),           -- blue, orange, green
  allergies TEXT[] DEFAULT '{}',
  chronic_conditions TEXT[] DEFAULT '{}',
  emergency_contact JSONB DEFAULT '{}'  -- {name, relationship, phone}
);
```

#### appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,             -- FK to patients
  doctor_id UUID NOT NULL,              -- FK to doctors
  clinic_id UUID NOT NULL,              -- FK to clinics
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration INTEGER NOT NULL,            -- minutes
  appointment_type appointment_type NOT NULL, -- consultation, follow-up
  status appointment_status NOT NULL,   -- scheduled, confirmed, completed
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### payments
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,             -- FK to patients
  appointment_id UUID,                  -- FK to appointments
  original_amount DECIMAL(10,2) NOT NULL,
  subsidy_amount DECIMAL(10,2) DEFAULT 0,  -- CHAS subsidy
  final_amount DECIMAL(10,2) NOT NULL,     -- Patient pays
  payment_method payment_method NOT NULL,
  status payment_status NOT NULL,
  chas_card_type VARCHAR(20),           -- blue, orange, green
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🔍 Key Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_nric ON patients(nric);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

## 🌐 API Endpoints & Edge Functions

### 🔌 Edge Functions (Supabase Functions)
**Base URL**: `https://qqtaqfqowpkqapgrljmb.supabase.co/functions/v1/`

#### appointment-processor
```typescript
// POST /appointment-processor
{
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "appointment_date": "2025-11-15",
  "appointment_time": "14:30",
  "appointment_type": "consultation"
}
```

#### patient-validator
```typescript
// POST /patient-validator
{
  "patient_id": "uuid",
  "action": "validate_nric", // validate_nric, verify_chas, check_eligibility
  "nric": "S1234567D"
}
```

#### chas-integration
```typescript
// POST /chas-integration
{
  "chas_card_type": "blue",
  "service_type": "consultation",
  "original_amount": 150.00,
  "patient_nric": "S1234567D"
}

// Response
{
  "original_amount": 150.00,
  "subsidy_amount": 18.50,
  "patient_pays": 131.50,
  "chas_card_type": "blue"
}
```

#### payment-processor
```typescript
// POST /payment-processor
{
  "patient_id": "uuid",
  "appointment_id": "uuid",
  "payment_method": "chas", // cash, credit-card, insurance, chas
  "amount": 131.50,
  "chas_card_type": "blue"
}
```

#### medical-records
```typescript
// GET /medical-records/:patient_id
// RLS enforced - doctor can only access assigned patients

// Response
{
  "patient_id": "uuid",
  "records": [
    {
      "date": "2025-11-06",
      "diagnosis": "Hypertension",
      "treatment": "Lisinopril 10mg daily",
      "doctor_name": "Dr. Smith"
    }
  ]
}
```

### 🔐 Authentication Flow
```typescript
// Client-side authentication
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Check user role
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

// Route based on role
const getDashboardRoute = (role: string) => {
  switch (role) {
    case 'patient': return '/patient';
    case 'doctor': return '/doctor';
    case 'admin': return '/admin';
    default: return '/';
  }
};
```

---

## 🎨 UI Components & Design System

### 🎯 Healthcare-Specific Components

#### Button Component
**File**: `components/ui/button.tsx`
```typescript
// Elderly-friendly design: 44px+ touch targets, 18px+ text
<Button 
  size="lg" 
  className="min-h-[72px] text-xl px-12"
  variant="primary" // primary, secondary, outline
>
  Book Appointment
</Button>
```

#### Form Components
**File**: `components/forms/phone-input.tsx`
```typescript
// Singapore phone format validation
<input
  type="tel"
  value={phone}
  onChange={formatPhone}
  placeholder="+65 9123 4567"
  className="text-lg min-h-[48px]"
/>
```

#### Healthcare Card
**File**: `components/data/card.tsx`
```typescript
// Medical information cards
<Card className="p-8">
  <CardHeader>
    <CardTitle className="text-2xl">Patient Information</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <label className="text-lg font-medium">NRIC</label>
        <p className="text-lg">S****567D</p> {/* Masked for privacy */}
      </div>
    </div>
  </CardContent>
</Card>
```

### 🎨 Design Tokens for Healthcare
**File**: `design-system/tokens/colors.ts`
```typescript
export const healthcareColors = {
  // Professional blue for trust
  primary: '#1E40AF',        // Main brand color
  primaryLight: '#3B82F6',   // Hover states
  
  // Emerald for health indicators
  success: '#10B981',        // Success states
  successLight: '#34D399',   // Light success
  
  // Warm neutrals for comfort
  background: '#F8FAFC',     // Page backgrounds
  surface: '#FFFFFF',        // Card backgrounds
  
  // High contrast for accessibility (7:1 ratio)
  textPrimary: '#111827',    // Main text
  textSecondary: '#6B7280',  // Secondary text
  
  // Alert colors
  error: '#EF4444',          // Error states
  warning: '#F59E0B',        // Warning states
  info: '#3B82F6'            // Information
};
```

**File**: `design-system/tokens/typography.ts`
```typescript
export const healthcareTypography = {
  // Elderly-friendly font sizes
  base: '18px',              // Base font size (not 16px)
  lg: '20px',                // Large text
  xl: '24px',                // Headings
  '2xl': '30px',             // Page titles
  '3xl': '36px',             // Hero text
  
  // Line height for readability
  leading: '1.5',            // 150% line height
  
  // Touch targets
  touchTarget: '44px',       // Minimum touch target
  touchTargetLarge: '64px',  // Large touch targets
};
```

---

## 🧪 Testing Implementation

### 🏥 Healthcare-Specific Test Cases

#### CHAS Subsidy Testing
**File**: `tests/healthcare/chas.test.ts`
```typescript
describe('CHAS Integration', () => {
  test('calculates Blue card subsidy correctly', () => {
    const result = calculateCHASSubsidy('blue', 'consultation', 150.00);
    expect(result.subsidy).toBe(18.50);
    expect(result.patientPays).toBe(131.50);
  });
  
  test('validates CHAS card format', () => {
    const isValid = validateCHASCard('BJ12345A');
    expect(isValid).toBe(true);
  });
});
```

#### NRIC Validation Testing
**File**: `tests/healthcare/nric.test.ts`
```typescript
describe('NRIC Validation', () => {
  test('validates correct NRIC format', () => {
    const isValid = validateNRIC('S1234567D');
    expect(isValid).toBe(true);
  });
  
  test('masks NRIC for privacy', () => {
    const masked = maskNRIC('S1234567D');
    expect(masked).toBe('S****567D');
  });
  
  test('rejects invalid NRIC format', () => {
    const isValid = validateNRIC('X1234567D');
    expect(isValid).toBe(false);
  });
});
```

### ♿ Accessibility Testing
**File**: `tests/accessibility/accessibility.test.ts`
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('homepage has no accessibility violations', async () => {
  const { container } = render(<HomePage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test('all interactive elements are keyboard accessible', () => {
  // Test Tab navigation, Enter key, Escape key
});
```

---

## 🚀 Deployment & Production Considerations

### 🏗️ Build Process
```bash
# Production build with optimizations
npm run build

# Output structure
.next/
├── server/                  # Server-side rendered pages
├── static/                  # Static assets
├── media/                   # Optimized images
└── typescript/              # Type definitions
```

### 🔧 Next.js Configuration for Production
**File**: `next.config.js`
```javascript
module.exports = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    unoptimized: true,       // Required for Supabase
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920]
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          'Strict-Transport-Security: max-age=63072000',
          'X-Content-Type-Options: nosniff',
          'X-Frame-Options: SAMEORIGIN'
        ]
      }
    ];
  },
  
  // Bundle optimization
  webpack: (config) => {
    config.optimization.splitChunks.chunks = 'all';
    return config;
  }
};
```

### 🌐 Environment-Specific Configurations
```bash
# Development (.env.local)
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000

# Production (.env.production)
NODE_ENV=production
NEXTAUTH_URL=https://gabrielfamilyclinic.sg
NEXTAUTH_SECRET=secure_random_string

# Supabase (same for dev/prod)
NEXT_PUBLIC_SUPABASE_URL=https://qqtaqfqowpkqapgrljmb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔍 Troubleshooting Guide

### 🚨 Common Issues & Solutions

#### 1. "ReferenceError: self is not defined"
**Problem**: Supabase trying to access browser globals during SSR
**Solution**: `instrumentation.ts` already provides polyfills
```typescript
// Check instrumentation.ts
import './lib/server-polyfill.js'; // This should be present
```

#### 2. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

#### 3. TypeScript Errors
```bash
# Type checking
npm run type-check
npx tsc --noEmit          # Detailed type checking
```

#### 4. Supabase Connection Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://YOUR_PROJECT.supabase.co/rest/v1/users"
```

#### 5. Database Migration Issues
```bash
# Reset local database
supabase db reset
supabase migration up
```

### 🔧 Development Utilities
```bash
# Check bundle size
npm run build && npx @next/bundle-analyzer

# Database introspection
supabase gen types typescript --local > lib/types/database.ts

# Lint specific files
npx eslint app/page.tsx --fix
npx prettier --write components/
```

---

## 📋 Development Checklist

### ✅ Before Making Changes
- [ ] **Environment Setup**
  - [ ] Node.js 20.x installed
  - [ ] Environment variables configured
  - [ ] Supabase project accessible
  - [ ] Database migrations applied

- [ ] **Code Quality**
  - [ ] TypeScript compilation passes
  - [ ] ESLint checks pass
  - [ ] Tests pass (unit, integration, E2E)
  - [ ] Accessibility tests pass
  - [ ] Healthcare compliance verified

### ✅ Healthcare-Specific Considerations
- [ ] **Data Privacy**
  - [ ] NRIC always masked in UI
  - [ ] Medical data encrypted at rest
  - [ ] Audit logging implemented
  - [ ] RLS policies enforced

- [ ] **Singapore Compliance**
  - [ ] CHAS calculations correct
  - [ ] NRIC validation implemented
  - [ ] Phone number formatting
  - [ ] Timezone set to Asia/Singapore
  - [ ] Currency in SGD

### ✅ Testing Requirements
- [ ] **Unit Tests** (90%+ coverage)
  - [ ] CHAS calculation logic
  - [ ] NRIC validation
  - [ ] Singapore phone formatting
  - [ ] Authentication flow
  - [ ] RLS policy logic

- [ ] **Integration Tests**
  - [ ] Database operations
  - [ ] Edge function calls
  - [ ] Payment processing
  - [ ] Medical record access

- [ ] **E2E Tests**
  - [ ] Patient booking flow
  - [ ] Doctor appointment management
  - [ ] Admin system management
  - [ ] CHAS payment processing

### ✅ Security & Compliance
- [ ] **Data Protection**
  - [ ] No sensitive data in logs
  - [ ] Audit logging complete
  - [ ] Row Level Security active
  - [ ] Input validation implemented

- [ ] **Access Control**
  - [ ] Role-based access working
  - [ ] API endpoints secured
  - [ ] Session management secure
  - [ ] 2FA available (optional)

---

## 🎯 Common Development Tasks

### 📝 Adding a New Healthcare Feature
1. **Database**: Add tables/fields in migration
2. **Types**: Update TypeScript definitions
3. **API**: Create/modify edge function
4. **UI**: Build React components
5. **Tests**: Write unit, integration, E2E tests
6. **Compliance**: Implement audit logging
7. **Security**: Add RLS policies

### 🏥 Singapore Localization
1. **Add validation**: NRIC, phone, postal code
2. **Currency**: Format amounts in SGD
3. **Timezone**: Use Asia/Singapore
4. **Language**: Support English (default)
5. **CHAS**: Update subsidy calculations
6. **Testing**: Verify all Singapore-specific features

### 🔐 Security Implementation
1. **RLS Policies**: Secure database access
2. **Input Validation**: Sanitize all inputs
3. **Audit Logging**: Track sensitive operations
4. **Authentication**: Verify user identity
5. **Authorization**: Check permissions
6. **Testing**: Security penetration tests

---

**Document Version**: 1.0.0  
**Last Updated**: November 7, 2025  
**Project Status**: Production Ready  
**Next.js Version**: 14.2.22  
**Supabase Version**: Latest  
**Node.js Requirement**: 20.x+  

---

*This briefing document provides comprehensive technical context for AI coding agents working on the Gabriel Family Clinic healthcare platform. For additional details, refer to the main README.md and system architecture documentation.*
