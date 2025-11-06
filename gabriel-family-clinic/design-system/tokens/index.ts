/**
 * Gabriel Family Clinic - Design System Tokens
 * Centralized export for all design tokens
 * 
 * This design system provides:
 * - WCAG AAA compliant colors (7:1 contrast)
 * - Elderly-friendly typography (18px base)
 * - Touch-friendly spacing (44px+ targets)
 * - Gentle, healthcare-appropriate animations
 * - Comprehensive accessibility utilities
 * - Singapore healthcare market localization
 */

export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./shadows";
export * from "./motion";
export * from "./accessibility";
export * from "./breakpoints";

import { colors, accessibleCombinations, colorUtils, type ColorToken } from "./colors";
import { typography, typographyPresets, typographyUtils, type TypographyToken } from "./typography";
import { spacing, spacingUtils, inset, stack, type SpacingToken } from "./spacing";
import { shadows, borders, type ShadowToken, type BorderToken } from "./shadows";
import { motion, motionUtils, reducedMotion, performance, type MotionToken } from "./motion";
import { accessibility, a11yValidation, type AccessibilityToken } from "./accessibility";
import { breakpoints, responsiveUtils, type Breakpoint } from "./breakpoints";

/**
 * Complete Design Token System
 */
export const designTokens = {
  colors,
  typography,
  spacing,
  shadows,
  borders,
  motion,
  accessibility,
  breakpoints,
} as const;

/**
 * Design System Utilities
 */
export const designUtils = {
  color: colorUtils,
  typography: typographyUtils,
  spacing: spacingUtils,
  motion: motionUtils,
  a11y: a11yValidation,
  responsive: responsiveUtils,
} as const;

/**
 * Preset Combinations
 */
export const presets = {
  typography: typographyPresets,
  colors: accessibleCombinations,
  spacing: { inset, stack },
  motion: { reduced: reducedMotion, performance },
} as const;

/**
 * Theme Configuration Helper
 */
export const createTheme = (overrides?: Partial<typeof designTokens>) => {
  return {
    ...designTokens,
    ...overrides,
  };
};

/**
 * Type Exports
 */
export type DesignTokens = typeof designTokens;
export type DesignUtils = typeof designUtils;
export type Presets = typeof presets;

export type {
  ColorToken,
  TypographyToken,
  SpacingToken,
  ShadowToken,
  BorderToken,
  MotionToken,
  AccessibilityToken,
  Breakpoint,
};
