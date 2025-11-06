/**
 * Gabriel Family Clinic - Shadow Design Tokens
 * Elevation system for healthcare interfaces
 */

export const shadows = {
  // Elevation Scale
  none: "none",
  soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
  medium: "0 4px 16px rgba(0, 0, 0, 0.12)",
  elevated: "0 8px 24px rgba(0, 0, 0, 0.16)",
  high: "0 12px 32px rgba(0, 0, 0, 0.20)",
  highest: "0 20px 48px rgba(0, 0, 0, 0.24)",

  // Component-specific shadows
  button: {
    default: "0 1px 3px rgba(0, 0, 0, 0.12)",
    hover: "0 4px 12px rgba(0, 0, 0, 0.15)",
    active: "0 1px 2px rgba(0, 0, 0, 0.10)",
  },
  card: {
    default: "0 2px 8px rgba(0, 0, 0, 0.08)",
    hover: "0 4px 16px rgba(0, 0, 0, 0.12)",
  },
  modal: "0 20px 48px rgba(0, 0, 0, 0.24)",
  dropdown: "0 8px 24px rgba(0, 0, 0, 0.16)",
  tooltip: "0 4px 12px rgba(0, 0, 0, 0.15)",

  // Healthcare-specific
  medicalCard: "0 2px 8px rgba(30, 64, 175, 0.08)", // Blue tint
  prescription: "0 2px 8px rgba(16, 185, 129, 0.08)", // Emerald tint
  
  // Focus shadows (accessibility)
  focus: {
    primary: "0 0 0 3px rgba(37, 99, 235, 0.5)", // primary-600
    error: "0 0 0 3px rgba(220, 38, 38, 0.5)",   // red-600
    success: "0 0 0 3px rgba(16, 185, 129, 0.5)", // emerald-500
  },
} as const;

/**
 * Border Design Tokens
 */
export const borders = {
  // Border Widths
  width: {
    none: "0",
    thin: "1px",
    default: "2px",
    thick: "3px",
    heavy: "4px",
  },

  // Border Radius
  radius: {
    none: "0",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    full: "9999px",
  },

  // Border Colors (from color tokens)
  color: {
    default: "#e2e8f0",      // neutral-200
    hover: "#cbd5e1",        // neutral-300
    focus: "#2563eb",        // primary-600
    error: "#dc2626",        // red-600
    success: "#10b981",      // emerald-500
    warning: "#f59e0b",      // amber-500
  },

  // Border Styles
  style: {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
  },

  // Component-specific borders
  input: {
    default: "2px solid #e2e8f0",
    hover: "2px solid #cbd5e1",
    focus: "2px solid #2563eb",
    error: "2px solid #dc2626",
  },
  button: {
    default: "2px solid transparent",
    outlined: "2px solid #1e40af",
  },
  card: {
    default: "1px solid #e2e8f0",
    hover: "1px solid #cbd5e1",
  },
} as const;

export type ShadowToken = typeof shadows;
export type BorderToken = typeof borders;
