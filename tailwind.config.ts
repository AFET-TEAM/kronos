import type { Config } from "tailwindcss";
import { lightTheme } from "./src/lib/styles/colors.js";

const config: Config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      screens: {
        xl2: "1200px",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        // Primary colors
        primary: lightTheme.primary,
        "primary-hover": lightTheme.primaryHover,
        "primary-light": lightTheme.primaryLight,
        "primary-dark": lightTheme.primaryDark,

        // Secondary colors
        secondary: lightTheme.secondary,
        "secondary-hover": lightTheme.secondaryHover,
        "secondary-light": lightTheme.secondaryLight,
        "secondary-dark": lightTheme.secondaryDark,

        // Background colors
        background: lightTheme.background,
        "background-secondary": lightTheme.backgroundSecondary,
        "background-tertiary": lightTheme.backgroundTertiary,
        "background-overlay": lightTheme.backgroundOverlay,

        // Text colors
        text: lightTheme.text,
        "text-secondary": lightTheme.textSecondary,
        "text-tertiary": lightTheme.textTertiary,
        "text-placeholder": lightTheme.textPlaceholder,
        "text-inverse": lightTheme.textInverse,

        // Border colors
        border: lightTheme.border,
        "border-secondary": lightTheme.borderSecondary,
        "border-hover": lightTheme.borderHover,

        // Semantic colors
        success: lightTheme.success,
        warning: lightTheme.warning,
        error: lightTheme.error,
        info: lightTheme.info,

        // Brand colors (kept for backward compatibility)
        "space-purple": lightTheme.brand.spacePurple,
        "ocean-blue": lightTheme.brand.oceanBlue,
        sapphire: lightTheme.brand.sapphire,
        "blue-ribbon": lightTheme.brand.blueRibbon,
        "blue-azure": lightTheme.brand.blueAzure,
        "blue-steel": lightTheme.brand.blueSteel,
        "blue-charcoal": lightTheme.brand.blueCharcoal,
        "blue-midnight": lightTheme.brand.blueMidnight,
        "green-teal": lightTheme.brand.greenTeal,
        "blue-royal": lightTheme.brand.blueRoyal,

        // Gradient colors
        linear1: lightTheme.gradient.linear1,
        linear2: lightTheme.gradient.linear2,
        "pacific-gradient-1": lightTheme.gradient.pacific1,
        "pacific-gradient-2": lightTheme.gradient.pacific2,
        "custom-blue": lightTheme.gradient.customBlue,

        // Legacy color names (for backward compatibility)
        "white-ghost": lightTheme.backgroundSecondary,
        white: lightTheme.background,
        "light-gray-transparent": lightTheme.backgroundSecondary,
        "charcoal-transparent": "rgba(30, 30, 30, 0.93)",
        "dark-gray": lightTheme.text,
        "mid-gray": lightTheme.textSecondary,
        "light-gray": lightTheme.textTertiary,

        // Tailwind default colors (kept for compatibility)
        "slate-900": "#0f172a",
        "slate-800": "#1e293b",
        "slate-700": "#334155",
        "slate-600": "#475569",
        "slate-400": "#cbd5e1",
        "cyan-500": lightTheme.info,
        "cyan-600": "#0891b2",
        "cyan-400": "#22d3ee",
        "blue-500": "#3b82f6",
        "purple-400": "#c084fc",
        "pink-500": lightTheme.error,
        "teal-400": "#2dd4bf",
        "indigo-400": "#a5b4fc",
        "blue-100": lightTheme.primary,
        "blue-200": lightTheme.primaryDark,
        "blue-300": lightTheme.primaryLight,
        "blue-400": lightTheme.brand.blueRibbon,
        "yellow-100": lightTheme.secondaryLight,
        "yellow-200": lightTheme.secondaryDark,
        "green-100": lightTheme.success,
        "green-200": lightTheme.success,
      },
    },
  },
  plugins: [],
};

export default config;

