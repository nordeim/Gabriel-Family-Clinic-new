/**
 * Gabriel Family Clinic - Design System
 * Centralized export for the complete design system
 * 
 * @version 2.0.0
 * @phase 2 of 9
 */

// Design Tokens
export * from "./tokens";
export { designTokens, designUtils, presets, createTheme } from "./tokens";

// Themes
export { healthcareTheme } from "./themes/healthcare";
export type { HealthcareTheme } from "./themes/healthcare";

// Utilities
export { designSystemUtils } from "./utilities";

// Re-export individual utilities for convenience
export {
  a11yUtils,
  colorUtils,
  spacingUtils,
  typographyUtils,
  animationUtils,
  layoutUtils,
  healthcareUtils,
} from "./utilities";

/**
 * Quick access to commonly used design system features
 */
export const ds = {
  // Tokens
  colors: {} as typeof import("./tokens").colors,
  typography: {} as typeof import("./tokens").typography,
  spacing: {} as typeof import("./tokens").spacing,
  motion: {} as typeof import("./tokens").motion,
  accessibility: {} as typeof import("./tokens").accessibility,
  
  // Utilities
  utils: {} as typeof import("./utilities").designSystemUtils,
  
  // Theme
  theme: {} as typeof import("./themes/healthcare").healthcareTheme,
} as const;

/**
 * Design System version and metadata
 */
export const designSystemMeta = {
  version: "2.0.0",
  phase: "2 of 9",
  name: "Gabriel Family Clinic Design System",
  description: "Healthcare-focused design system with WCAG AAA compliance and elderly accessibility",
  features: [
    "WCAG AAA compliant colors (7:1 contrast)",
    "Elderly-friendly typography (18px base)",
    "Touch-friendly spacing (44px+ targets)",
    "Gentle healthcare-appropriate animations",
    "Comprehensive accessibility utilities",
    "Singapore healthcare market localization",
  ],
  compliance: {
    wcag: "AAA",
    contrastRatio: "7:1",
    touchTargetMinimum: "44px",
    baseFontSize: "18px",
  },
} as const;

export default designSystemMeta;
