import type { ReactNode } from "react";
import type { AccessibilityState } from "react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radii, spacing } from "../../theme";
import { AppText } from "./AppText";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "regular" | "small";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  accessibilityLabel?: string;
  leading?: ReactNode;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "regular",
  disabled = false,
  accessibilityLabel,
  leading,
}: ButtonProps) {
  const accessibilityState: AccessibilityState = {
    disabled,
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        sizes[size],
        variants[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <AppText
        align="center"
        numberOfLines={1}
        tone={variant === "primary" ? "inverse" : "accent"}
        variant="label"
      >
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    borderRadius: radii.pill,
  },
  leading: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.52,
  },
});

const sizes = StyleSheet.create({
  regular: {
    minHeight: 52,
    paddingHorizontal: spacing["2xl"],
  },
  small: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
});

const variants = StyleSheet.create({
  primary: {
    backgroundColor: colors.accentDark,
  },
  secondary: {
    backgroundColor: colors.accentSoft,
  },
  ghost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
