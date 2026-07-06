import { StyleSheet, View } from "react-native";

import { AppText } from "../../../components";
import { colors, radii, spacing } from "../../../theme";

type TimerBadgeTone = "default" | "urgent" | "calm";
type TimerBadgeSize = "regular" | "large";

type TimerBadgeProps = {
  label: string;
  value: string;
  tone?: TimerBadgeTone;
  size?: TimerBadgeSize;
};

export function TimerBadge({
  label,
  value,
  tone = "default",
  size = "regular",
}: TimerBadgeProps) {
  return (
    <View style={[styles.base, sizes[size], tones[tone]]}>
      <AppText tone={tone === "urgent" ? "inverse" : "secondary"} variant="caption">
        {label}
      </AppText>
      <AppText
        tone={tone === "urgent" ? "inverse" : "primary"}
        variant={size === "large" ? "metric" : "headline"}
      >
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    gap: spacing.xs,
    borderRadius: radii.md,
  },
});

const sizes = StyleSheet.create({
  regular: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  large: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});

const tones = StyleSheet.create({
  default: {
    backgroundColor: colors.surfaceMuted,
  },
  urgent: {
    backgroundColor: colors.accentDark,
  },
  calm: {
    backgroundColor: colors.backgroundMuted,
  },
});
