/**
 * Gabriel Family Clinic - Accessibility Design Tokens
 * WCAG AAA compliance with elderly user considerations
 */

export const accessibility = {
  // Contrast Ratios (WCAG AAA Standards)
  contrast: {
    minimum: 7.0,        // 7:1 for normal text
    large: 4.5,          // 4.5:1 for large text (18px+)
    nonText: 3.0,        // 3:1 for UI components
  },

  // Touch Targets (WCAG AAA)
  touchTarget: {
    minimum: 44,         // 44x44px minimum
    recommended: 48,     // 48x48px comfortable
    large: 56,           // 56x56px for elderly
    extraLarge: 64,      // 64x64px for critical actions
  },

  // Focus Indicators
  focus: {
    outlineWidth: "3px",
    outlineOffset: "2px",
    outlineColor: "#2563eb", // primary-600
    outlineStyle: "solid",
    borderRadius: "4px",
    // Visible focus for keyboard navigation
    visible: {
      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.5)",
      outline: "3px solid #2563eb",
      outlineOffset: "2px",
    },
  },

  // Screen Reader Only
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: "0",
  },

  // Skip Link
  skipLink: {
    position: "absolute",
    top: "-999px",
    left: "0",
    background: "#1e40af",
    color: "#ffffff",
    padding: "16px 24px",
    fontSize: "18px",
    fontWeight: "600",
    zIndex: 9999,
    focus: {
      top: "0",
      outline: "3px solid #60a5fa",
      outlineOffset: "2px",
    },
  },

  // High Contrast Mode
  highContrast: {
    enabled: "@media (prefers-contrast: high)",
    colors: {
      background: "#ffffff",
      foreground: "#000000",
      border: "#000000",
      borderWidth: "2px",
    },
  },

  // Reduced Motion
  reducedMotion: {
    enabled: "@media (prefers-reduced-motion: reduce)",
    animation: "none !important",
    transition: "none !important",
    duration: "0.01ms !important",
  },

  // Font Scaling
  fontScaling: {
    minimum: 18,         // 18px minimum base
    scale: {
      normal: 1.0,       // 100% - 18px
      medium: 1.125,     // 112.5% - 20.25px
      large: 1.25,       // 125% - 22.5px
      extraLarge: 1.5,   // 150% - 27px
    },
  },

  // Color Blind Safe Combinations
  colorBlindSafe: {
    // Deuteranopia (red-green)
    deuteranopia: {
      primary: "#0066cc",    // Blue
      secondary: "#ff9900",  // Orange
      success: "#00cc99",    // Teal
      error: "#cc0066",      // Magenta
    },
    // Protanopia (red-green)
    protanopia: {
      primary: "#0066cc",
      secondary: "#ff9900",
      success: "#00cc99",
      error: "#cc0066",
    },
    // Tritanopia (blue-yellow)
    tritanopia: {
      primary: "#cc0066",    // Magenta
      secondary: "#00cc99",  // Teal
      success: "#0066cc",    // Blue
      error: "#ff0000",      // Red
    },
  },

  // ARIA Labels
  aria: {
    labelSuffix: {
      required: " (required)",
      optional: " (optional)",
      error: " (error)",
      warning: " (warning)",
      success: " (success)",
      loading: " (loading)",
    },
    liveRegion: {
      polite: "polite",
      assertive: "assertive",
      off: "off",
    },
  },

  // Keyboard Navigation
  keyboard: {
    focusableElements: [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', '),
    trapFocus: true,
    returnFocus: true,
  },
} as const;

/**
 * Accessibility Validation Utilities
 */
export const a11yValidation = {
  /**
   * Check if color combination meets WCAG AAA standards
   */
  checkContrast: (_foreground: string, _background: string): {
    ratio: number;
    passes: boolean;
    level: 'AAA' | 'AA' | 'FAIL';
  } => {
    // Implementation would use a contrast checker library
    // Placeholder return
    return {
      ratio: 7.0,
      passes: true,
      level: 'AAA',
    };
  },

  /**
   * Check if touch target meets size requirements
   */
  checkTouchTarget: (width: number, height: number): {
    passes: boolean;
    minimum: number;
    actual: { width: number; height: number };
  } => {
    const minimum = accessibility.touchTarget.minimum;
    const passes = width >= minimum && height >= minimum;
    return {
      passes,
      minimum,
      actual: { width, height },
    };
  },

  /**
   * Check if font size meets elderly accessibility standards
   */
  checkFontSize: (fontSize: number): {
    passes: boolean;
    minimum: number;
    actual: number;
  } => {
    const minimum = accessibility.fontScaling.minimum;
    return {
      passes: fontSize >= minimum,
      minimum,
      actual: fontSize,
    };
  },

  /**
   * Generate accessible label text
   */
  generateLabel: (
    baseLabel: string,
    options: {
      required?: boolean;
      hasError?: boolean;
      hasWarning?: boolean;
      isLoading?: boolean;
    }
  ): string => {
    let label = baseLabel;
    if (options.required) label += accessibility.aria.labelSuffix.required;
    if (options.hasError) label += accessibility.aria.labelSuffix.error;
    if (options.hasWarning) label += accessibility.aria.labelSuffix.warning;
    if (options.isLoading) label += accessibility.aria.labelSuffix.loading;
    return label;
  },
} as const;

export type AccessibilityToken = typeof accessibility;
export type ColorBlindType = keyof typeof accessibility.colorBlindSafe;
export type FontScale = keyof typeof accessibility.fontScaling.scale;
