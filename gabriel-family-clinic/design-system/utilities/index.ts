/**
 * Gabriel Family Clinic - Design System Utilities
 * Central utilities for working with design tokens
 */

import { colors, accessibility, spacing, motion } from "../tokens";
import { cn } from "@/lib/utils";

/**
 * Accessibility Utilities
 */
export const a11yUtils = {
  /**
   * Create accessible focus ring classes
   */
  focusRing: (color: string = colors.primary[600]): string => {
    return cn(
      "outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-offset-2",
      `focus-visible:ring-[${color}]`
    );
  },

  /**
   * Screen reader only classes
   */
  srOnly: (): string => {
    return cn(
      "absolute",
      "w-px",
      "h-px",
      "p-0",
      "-m-px",
      "overflow-hidden",
      "whitespace-nowrap",
      "border-0"
    );
  },

  /**
   * Enforce minimum touch target
   */
  touchTarget: (size: "minimum" | "standard" | "large" | "extraLarge" = "minimum"): string => {
    const sizeMap = {
      minimum: "min-h-[44px] min-w-[44px]",
      standard: "min-h-[48px] min-w-[48px]",
      large: "min-h-[56px] min-w-[56px]",
      extraLarge: "min-h-[64px] min-w-[64px]",
    };
    return sizeMap[size];
  },

  /**
   * High contrast mode support
   */
  highContrast: (): string => {
    return cn(
      "@media (prefers-contrast: high) {",
      "border-2 border-black",
      "}"
    );
  },

  /**
   * Reduced motion support
   */
  reducedMotion: (): string => {
    return cn(
      "@media (prefers-reduced-motion: reduce) {",
      "animation-duration: 0.01ms !important",
      "transition-duration: 0.01ms !important",
      "}"
    );
  },
} as const;

/**
 * Color Utilities
 */
export const colorUtils = {
  /**
   * Get text color based on background
   */
  getTextColor: (backgroundColor: string): string => {
    // Simple luminance check - in production, use a proper contrast checker
    const isLight = backgroundColor.includes("50") || backgroundColor.includes("100");
    return isLight ? colors.neutral[900] : "#ffffff";
  },

  /**
   * Create gradient
   */
  gradient: (from: string, to: string, direction: string = "to right"): string => {
    return `linear-gradient(${direction}, ${from}, ${to})`;
  },

  /**
   * Add opacity to color
   */
  withOpacity: (color: string, opacity: number): string => {
    // Assumes hex color input
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`;
  },
} as const;

/**
 * Spacing Utilities
 */
export const spacingUtils = {
  /**
   * Create responsive padding
   */
  responsivePadding: (mobile: string, tablet: string, desktop: string): string => {
    return cn(
      `p-[${mobile}]`,
      `md:p-[${tablet}]`,
      `lg:p-[${desktop}]`
    );
  },

  /**
   * Create responsive gap
   */
  responsiveGap: (mobile: string, tablet: string, desktop: string): string => {
    return cn(
      `gap-[${mobile}]`,
      `md:gap-[${tablet}]`,
      `lg:gap-[${desktop}]`
    );
  },

  /**
   * Stack with consistent spacing
   */
  stack: (gap: keyof typeof spacing.scale, direction: "vertical" | "horizontal" = "vertical"): string => {
    const flexDirection = direction === "vertical" ? "flex-col" : "flex-row";
    return cn("flex", flexDirection, `gap-[${spacing.scale[gap]}]`);
  },
} as const;

/**
 * Typography Utilities
 */
export const typographyUtils = {
  /**
   * Clamp text to lines
   */
  clamp: (lines: number): string => {
    return cn(
      "overflow-hidden",
      "text-ellipsis",
      `line-clamp-${lines}`
    );
  },

  /**
   * Responsive font size
   */
  responsiveText: (mobile: string, tablet: string, desktop: string): string => {
    return cn(
      `text-[${mobile}]`,
      `md:text-[${tablet}]`,
      `lg:text-[${desktop}]`
    );
  },

  /**
   * Text with minimum size enforcement
   */
  minSize: (size: string): string => {
    const sizeNum = parseFloat(size);
    const minSize = accessibility.fontScaling.minimum;
    return sizeNum < minSize ? `text-[${minSize}px]` : `text-[${size}]`;
  },
} as const;

/**
 * Animation Utilities
 */
export const animationUtils = {
  /**
   * Create transition
   */
  transition: (
    property: string = "all",
    duration: keyof typeof motion.duration = "normal",
    easing: string = motion.easing.easeInOut
  ): string => {
    return cn(
      `transition-${property}`,
      `duration-[${motion.duration[duration]}]`,
      `ease-[${easing}]`
    );
  },

  /**
   * Fade in animation
   */
  fadeIn: (duration: keyof typeof motion.duration = "normal"): string => {
    return cn(
      "animate-fade-in",
      `duration-[${motion.duration[duration]}]`
    );
  },

  /**
   * Slide up animation
   */
  slideUp: (duration: keyof typeof motion.duration = "normal"): string => {
    return cn(
      "animate-slide-up",
      `duration-[${motion.duration[duration]}]`
    );
  },
} as const;

/**
 * Layout Utilities
 */
export const layoutUtils = {
  /**
   * Container with max-width
   */
  container: (size: "sm" | "md" | "lg" | "xl" | "2xl" = "xl"): string => {
    const sizes = {
      sm: "max-w-[640px]",
      md: "max-w-[768px]",
      lg: "max-w-[1024px]",
      xl: "max-w-[1280px]",
      "2xl": "max-w-[1536px]",
    };
    return cn("mx-auto", "px-4 md:px-6 lg:px-8", sizes[size]);
  },

  /**
   * Grid with responsive columns
   */
  grid: (columns: { mobile: number; tablet: number; desktop: number }): string => {
    return cn(
      "grid",
      `grid-cols-${columns.mobile}`,
      `md:grid-cols-${columns.tablet}`,
      `lg:grid-cols-${columns.desktop}`,
      "gap-4 md:gap-6 lg:gap-8"
    );
  },

  /**
   * Flex center
   */
  flexCenter: (): string => {
    return cn("flex", "items-center", "justify-center");
  },

  /**
   * Flex between
   */
  flexBetween: (): string => {
    return cn("flex", "items-center", "justify-between");
  },
} as const;

/**
 * Healthcare-Specific Utilities
 */
export const healthcareUtils = {
  /**
   * Emergency badge styles
   */
  emergencyBadge: (): string => {
    return cn(
      "inline-flex",
      "items-center",
      "px-3 py-1",
      "text-sm font-semibold",
      "bg-red-100",
      "text-red-800",
      "rounded-full",
      "border-2 border-red-600"
    );
  },

  /**
   * Prescription label styles
   */
  prescriptionLabel: (): string => {
    return cn(
      "font-mono",
      "text-base",
      "leading-relaxed",
      "bg-emerald-50",
      "border-l-4 border-emerald-500",
      "p-4"
    );
  },

  /**
   * Appointment status colors
   */
  appointmentStatus: (status: "scheduled" | "completed" | "cancelled" | "pending"): string => {
    const statusMap = {
      scheduled: "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      pending: "bg-amber-100 text-amber-800 border-amber-300",
    };
    return cn(
      "inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border-2",
      statusMap[status]
    );
  },
} as const;

/**
 * Combined Design System Utilities
 */
export const designSystemUtils = {
  a11y: a11yUtils,
  color: colorUtils,
  spacing: spacingUtils,
  typography: typographyUtils,
  animation: animationUtils,
  layout: layoutUtils,
  healthcare: healthcareUtils,
} as const;

export default designSystemUtils;
