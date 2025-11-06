/**
 * Gabriel Family Clinic - Button Component
 * Elderly-friendly button with WCAG AAA compliance and 44px+ touch targets
 */

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { designSystemUtils } from "@/design-system/utilities";

const buttonVariants = cva(
  // Base styles - always applied
  [
    "inline-flex items-center justify-center",
    "font-medium text-base",
    "rounded-lg",
    "transition-all duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    // Touch target enforcement
    designSystemUtils.a11y.touchTarget("standard"),
  ],
  {
    variants: {
      variant: {
        // Primary - Main actions
        primary: [
          "bg-primary-800 text-white",
          "hover:bg-primary-700",
          "active:bg-primary-900",
          "focus-visible:ring-primary-600",
          "shadow-sm hover:shadow-md",
        ],
        // Secondary - Alternative actions
        secondary: [
          "bg-emerald-500 text-white",
          "hover:bg-emerald-600",
          "active:bg-emerald-700",
          "focus-visible:ring-emerald-500",
          "shadow-sm hover:shadow-md",
        ],
        // Outline - Less prominent actions
        outline: [
          "bg-transparent text-primary-800",
          "border-2 border-primary-800",
          "hover:bg-primary-50",
          "active:bg-primary-100",
          "focus-visible:ring-primary-600",
        ],
        // Ghost - Subtle actions
        ghost: [
          "bg-transparent text-primary-800",
          "hover:bg-neutral-100",
          "active:bg-neutral-200",
          "focus-visible:ring-primary-600",
        ],
        // Danger - Destructive actions
        danger: [
          "bg-red-600 text-white",
          "hover:bg-red-700",
          "active:bg-red-800",
          "focus-visible:ring-red-500",
          "shadow-sm hover:shadow-md",
        ],
        // Success - Positive actions
        success: [
          "bg-emerald-600 text-white",
          "hover:bg-emerald-700",
          "active:bg-emerald-800",
          "focus-visible:ring-emerald-500",
          "shadow-sm hover:shadow-md",
        ],
      },
      size: {
        sm: "px-4 py-2 text-sm min-h-[44px]",
        md: "px-6 py-3 text-base min-h-[48px]",
        lg: "px-8 py-4 text-lg min-h-[56px]",
        xl: "px-10 py-5 text-xl min-h-[64px]",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Icon to display before text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after text
   */
  rightIcon?: React.ReactNode;
  /**
   * Additional ARIA label for screen readers
   */
  ariaLabel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
