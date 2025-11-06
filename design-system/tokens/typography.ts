/**
 * Gabriel Family Clinic - Typography Design Tokens
 * Elderly-friendly typography system with 18px base font size
 * 
 * Design Principles:
 * - 18px minimum base font size for elderly accessibility
 * - 1.5 minimum line height for readability
 * - Clear hierarchy with consistent scaling
 * - System fonts for performance and familiarity
 */

export const typography = {
  // Font Families
  fontFamily: {
    sans: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(", "),
    mono: [
      '"SF Mono"',
      '"Monaco"',
      '"Inconsolata"',
      '"Fira Code"',
      '"Droid Sans Mono"',
      '"Source Code Pro"',
      "monospace",
    ].join(", "),
  },

  // Font Sizes - Elderly-friendly scale starting at 18px
  fontSize: {
    xs: {
      size: "14px",
      lineHeight: "1.5",
      letterSpacing: "0.01em",
    },
    sm: {
      size: "16px",
      lineHeight: "1.5",
      letterSpacing: "0.01em",
    },
    base: {
      size: "18px", // Base size for elderly accessibility
      lineHeight: "1.5",
      letterSpacing: "0",
    },
    lg: {
      size: "20px",
      lineHeight: "1.5",
      letterSpacing: "0",
    },
    xl: {
      size: "24px",
      lineHeight: "1.4",
      letterSpacing: "-0.01em",
    },
    "2xl": {
      size: "30px",
      lineHeight: "1.4",
      letterSpacing: "-0.01em",
    },
    "3xl": {
      size: "36px",
      lineHeight: "1.3",
      letterSpacing: "-0.02em",
    },
    "4xl": {
      size: "48px",
      lineHeight: "1.2",
      letterSpacing: "-0.02em",
    },
    "5xl": {
      size: "60px",
      lineHeight: "1.1",
      letterSpacing: "-0.03em",
    },
  },

  // Font Weights
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  // Line Heights
  lineHeight: {
    tight: "1.2",
    snug: "1.375",
    normal: "1.5",   // Minimum for accessibility
    relaxed: "1.625",
    loose: "2",
  },

  // Letter Spacing
  letterSpacing: {
    tighter: "-0.03em",
    tight: "-0.02em",
    normal: "0",
    wide: "0.01em",
    wider: "0.02em",
    widest: "0.03em",
  },
} as const;

/**
 * Typography Component Presets
 * Pre-configured combinations for common UI elements
 */
export const typographyPresets = {
  // Headings - Prominent, clear hierarchy
  h1: {
    fontSize: typography.fontSize["4xl"].size,
    lineHeight: typography.fontSize["4xl"].lineHeight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.fontSize["4xl"].letterSpacing,
    color: "#0f172a", // neutral-900
  },
  h2: {
    fontSize: typography.fontSize["3xl"].size,
    lineHeight: typography.fontSize["3xl"].lineHeight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.fontSize["3xl"].letterSpacing,
    color: "#0f172a",
  },
  h3: {
    fontSize: typography.fontSize["2xl"].size,
    lineHeight: typography.fontSize["2xl"].lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.fontSize["2xl"].letterSpacing,
    color: "#0f172a",
  },
  h4: {
    fontSize: typography.fontSize.xl.size,
    lineHeight: typography.fontSize.xl.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.fontSize.xl.letterSpacing,
    color: "#0f172a",
  },
  h5: {
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.fontSize.lg.letterSpacing,
    color: "#0f172a",
  },
  h6: {
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.fontSize.base.letterSpacing,
    color: "#0f172a",
  },

  // Body Text
  body: {
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    color: "#0f172a",
  },
  bodyLarge: {
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    color: "#0f172a",
  },
  bodySmall: {
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    color: "#475569", // neutral-600
  },

  // UI Elements
  button: {
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.lineHeight.snug,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wide,
  },
  input: {
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
  },
  label: {
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.lineHeight.snug,
    fontWeight: typography.fontWeight.medium,
    color: "#1e293b", // neutral-800
  },
  caption: {
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    color: "#64748b", // neutral-500
  },

  // Healthcare-specific
  medicalLabel: {
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.lineHeight.tight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: "uppercase" as const,
    color: "#475569", // neutral-600
  },
  prescriptionText: {
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.lineHeight.relaxed,
    fontWeight: typography.fontWeight.normal,
    fontFamily: typography.fontFamily.mono,
  },
  appointmentTime: {
    fontSize: typography.fontSize.xl.size,
    lineHeight: typography.lineHeight.tight,
    fontWeight: typography.fontWeight.bold,
    color: "#1e40af", // primary-800
  },
} as const;

/**
 * Typography Utilities
 */
export const typographyUtils = {
  /**
   * Calculate line height in pixels for a given font size
   */
  calculateLineHeight: (fontSize: string, ratio: string): string => {
    const size = parseFloat(fontSize);
    const lineHeightRatio = parseFloat(ratio);
    return `${size * lineHeightRatio}px`;
  },

  /**
   * Get font size in rem units
   */
  toRem: (pxValue: string): string => {
    const px = parseFloat(pxValue);
    return `${px / 16}rem`;
  },

  /**
   * Ensure minimum font size for accessibility
   */
  enforceMinimumSize: (fontSize: string, minimum: number = 18): string => {
    const size = parseFloat(fontSize);
    return size < minimum ? `${minimum}px` : fontSize;
  },
} as const;

export type TypographyToken = typeof typography;
export type TypographyPreset = keyof typeof typographyPresets;
