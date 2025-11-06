/**
 * Gabriel Family Clinic - Motion & Animation Design Tokens
 * Gentle, healthcare-appropriate animations with reduced motion support
 * 
 * Design Principles:
 * - Subtle, non-disruptive animations
 * - Respect prefers-reduced-motion
 * - Natural, spring-based easing
 * - Performance-optimized (60fps target)
 */

export const motion = {
  // Duration Scale
  duration: {
    instant: "0ms",
    fastest: "100ms",
    faster: "150ms",
    fast: "200ms",
    normal: "300ms",
    slow: "500ms",
    slower: "700ms",
    slowest: "1000ms",
  },

  // Easing Functions
  easing: {
    // Standard easing
    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",

    // Healthcare-appropriate (gentle)
    gentle: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    smooth: "cubic-bezier(0.4, 0.0, 0.2, 1)",
    
    // Spring-based (natural feel)
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    bounce: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",

    // Specialized
    anticipate: "cubic-bezier(0.36, 0, 0.66, -0.56)",
    overshoot: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  // Transition Presets
  transition: {
    // Basic transitions
    fade: {
      duration: "300ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      property: "opacity",
    },
    slide: {
      duration: "300ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      property: "transform",
    },
    scale: {
      duration: "200ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      property: "transform",
    },
    
    // Healthcare-specific (gentle)
    fadeGentle: {
      duration: "500ms",
      easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      property: "opacity",
    },
    slideGentle: {
      duration: "500ms",
      easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      property: "transform",
    },

    // Interactive elements
    button: {
      duration: "150ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      property: "all",
    },
    input: {
      duration: "200ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      property: "border-color, box-shadow",
    },
    tooltip: {
      duration: "200ms",
      easing: "cubic-bezier(0, 0, 0.2, 1)",
      property: "opacity, transform",
    },
    modal: {
      duration: "300ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      property: "opacity, transform",
    },
  },

  // Animation Keyframes
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    slideUp: {
      from: { transform: "translateY(10px)", opacity: 0 },
      to: { transform: "translateY(0)", opacity: 1 },
    },
    slideDown: {
      from: { transform: "translateY(-10px)", opacity: 0 },
      to: { transform: "translateY(0)", opacity: 1 },
    },
    slideLeft: {
      from: { transform: "translateX(10px)", opacity: 0 },
      to: { transform: "translateX(0)", opacity: 1 },
    },
    slideRight: {
      from: { transform: "translateX(-10px)", opacity: 0 },
      to: { transform: "translateX(0)", opacity: 1 },
    },
    scaleIn: {
      from: { transform: "scale(0.95)", opacity: 0 },
      to: { transform: "scale(1)", opacity: 1 },
    },
    scaleOut: {
      from: { transform: "scale(1)", opacity: 1 },
      to: { transform: "scale(0.95)", opacity: 0 },
    },
    pulse: {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.7 },
    },
    shimmer: {
      "0%": { transform: "translateX(-100%)" },
      "100%": { transform: "translateX(100%)" },
    },
  },

  // Healthcare-specific animations
  healthcare: {
    // Appointment booking success
    success: {
      duration: "500ms",
      easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      keyframes: "scaleIn",
    },
    // Form validation feedback
    validation: {
      duration: "300ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      keyframes: "slideUp",
    },
    // Loading states (non-anxiety-inducing)
    loading: {
      duration: "1500ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      keyframes: "pulse",
      iterationCount: "infinite",
    },
    // Notification appearance
    notification: {
      duration: "400ms",
      easing: "cubic-bezier(0, 0, 0.2, 1)",
      keyframes: "slideRight",
    },
  },
} as const;

/**
 * Motion Utilities
 */
export const motionUtils = {
  /**
   * Generate CSS transition string
   */
  generateTransition: (
    property: string,
    duration: string,
    easing: string,
    delay: string = "0ms"
  ): string => {
    return `${property} ${duration} ${easing} ${delay}`;
  },

  /**
   * Create multiple transitions
   */
  multiTransition: (
    transitions: Array<{
      property: string;
      duration?: string;
      easing?: string;
      delay?: string;
    }>
  ): string => {
    return transitions
      .map((t) =>
        motionUtils.generateTransition(
          t.property,
          t.duration || motion.duration.normal,
          t.easing || motion.easing.easeInOut,
          t.delay || "0ms"
        )
      )
      .join(", ");
  },

  /**
   * Check if reduced motion is preferred
   */
  prefersReducedMotion: (): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  /**
   * Get safe animation duration (respects reduced motion)
   */
  getSafeDuration: (duration: string): string => {
    return motionUtils.prefersReducedMotion() ? "0.01ms" : duration;
  },

  /**
   * Create animation CSS string
   */
  createAnimation: (
    name: string,
    duration: string,
    easing: string,
    delay: string = "0ms",
    iterationCount: string = "1",
    direction: string = "normal",
    fillMode: string = "both"
  ): string => {
    return `${name} ${duration} ${easing} ${delay} ${iterationCount} ${direction} ${fillMode}`;
  },
} as const;

/**
 * Reduced Motion Alternatives
 * Instant transitions for users who prefer reduced motion
 */
export const reducedMotion = {
  duration: "0.01ms",
  easing: "linear",
  transition: "none",
} as const;

/**
 * Performance Considerations
 */
export const performance = {
  // Use GPU-accelerated properties
  gpuAccelerated: ["transform", "opacity"],
  
  // Avoid animating these properties
  avoid: ["width", "height", "top", "left", "bottom", "right", "margin", "padding"],

  // Will-change optimization
  willChange: {
    transform: "transform",
    opacity: "opacity",
    scroll: "scroll-position",
  },
} as const;

export type MotionToken = typeof motion;
export type EasingFunction = keyof typeof motion.easing;
export type AnimationKeyframe = keyof typeof motion.keyframes;
