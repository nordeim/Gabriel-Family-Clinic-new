import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Healthcare tri-tone color palette
      colors: {
        // Professional Blue - Primary brand color
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af", // Main professional blue
          900: "#1e3a8a",
          950: "#172554",
        },
        // Emerald - Success and health indicators
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981", // Main emerald
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        // Warm Neutrals - Comfortable and approachable
        neutral: {
          50: "#f8fafc", // Warm neutral background
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      // Elderly-friendly typography
      fontSize: {
        base: ["18px", { lineHeight: "1.5" }], // Increased base size for elderly
        lg: ["20px", { lineHeight: "1.5" }],
        xl: ["22px", { lineHeight: "1.4" }],
        "2xl": ["24px", { lineHeight: "1.4" }],
        "3xl": ["28px", { lineHeight: "1.3" }],
        "4xl": ["32px", { lineHeight: "1.3" }],
        "5xl": ["36px", { lineHeight: "1.2" }],
      },
      // Spacing system optimized for touch targets
      spacing: {
        "touch": "44px", // Minimum WCAG AAA touch target
        "touch-lg": "48px",
        "touch-xl": "56px",
      },
      // Healthcare-appropriate shadows
      boxShadow: {
        "soft": "0 2px 8px rgba(0, 0, 0, 0.08)",
        "medium": "0 4px 16px rgba(0, 0, 0, 0.12)",
        "elevated": "0 8px 24px rgba(0, 0, 0, 0.16)",
      },
      // Smooth animations for elderly users
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
