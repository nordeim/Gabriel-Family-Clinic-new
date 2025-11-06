/**
 * Gabriel Family Clinic - Spacing Design Tokens
 * Touch-friendly spacing system with 44px+ minimum touch targets
 * 
 * Design Principles:
 * - 4px base unit for consistent rhythm
 * - 44px+ minimum touch targets for elderly users
 * - Clear visual hierarchy through spacing
 * - Generous white space for readability
 */

export const spacing = {
  // Base Spacing Scale (4px increments)
  scale: {
    0: "0px",
    1: "4px",    // 0.25rem
    2: "8px",    // 0.5rem
    3: "12px",   // 0.75rem
    4: "16px",   // 1rem
    5: "20px",   // 1.25rem
    6: "24px",   // 1.5rem
    7: "28px",   // 1.75rem
    8: "32px",   // 2rem
    9: "36px",   // 2.25rem
    10: "40px",  // 2.5rem
    11: "44px",  // 2.75rem - Minimum touch target
    12: "48px",  // 3rem
    14: "56px",  // 3.5rem
    16: "64px",  // 4rem
    20: "80px",  // 5rem
    24: "96px",  // 6rem
    28: "112px", // 7rem
    32: "128px", // 8rem
    36: "144px", // 9rem
    40: "160px", // 10rem
    44: "176px", // 11rem
    48: "192px", // 12rem
    52: "208px", // 13rem
    56: "224px", // 14rem
    60: "240px", // 15rem
    64: "256px", // 16rem
    72: "288px", // 18rem
    80: "320px", // 20rem
    96: "384px", // 24rem
  },

  // Touch Target Sizes (Healthcare-specific)
  touchTarget: {
    minimum: "44px",     // WCAG AAA minimum
    standard: "48px",    // Comfortable tap target
    large: "56px",       // Large touch target for elderly
    extraLarge: "64px",  // Extra large for important actions
  },

  // Component-Specific Spacing
  button: {
    paddingX: {
      sm: "16px",
      md: "24px",
      lg: "32px",
    },
    paddingY: {
      sm: "8px",
      md: "12px",
      lg: "16px",
    },
    minHeight: "44px",   // Touch target minimum
    gap: "8px",          // Icon-text gap
  },

  input: {
    paddingX: "16px",
    paddingY: "12px",
    minHeight: "44px",   // Touch target minimum
    gap: "8px",
  },

  card: {
    padding: {
      sm: "16px",
      md: "24px",
      lg: "32px",
    },
    gap: {
      sm: "8px",
      md: "16px",
      lg: "24px",
    },
  },

  form: {
    fieldGap: "24px",    // Gap between form fields
    labelGap: "8px",     // Gap between label and input
    sectionGap: "32px",  // Gap between form sections
    submitGap: "32px",   // Gap before submit button
  },

  layout: {
    containerPadding: {
      mobile: "16px",
      tablet: "24px",
      desktop: "32px",
    },
    sectionGap: {
      sm: "32px",
      md: "48px",
      lg: "64px",
      xl: "80px",
    },
    gridGap: {
      sm: "16px",
      md: "24px",
      lg: "32px",
    },
  },

  // Healthcare-Specific Spacing
  healthcare: {
    appointmentCard: {
      padding: "24px",
      gap: "16px",
    },
    prescriptionLabel: {
      padding: "16px",
      gap: "12px",
    },
    patientInfo: {
      padding: "24px",
      gap: "16px",
    },
    medicalRecord: {
      padding: "32px",
      gap: "24px",
    },
  },
} as const;

/**
 * Spacing Utilities
 */
export const spacingUtils = {
  /**
   * Ensure minimum touch target size
   */
  enforceTouchTarget: (size: string): string => {
    const sizeNum = parseFloat(size);
    const minTouch = parseFloat(spacing.touchTarget.minimum);
    return sizeNum < minTouch ? spacing.touchTarget.minimum : size;
  },

  /**
   * Convert px to rem
   */
  toRem: (pxValue: string): string => {
    const px = parseFloat(pxValue);
    return `${px / 16}rem`;
  },

  /**
   * Get responsive spacing based on viewport
   */
  getResponsiveSpacing: (
    mobile: string,
    tablet: string,
    desktop: string
  ): Record<string, string> => {
    return {
      "@media (max-width: 767px)": mobile,
      "@media (min-width: 768px) and (max-width: 1023px)": tablet,
      "@media (min-width: 1024px)": desktop,
    };
  },

  /**
   * Calculate grid gap for given columns
   */
  getGridGap: (columns: number): string => {
    if (columns <= 2) return spacing.layout.gridGap.lg;
    if (columns <= 4) return spacing.layout.gridGap.md;
    return spacing.layout.gridGap.sm;
  },
} as const;

/**
 * Inset Spacing (Padding)
 * Pre-configured padding values for common patterns
 */
export const inset = {
  none: "0",
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",

  // Asymmetric insets
  squish: {
    sm: "8px 12px",   // Vertical smaller than horizontal
    md: "12px 16px",
    lg: "16px 24px",
  },
  stretch: {
    sm: "12px 8px",   // Vertical larger than horizontal
    md: "16px 12px",
    lg: "24px 16px",
  },
} as const;

/**
 * Stack Spacing (Gap)
 * Pre-configured gap values for flex/grid layouts
 */
export const stack = {
  none: "0",
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
} as const;

export type SpacingToken = typeof spacing;
export type TouchTargetSize = keyof typeof spacing.touchTarget;
export type InsetSize = keyof typeof inset;
export type StackSize = keyof typeof stack;
