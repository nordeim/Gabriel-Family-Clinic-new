/**
 * Gabriel Family Clinic - Card Component
 * Healthcare-optimized card with WCAG AAA compliance
 */

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  [
    "rounded-xl border transition-all duration-200",
    "bg-white shadow-soft",
  ],
  {
    variants: {
      variant: {
        default: "border-neutral-200 hover:shadow-medium",
        primary: "border-primary-200 bg-primary-50",
        success: "border-emerald-200 bg-emerald-50",
        warning: "border-amber-200 bg-amber-50",
        error: "border-red-200 bg-red-50",
        medical: "border-primary-300 bg-gradient-to-br from-primary-50 to-white",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      clickable: {
        true: "cursor-pointer hover:shadow-elevated hover:scale-[1.02] active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      clickable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Card header content
   */
  header?: React.ReactNode;
  /**
   * Card footer content
   */
  footer?: React.ReactNode;
  /**
   * Accessible card title
   */
  title?: string;
  /**
   * Card description for screen readers
   */
  description?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      clickable,
      header,
      footer,
      title,
      description,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isClickable = clickable || !!onClick;

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, clickable: isClickable }),
          className
        )}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.(e as any);
                }
              }
            : undefined
        }
        aria-label={title}
        aria-describedby={description ? `${title}-description` : undefined}
        {...props}
      >
        {/* Header */}
        {header && (
          <div className="mb-4 pb-4 border-b border-neutral-200">
            {header}
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {title && (
            <h3 className="text-xl font-semibold text-neutral-900">
              {title}
            </h3>
          )}
          {description && (
            <p
              id={`${title}-description`}
              className="text-base text-neutral-600"
            >
              {description}
            </p>
          )}
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * Card Header Component
 */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-1.5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * Card Title Component
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-neutral-900",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * Card Description Component
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base text-neutral-600", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * Card Content Component
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

/**
 * Card Footer Component
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export default Card;
