# Supabase Backend - Quick Reference Guide

## Database Connection

```typescript
import { supabase } from '@/lib/supabase/client';
```

## Authentication

```typescript
// Sign in
const { data, error } = await signIn(email, password);

// Get current user
const user = await getCurrentUser();

// Sign out
await signOut();

// Check role
const isDoctor = await hasRole('doctor');
const isAdminOrStaff = await hasRole(['admin', 'staff']);
```

## Database Queries

```typescript
// Get appointments for a patient
const { data: appointments } = await supabase
  .from('appointments')
  .select('*')
  .eq('patient_id', patientId)
  .order('appointment_date', { ascending: false });

// Create medical record
const { data: record } = await supabase
  .from('medical_records')
  .insert({
    patient_id,
    doctor_id,
    record_date: new Date().toISOString().split('T')[0],
    chief_complaint,
    vital_signs,
    diagnosis,
    treatment,
    created_by: userId
  })
  .select()
  .maybeSingle();
```

## Edge Functions

```typescript
// Book appointment
const { data, error } = await supabase.functions.invoke('appointment-processor', {
  body: {
    action: 'create',
    appointmentData: {
      patient_id,
      doctor_id,
      clinic_id,
      appointment_date,
      appointment_time,
      duration: 30,
      appointment_type: 'consultation',
      reason: 'Health check-up'
    }
  }
});

// Validate patient data
const { data: validation } = await supabase.functions.invoke('patient-validator', {
  body: {
    patientData: {
      full_name,
      nric,
      phone,
      date_of_birth,
      gender,
      address,
      emergency_contact
    }
  }
});

// Send notification
await supabase.functions.invoke('notification-sender', {
  body: {
    notificationType: 'appointment-reminder',
    recipientId: patientId,
    data: {
      appointment_date,
      appointment_time,
      doctor_name,
      related_id: appointmentId,
      related_type: 'appointment'
    }
  }
});
```

## Singapore Utilities

```typescript
import {
  validateNRIC,
  validatePhone,
  formatCurrency,
  formatDate,
  formatTime,
  calculateAge
} from '@/lib/singapore/localization';

// Validate NRIC
if (!validateNRIC(nric)) {
  console.error('Invalid NRIC format');
}

// Format currency
const formattedAmount = formatCurrency(80.50); // "SGD 80.50"

// Format date
const formattedDate = formatDate(new Date()); // "06/11/2025"

// Calculate age
const age = calculateAge('1980-03-15'); // 45
```

## Healthcare Utilities

```typescript
import {
  calculateCHASSubsidy,
  calculatePatientPayment,
  calculateBMI,
  getBMICategory,
  validateVitalSigns
} from '@/lib/healthcare/chas-utils';

// Calculate CHAS subsidy
const subsidy = calculateCHASSubsidy('blue', 80.00); // 18.50

// Calculate patient payment
const patientPaid = calculatePatientPayment(80.00, 18.50, 0); // 61.50

// Calculate BMI
const bmi = calculateBMI(68.5, 162); // 26.1
const category = getBMICategory(bmi); // "Overweight"

// Validate vital signs
const { isValid, errors } = validateVitalSigns({
  bp: '135/85',
  hr: '78',
  temp: '36.5',
  weight: '68.5',
  height: '162'
});
```

## Storage Operations

```typescript
// Upload file to medical-documents bucket
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('medical-documents')
  .upload(`patient-${patientId}/${fileName}`, file);

// Get public URL
const { data: urlData } = supabase.storage
  .from('medical-documents')
  .getPublicUrl(`patient-${patientId}/${fileName}`);

// Download file
const { data: downloadData, error: downloadError } = await supabase.storage
  .from('medical-documents')
  .download(`patient-${patientId}/${fileName}`);
```

## Real-time Subscriptions

```typescript
// Subscribe to appointment updates
const subscription = supabase
  .channel('appointments')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'appointments',
    filter: `patient_id=eq.${patientId}`
  }, (payload) => {
    console.log('Appointment changed:', payload);
  })
  .subscribe();

// Unsubscribe when component unmounts
return () => {
  subscription.unsubscribe();
};
```

## Error Handling

```typescript
try {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .maybeSingle();

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch appointment');
  }

  if (!data) {
    throw new Error('Appointment not found');
  }

  return data;
} catch (error) {
  console.error('Error:', error);
  // Handle error appropriately
}
```

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://qqtaqfqowpkqapgrljmb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CHAS_ENABLED=true
NEXT_PUBLIC_SINGAPORE_TIMEZONE=Asia/Singapore
```

## Common Patterns

### Creating an Appointment
```typescript
const createAppointment = async (appointmentData) => {
  const { data, error } = await supabase.functions.invoke('appointment-processor', {
    body: {
      action: 'create',
      appointmentData
    }
  });

  if (error) throw error;
  return data.data;
};
```

### Fetching Patient Medical History
```typescript
const getMedicalHistory = async (patientId) => {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('record_date', { ascending: false });

  if (error) throw error;
  return data;
};
```

### Checking Doctor Availability
```typescript
const checkAvailability = async (doctorId, date) => {
  const { data: timeSlots } = await supabase
    .from('time_slots')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('day_of_week', new Date(date).getDay());

  const { data: appointments } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .in('status', ['scheduled', 'confirmed']);

  // Calculate available slots
  return calculateAvailableSlots(timeSlots, appointments);
};
```

## Tips & Best Practices

1. **Always use `.maybeSingle()` for single record queries** - Safer than `.single()`
2. **Include error handling** for all database operations
3. **Use Singapore timezone** for all date/time operations
4. **Validate NRIC and phone** before database insert
5. **Calculate CHAS subsidy** when creating payments
6. **Create audit logs** for sensitive data access
7. **Use edge functions** for complex business logic
8. **Enable RLS policies** - Already configured, respect them
9. **Format dates/currency** using Singapore utilities
10. **Test with real data** - Use seed data for development

## Edge Function URLs

- **appointment-processor**: `https://qqtaqfqowpkqapgrljmb.supabase.co/functions/v1/appointment-processor`
- **patient-validator**: `https://qqtaqfqowpkqapgrljmb.supabase.co/functions/v1/patient-validator`
- **notification-sender**: `https://qqtaqfqowpkqapgrljmb.supabase.co/functions/v1/notification-sender`
- **audit-logger**: `https://qqtaqfqowpkqapgrljmb.supabase.co/functions/v1/audit-logger`
- **medical-records**: `https://qqtaqfqowpkqapgrljmb.supabase.co/functions/v1/medical-records`

## Database Tables Reference

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| users | Authentication | id, email, role, full_name, phone |
| patients | Patient info | id, user_id, nric, date_of_birth, chas_card_number |
| doctors | Doctor profiles | id, user_id, medical_license, consultation_fee |
| appointments | Scheduling | id, patient_id, doctor_id, appointment_date, status |
| medical_records | Health history | id, patient_id, doctor_id, diagnosis, treatment |
| prescriptions | Medications | id, patient_id, doctor_id, medications, is_dispensed |
| payments | Billing | id, patient_id, amount, chas_subsidy, payment_status |
| notifications | Alerts | id, user_id, notification_type, message, is_read |
| audit_logs | Compliance | id, user_id, action, table_name, record_id |

For complete documentation, see: `/workspace/gabriel-family-clinic/docs/PHASE-4-COMPLETION-REPORT.md`
