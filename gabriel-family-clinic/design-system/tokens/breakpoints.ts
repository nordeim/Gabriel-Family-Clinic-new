/**
 * Gabriel Family Clinic - Breakpoint Design Tokens
 * Mobile-first responsive system for Singapore healthcare market
 */

export const breakpoints = {
  // Breakpoint Values (px)
  values: {
    xs: 0,
    sm: 640,     // Mobile landscape
    md: 768,     // Tablet portrait
    lg: 1024,    // Tablet landscape / Small desktop
    xl: 1280,    // Desktop
    "2xl": 1536, // Large desktop
  },

  // Media Queries
  mediaQueries: {
    xs: "@media (min-width: 0px)",
    sm: "@media (min-width: 640px)",
    md: "@media (min-width: 768px)",
    lg: "@media (min-width: 1024px)",
    xl: "@media (min-width: 1280px)",
    "2xl": "@media (min-width: 1536px)",
  },

  // Max-width queries (mobile-first)
  maxWidth: {
    xs: "@media (max-width: 639px)",
    sm: "@media (max-width: 767px)",
    md: "@media (max-width: 1023px)",
    lg: "@media (max-width: 1279px)",
    xl: "@media (max-width: 1535px)",
  },

  // Range queries
  only: {
    xs: "@media (max-width: 639px)",
    sm: "@media (min-width: 640px) and (max-width: 767px)",
    md: "@media (min-width: 768px) and (max-width: 1023px)",
    lg: "@media (min-width: 1024px) and (max-width: 1279px)",
    xl: "@media (min-width: 1280px) and (max-width: 1535px)",
    "2xl": "@media (min-width: 1536px)",
  },

  // Container Max Widths
  container: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Touch Device Detection
  touch: "@media (hover: none) and (pointer: coarse)",
  mouse: "@media (hover: hover) and (pointer: fine)",

  // Orientation
  portrait: "@media (orientation: portrait)",
  landscape: "@media (orientation: landscape)",

  // High DPI (Retina displays)
  retina: "@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)",
} as const;

/**
 * Responsive Utilities
 */
export const responsiveUtils = {
  /**
   * Get current breakpoint based on window width
   */
  getCurrentBreakpoint: (width: number): keyof typeof breakpoints.values => {
    if (width >= breakpoints.values["2xl"]) return "2xl";
    if (width >= breakpoints.values.xl) return "xl";
    if (width >= breakpoints.values.lg) return "lg";
    if (width >= breakpoints.values.md) return "md";
    if (width >= breakpoints.values.sm) return "sm";
    return "xs";
  },

  /**
   * Check if current viewport matches breakpoint
   */
  matches: (breakpoint: keyof typeof breakpoints.values): boolean => {
    if (typeof window === "undefined") return false;
    const width = window.innerWidth;
    return width >= breakpoints.values[breakpoint];
  },

  /**
   * Generate responsive value
   */
  responsive: <T>(values: Partial<Record<keyof typeof breakpoints.values, T>>): T | undefined => {
    if (typeof window === "undefined") return values.xs;
    
    const width = window.innerWidth;
    const breakpoint = responsiveUtils.getCurrentBreakpoint(width);
    
    // Return the value for current breakpoint or fall back to smaller
    return (
      values[breakpoint] ||
      values.xl ||
      values.lg ||
      values.md ||
      values.sm ||
      values.xs
    );
  },
} as const;

export type Breakpoint = keyof typeof breakpoints.values;
export type BreakpointToken = typeof breakpoints;
