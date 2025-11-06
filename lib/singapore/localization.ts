// Singapore Localization Utilities
// Gabriel Family Clinic Healthcare Platform

/**
 * Validate Singapore NRIC format
 * Format: XddddddX where X is a letter and d is a digit
 * First letter: S (citizen born before 2000), T (after 2000), F (foreigner before 2000), G (after 2000)
 */
export function validateNRIC(nric: string): boolean {
  if (!nric) return false;
  const nricPattern = /^[STFG]\d{7}[A-Z]$/;
  return nricPattern.test(nric);
}

/**
 * Validate Singapore phone number
 * Format: +65 XXXX XXXX
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  const phonePattern = /^\+65\s?\d{4}\s?\d{4}$/;
  return phonePattern.test(phone);
}

/**
 * Format Singapore phone number
 * Converts various formats to +65 XXXX XXXX
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Extract digits only
  const digits = cleaned.replace(/\D/g, '');
  
  // Handle different input formats
  if (digits.length === 8) {
    // Local format: XXXX XXXX
    return `+65 ${digits.substring(0, 4)} ${digits.substring(4)}`;
  } else if (digits.length === 10 && digits.startsWith('65')) {
    // With country code: 65XXXXXXXX
    return `+65 ${digits.substring(2, 6)} ${digits.substring(6)}`;
  } else if (cleaned.startsWith('+65') && digits.length === 10) {
    // Already formatted: +65XXXXXXXX
    return `+65 ${digits.substring(2, 6)} ${digits.substring(6)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Validate Singapore postal code
 * Format: 6 digits
 */
export function validatePostalCode(postalCode: string): boolean {
  if (!postalCode) return false;
  return /^\d{6}$/.test(postalCode);
}

/**
 * Format currency in Singapore Dollars (SGD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date in Singapore format (DD/MM/YYYY)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format time in 24-hour format (HH:MM)
 */
export function formatTime(time: string | Date): string {
  if (typeof time === 'string') {
    // If already in HH:MM format
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }
    // If in HH:MM:SS format
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time.substring(0, 5);
    }
    // If it's a date string
    time = new Date(time);
  }
  
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Format date and time in Singapore format
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} ${formatTime(d)}`;
}

/**
 * Get Singapore timezone
 */
export const SINGAPORE_TIMEZONE = 'Asia/Singapore';

/**
 * Convert date to Singapore timezone
 */
export function toSingaporeTime(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.toLocaleString('en-US', { timeZone: SINGAPORE_TIMEZONE }));
}

/**
 * Get current date/time in Singapore timezone
 */
export function nowInSingapore(): Date {
  return toSingaporeTime(new Date());
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = nowInSingapore();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Mask NRIC for privacy (show first and last character only)
 * Example: S8012345A -> S******A
 */
export function maskNRIC(nric: string): string {
  if (!nric || nric.length !== 9) return nric;
  return `${nric[0]}******${nric[8]}`;
}

/**
 * Mask phone number for privacy
 * Example: +65 9123 4567 -> +65 **** 4567
 */
export function maskPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\s/g, '');
  
  if (cleaned.startsWith('+65') && cleaned.length === 11) {
    return `+65 **** ${cleaned.substring(7)}`;
  }
  
  return phone;
}

/**
 * Singapore public holidays calendar (simplified version)
 */
export const SINGAPORE_PUBLIC_HOLIDAYS_2025 = [
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-01-29', name: 'Chinese New Year' },
  { date: '2025-01-30', name: 'Chinese New Year' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-05-01', name: 'Labour Day' },
  { date: '2025-05-12', name: 'Vesak Day' },
  { date: '2025-06-02', name: 'Hari Raya Puasa' },
  { date: '2025-08-09', name: 'National Day' },
  { date: '2025-08-09', name: 'Hari Raya Haji' },
  { date: '2025-10-20', name: 'Deepavali' },
  { date: '2025-12-25', name: 'Christmas Day' },
];

/**
 * Check if a date is a Singapore public holiday
 */
export function isPublicHoliday(date: Date | string): boolean {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return SINGAPORE_PUBLIC_HOLIDAYS_2025.some(holiday => holiday.date === dateStr);
}

/**
 * Get day of week in English
 */
export function getDayOfWeek(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
}
