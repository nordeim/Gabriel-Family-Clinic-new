import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles conditional classes and removes conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for Singapore timezone
 * @param date - Date to format
 * @param format - Format type: 'short', 'long', 'time'
 */
export function formatDateSG(
  date: Date | string,
  format: "short" | "long" | "time" = "short"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Singapore",
  };

  switch (format) {
    case "short":
      options.day = "2-digit";
      options.month = "2-digit";
      options.year = "numeric";
      return dateObj.toLocaleDateString("en-SG", options);
    case "long":
      options.weekday = "long";
      options.day = "numeric";
      options.month = "long";
      options.year = "numeric";
      return dateObj.toLocaleDateString("en-SG", options);
    case "time":
      options.hour = "2-digit";
      options.minute = "2-digit";
      return dateObj.toLocaleTimeString("en-SG", options);
    default:
      return dateObj.toLocaleDateString("en-SG");
  }
}

/**
 * Format currency for Singapore market
 * @param amount - Amount in SGD
 */
export function formatCurrencySGD(amount: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);
}

/**
 * Validate Singapore phone number
 * @param phone - Phone number to validate
 */
export function isValidSGPhone(phone: string): boolean {
  // Singapore phone numbers: +65 followed by 8 digits starting with 6, 8, or 9
  const sgPhoneRegex = /^(\+65|65)?[689]\d{7}$/;
  return sgPhoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Format Singapore phone number
 * @param phone - Phone number to format
 */
export function formatSGPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("65")) {
    return `+65 ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  return `+65 ${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
}

/**
 * Debounce function for search and input handlers
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Get initials from a full name
 * @param name - Full name
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
