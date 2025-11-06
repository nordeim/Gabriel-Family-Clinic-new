/**
 * Gabriel Family Clinic - Healthcare Theme
 * Production theme with WCAG AAA compliance and elderly-friendly settings
 */

import { designTokens } from "../tokens";

const { colors, typography, spacing, shadows, borders, motion, accessibility } = designTokens;

export const healthcareTheme = {
  name: "healthcare",
  
  // Color Palette
  colors: {
    // Brand Colors
    primary: colors.primary[800],
    primaryLight: colors.primary[100],
    primaryDark: colors.primary[900],
    
    secondary: colors.emerald[500],
    secondaryLight: colors.emerald[100],
    secondaryDark: colors.emerald[700],
    
    // Semantic Colors
    success: colors.semantic.success.DEFAULT,
    warning: colors.semantic.warning.DEFAULT,
    error: colors.semantic.error.DEFAULT,
    info: colors.semantic.info.DEFAULT,
    
    // Neutral Colors
    background: colors.neutral[50],
    surface: "#ffffff",
    border: colors.neutral[200],
    text: colors.neutral[900],
    textSecondary: colors.neutral[600],
    textTertiary: colors.neutral[500],
    
    // Healthcare-Specific
    emergency: colors.healthcare.emergency,
    urgent: colors.healthcare.urgent,
    routine: colors.healthcare.routine,
    prescription: colors.healthcare.prescription,
  },
  
  // Typography
  typography: {
    fontFamily: typography.fontFamily.sans,
    fontSize: {
      base: "18px",  // Elderly-friendly minimum
      ...Object.fromEntries(
        Object.entries(typography.fontSize).map(([key, value]) => [
          key,
          value.size,
        ])
      ),
    },
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
  },
  
  // Spacing
  spacing: spacing.scale,
  touchTarget: spacing.touchTarget,
  
  // Shadows
  shadows: {
    sm: shadows.soft,
    md: shadows.medium,
    lg: shadows.elevated,
    xl: shadows.high,
  },
  
  // Borders
  borders: {
    radius: borders.radius,
    width: borders.width,
    color: borders.color,
  },
  
  // Motion
  motion: {
    duration: motion.duration,
    easing: motion.easing,
  },
  
  // Accessibility
  accessibility: {
    focusRing: accessibility.focus.visible.boxShadow,
    touchTarget: accessibility.touchTarget.minimum,
    fontSize: accessibility.fontScaling.minimum,
  },
} as const;

export type HealthcareTheme = typeof healthcareTheme;
export default healthcareTheme;
