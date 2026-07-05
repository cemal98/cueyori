import type { TextProps } from "react-native";
import { StyleSheet, Text } from "react-native";

import { colors, typography } from "../../theme";

type AppTextVariant =
  | "largeTitle"
  | "title"
  | "headline"
  | "body"
  | "label"
  | "caption"
  | "metric";

type AppTextTone =
  | "primary"
  | "secondary"
  | "muted"
  | "accent"
  | "inverse";

type AppTextAlign = "left" | "center" | "right";
type AppTextDecoration = "none" | "lineThrough";

type AppTextProps = Omit<TextProps, "style"> & {
  variant?: AppTextVariant;
  tone?: AppTextTone;
  align?: AppTextAlign;
  decoration?: AppTextDecoration;
};

export function AppText({
  variant = "body",
  tone = "primary",
  align = "left",
  decoration = "none",
  children,
  ...textProps
}: AppTextProps) {
  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={1.35}
      {...textProps}
      style={[
        styles.base,
        variants[variant],
        tones[tone],
        aligns[align],
        decorations[decoration],
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.charcoal,
    fontFamily: typography.family,
    includeFontPadding: false,
  },
});

const variants = StyleSheet.create({
  largeTitle: {
    fontSize: 40,
    fontWeight: typography.weights.bold,
    letterSpacing: 0,
    lineHeight: 46,
  },
  title: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    letterSpacing: 0,
    lineHeight: 34,
  },
  headline: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    letterSpacing: 0,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: typography.weights.regular,
    letterSpacing: 0,
    lineHeight: 23,
  },
  label: {
    fontSize: 14,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0,
    lineHeight: 18,
  },
  caption: {
    fontSize: 13,
    fontWeight: typography.weights.medium,
    letterSpacing: 0,
    lineHeight: 17,
  },
  metric: {
    fontSize: 34,
    fontWeight: typography.weights.bold,
    fontVariant: typography.tabularNumbers,
    letterSpacing: 0,
    lineHeight: 38,
  },
});

const tones = StyleSheet.create({
  primary: {
    color: colors.charcoal,
  },
  secondary: {
    color: colors.charcoalMuted,
  },
  muted: {
    color: colors.charcoalSubtle,
  },
  accent: {
    color: colors.accentDark,
  },
  inverse: {
    color: colors.inverse,
  },
});

const aligns = StyleSheet.create({
  left: {
    textAlign: "left",
  },
  center: {
    textAlign: "center",
  },
  right: {
    textAlign: "right",
  },
});

const decorations = StyleSheet.create({
  none: {
    textDecorationLine: "none",
  },
  lineThrough: {
    textDecorationLine: "line-through",
  },
});
