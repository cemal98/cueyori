import {
  DynamicColorIOS,
  Platform,
  type ColorValue,
  type TextStyle,
} from "react-native";

type ThemeColor = {
  light: string;
  dark: string;
};

const adaptiveColor = ({ light, dark }: ThemeColor): ColorValue =>
  Platform.OS === "ios" ? DynamicColorIOS({ light, dark }) : light;

export const colors = {
  background: adaptiveColor({ light: "#f6efe5", dark: "#15110f" }),
  backgroundMuted: adaptiveColor({ light: "#efe4d6", dark: "#1c1713" }),
  surface: adaptiveColor({ light: "#fffaf2", dark: "#211b17" }),
  surfaceMuted: adaptiveColor({ light: "#f3e8da", dark: "#2b241f" }),
  charcoal: adaptiveColor({ light: "#24211d", dark: "#f7efe6" }),
  charcoalMuted: adaptiveColor({ light: "#6f675e", dark: "#d4c6b9" }),
  charcoalSubtle: adaptiveColor({ light: "#91877c", dark: "#a99b8f" }),
  accent: adaptiveColor({ light: "#c7663a", dark: "#d78152" }),
  accentDark: adaptiveColor({ light: "#8f3f22", dark: "#f0a06f" }),
  accentSoft: adaptiveColor({ light: "#f0c7ae", dark: "#4a2b1f" }),
  success: adaptiveColor({ light: "#5b7c4f", dark: "#9abb86" }),
  warning: adaptiveColor({ light: "#a8662d", dark: "#e0a45f" }),
  danger: adaptiveColor({ light: "#a94734", dark: "#e48672" }),
  border: adaptiveColor({ light: "#e2d4c5", dark: "#3b3028" }),
  inverse: adaptiveColor({ light: "#fffaf2", dark: "#15110f" }),
} as const;

export const brand = {
  name: "CueYori",
  tagline: "Cook everything. Right on cue.",
  scheme: "cueyori",
  bundleIdentifier: "com.bydemirel.cueyori",
  assets: {
    appIcon: "./assets/brand/cueyori-app-icon.png",
    splashSource: "./assets/brand/cueyori-splash-source.png",
    splashBase: "./assets/brand/cueyori-splash-lockup-base.png",
    splashHeat: "./assets/brand/cueyori-splash-lockup-heat.png",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const;

export const radii = {
  sm: 6,
  md: 8,
  pill: 999,
} as const;

export const typography = {
  family: undefined as TextStyle["fontFamily"],
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  } satisfies Record<string, TextStyle["fontWeight"]>,
  tabularNumbers: ["tabular-nums"] as TextStyle["fontVariant"],
} as const;
