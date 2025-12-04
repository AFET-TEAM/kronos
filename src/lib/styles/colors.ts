export type Theme = "light" | "dark";

export interface ColorPalette {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  secondaryDark: string;

  tertiary: string;
  tertiaryHover: string;
  tertiaryLight: string;
  tertiaryDark: string;

  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundOverlay: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textPlaceholder: string;
  textInverse: string;

  // Border colors
  border: string;
  borderSecondary: string;
  borderHover: string;

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Brand colors
  brand: {
    spacePurple: string;
    oceanBlue: string;
    sapphire: string;
    blueRibbon: string;
    blueAzure: string;
    blueSteel: string;
    blueCharcoal: string;
    blueMidnight: string;
    blueRoyal: string;
    greenTeal: string;
  };

  // Gradient colors
  gradient: {
    linear1: string;
    linear2: string;
    pacific1: string;
    pacific2: string;
    customBlue: string;
    bodyGray1: string;
    bodyGray2: string;
  };

  // UI component colors
  ui: {
    button: {
      primary: string;
      primaryHover: string;
      secondary: string;
      secondaryHover: string;
      disabled: string;
    };
    header: {
      background: string;
      text: string;
      icon: string;
      iconHover: string;
    };
    card: {
      background: string;
      border: string;
      shadow: string;
    };
  };
}

export const lightTheme: ColorPalette = {
  // Primary colors
  primary: "#18a0fb",
  primaryHover: "#0963c3",
  primaryLight: "#b1dffe",
  primaryDark: "#0f75b6",

  // Secondary colors
  secondary: "#ffae3b",
  secondaryHover: "#c3a14a",
  secondaryLight: "#f0c55b",
  secondaryDark: "#c3a14a",

  // Background colors
  background: "#ffffff",
  backgroundSecondary: "rgba(248, 250, 253, 0.93)",
  backgroundTertiary: "#f9fafb",
  backgroundOverlay: "rgba(0, 0, 0, 0.5)",

  // Text colors
  text: "#2d2d2d",
  textSecondary: "#4d4d4d",
  textTertiary: "#999999",
  textPlaceholder: "#999999",
  textInverse: "#ffffff",

  // Border colors
  border: "#e5e7eb",
  borderSecondary: "#cbd5e1",
  borderHover: "#0e82ff",

  // Semantic colors
  success: "#91d7b6",
  warning: "#f0c55b",
  error: "#ec4899",
  info: "#06b6d4",

  // Brand colors
  brand: {
    spacePurple: "#2f1275",
    oceanBlue: "#004aad",
    sapphire: "#0f52ba",
    blueRibbon: "#1590e1",
    blueAzure: "#1272b1",
    blueSteel: "#1e4a6d",
    blueCharcoal: "#1c4463",
    blueMidnight: "#173b57",
    blueRoyal: "#2b3c7e",
    greenTeal: "#24786d",
  },

  // Gradient colors
  gradient: {
    linear1: "#cdffd8",
    linear2: "#94b9ff",
    pacific1: "#4184e8",
    pacific2: "#000d28",
    customBlue: "#b2d5ea",
    bodyGray1: "#f9fafb",
    bodyGray2: "#f3f4f6",
  },

  // UI component colors
  ui: {
    button: {
      primary: "#0e82ff",
      primaryHover: "#0963c3",
      secondary: "#0e82ff",
      secondaryHover: "#0e82ff",
      disabled: "#999999",
    },
    header: {
      background: "#ffffff",
      text: "#000000",
      icon: "#0e82ff",
      iconHover: "#0e82ff",
    },
    card: {
      background: "#ffffff",
      border: "#e5e7eb",
      shadow: "rgba(0, 0, 0, 0.1)",
    },
  },
};

export const darkTheme: ColorPalette = {
  // Primary colors
  primary: "#18a0fb",
  primaryHover: "#22d3ee",
  primaryLight: "#b1dffe",
  primaryDark: "#0f75b6",

  // Secondary colors
  secondary: "#ffae3b",
  secondaryHover: "#f0c55b",
  secondaryLight: "#f0c55b",
  secondaryDark: "#c3a14a",

  // Background colors
  background: "#2c2c2c",
  backgroundSecondary: "rgba(30, 30, 30, 0.93)",
  backgroundTertiary: "#1e293b",
  backgroundOverlay: "rgba(0, 0, 0, 0.7)",

  // Text colors
  text: "#e0e0e0",
  textSecondary: "#cbd5e1",
  textTertiary: "#9ca3af",
  textPlaceholder: "#9ca3af",
  textInverse: "#2d2d2d",

  // Border colors
  border: "#4b5563",
  borderSecondary: "#475569",
  borderHover: "#0e82ff",

  // Semantic colors
  success: "#91d7b6",
  warning: "#f0c55b",
  error: "#ec4899",
  info: "#22d3ee",

  // Brand colors (same as light theme)
  brand: {
    spacePurple: "#2f1275",
    oceanBlue: "#004aad",
    sapphire: "#0f52ba",
    blueRibbon: "#1590e1",
    blueAzure: "#1272b1",
    blueSteel: "#1e4a6d",
    blueCharcoal: "#1c4463",
    blueMidnight: "#173b57",
    blueRoyal: "#2b3c7e",
    greenTeal: "#24786d",
  },

  // Gradient colors
  gradient: {
    linear1: "#cdffd8",
    linear2: "#94b9ff",
    pacific1: "#4184e8",
    pacific2: "#000d28",
    customBlue: "#b2d5ea",
    bodyGray1: "#1e293b",
    bodyGray2: "#cbd5e1",
  },

  // UI component colors
  ui: {
    button: {
      primary: "#333333",
      primaryHover: "#555555",
      secondary: "#333333",
      secondaryHover: "#333333",
      disabled: "#4d4d4d",
    },
    header: {
      background: "#2c2c2c",
      text: "#e0e0e0",
      icon: "#0e82ff",
      iconHover: "#0e82ff",
    },
    card: {
      background: "#1e293b",
      border: "#4b5563",
      shadow: "rgba(0, 0, 0, 0.3)",
    },
  },
};

/**
 * Get color palette based on theme
 */
export function getColorPalette(theme: Theme): ColorPalette {
  return theme === "dark" ? darkTheme : lightTheme;
}

/**
 * Export all colors as a flat object for Tailwind config
 */
export const colors = {
  // Light theme colors (default)
  ...Object.fromEntries(
    Object.entries(lightTheme).flatMap(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        return Object.entries(value).map(([subKey, subValue]) => [
          `${key}-${subKey}`,
          subValue,
        ]);
      }
      return [[key, value]];
    })
  ),
  // Brand colors (accessible directly)
  ...lightTheme.brand,
  // Gradient colors (accessible directly)
  ...lightTheme.gradient,
};

