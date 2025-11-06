// Healthcare Utilities
// Gabriel Family Clinic - CHAS and Medical Utilities

/**
 * CHAS (Community Health Assist Scheme) card types and subsidies
 */
export const CHAS_CARD_TYPES = {
  BLUE: 'blue',
  ORANGE: 'orange',
  GREEN: 'green',
} as const;

export type CHASCardType = typeof CHAS_CARD_TYPES[keyof typeof CHAS_CARD_TYPES];

/**
 * CHAS subsidy rates (in SGD)
 */
export const CHAS_SUBSIDY_RATES = {
  [CHAS_CARD_TYPES.BLUE]: 18.50,
  [CHAS_CARD_TYPES.ORANGE]: 10.50,
  [CHAS_CARD_TYPES.GREEN]: 5.00,
};

/**
 * Calculate CHAS subsidy amount
 */
export function calculateCHASSubsidy(
  cardType: string | null,
  consultationFee: number
): number {
  if (!cardType) return 0;
  
  const subsidyRate = CHAS_SUBSIDY_RATES[cardType.toLowerCase() as CHASCardType] || 0;
  
  // Subsidy cannot exceed consultation fee
  return Math.min(subsidyRate, consultationFee);
}

/**
 * Calculate patient's out-of-pocket amount
 */
export function calculatePatientPayment(
  consultationFee: number,
  chasSubsidy: number = 0,
  insuranceClaim: number = 0
): number {
  const totalSubsidy = chasSubsidy + insuranceClaim;
  const patientPaid = Math.max(0, consultationFee - totalSubsidy);
  
  return parseFloat(patientPaid.toFixed(2));
}

/**
 * Blood types
 */
export const BLOOD_TYPES = [
  'O+', 'O-', 
  'A+', 'A-', 
  'B+', 'B-', 
  'AB+', 'AB-'
] as const;

export type BloodType = typeof BLOOD_TYPES[number];

/**
 * Appointment types
 */
export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow-up',
  PROCEDURE: 'procedure',
  VACCINATION: 'vaccination',
  HEALTH_SCREENING: 'health-screening',
} as const;

/**
 * Appointment statuses
 */
export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;

/**
 * Get status color for UI display
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case APPOINTMENT_STATUSES.SCHEDULED:
      return 'blue';
    case APPOINTMENT_STATUSES.CONFIRMED:
      return 'green';
    case APPOINTMENT_STATUSES.IN_PROGRESS:
      return 'yellow';
    case APPOINTMENT_STATUSES.COMPLETED:
      return 'gray';
    case APPOINTMENT_STATUSES.CANCELLED:
      return 'red';
    case APPOINTMENT_STATUSES.NO_SHOW:
      return 'orange';
    default:
      return 'gray';
  }
}

/**
 * Calculate BMI (Body Mass Index)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  
  return parseFloat(bmi.toFixed(1));
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 23) return 'Normal';
  if (bmi < 27.5) return 'Overweight';
  return 'Obese';
}

/**
 * Common medical specialties in Singapore
 */
export const MEDICAL_SPECIALTIES = [
  'General Practice',
  'Pediatrics',
  'Internal Medicine',
  'Geriatrics',
  'Family Medicine',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Gynecology',
  'Psychiatry',
  'Neurology',
  'Ophthalmology',
  'ENT (Ear, Nose, Throat)',
] as const;

/**
 * Validate vital signs
 */
export function validateVitalSigns(vitalSigns: {
  bp?: string;
  hr?: string;
  temp?: string;
  weight?: string;
  height?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Blood Pressure validation (format: XXX/XX)
  if (vitalSigns.bp && !/^\d{2,3}\/\d{2,3}$/.test(vitalSigns.bp)) {
    errors.push('Blood pressure must be in format XXX/XX (e.g., 120/80)');
  }

  // Heart Rate validation (40-200 bpm)
  if (vitalSigns.hr) {
    const hr = parseInt(vitalSigns.hr);
    if (isNaN(hr) || hr < 40 || hr > 200) {
      errors.push('Heart rate must be between 40 and 200 bpm');
    }
  }

  // Temperature validation (35-42°C)
  if (vitalSigns.temp) {
    const temp = parseFloat(vitalSigns.temp);
    if (isNaN(temp) || temp < 35 || temp > 42) {
      errors.push('Temperature must be between 35°C and 42°C');
    }
  }

  // Weight validation (1-300 kg)
  if (vitalSigns.weight) {
    const weight = parseFloat(vitalSigns.weight);
    if (isNaN(weight) || weight < 1 || weight > 300) {
      errors.push('Weight must be between 1 and 300 kg');
    }
  }

  // Height validation (30-250 cm)
  if (vitalSigns.height) {
    const height = parseFloat(vitalSigns.height);
    if (isNaN(height) || height < 30 || height > 250) {
      errors.push('Height must be between 30 and 250 cm');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format medical record for display
 */
export function formatMedicalRecord(record: Record<string, unknown>): string {
  const parts: string[] = [];

  if (record.chief_complaint) {
    parts.push(`Chief Complaint: ${record.chief_complaint}`);
  }

  if (record.diagnosis) {
    parts.push(`Diagnosis: ${record.diagnosis}`);
  }

  if (record.treatment) {
    parts.push(`Treatment: ${record.treatment}`);
  }

  return parts.join('\n');
}
