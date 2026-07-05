import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, radii, spacing } from "../../theme";
import { playHaptic } from "../../utils/haptics";

type CardTone = "default" | "muted" | "accent" | "dark";

type CardProps = {
  children: ReactNode;
  tone?: CardTone;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function Card({
  children,
  tone = "default",
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  if (onPress) {
    const handlePress = () => {
      void playHaptic("selection");
      onPress();
    };

    return (
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        hitSlop={4}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.base,
          tones[tone],
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, tones[tone]]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.xl,
    shadowColor: colors.accentDark,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 2,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }],
  },
});

const tones = StyleSheet.create({
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  accent: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentSoft,
  },
  dark: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },
});
