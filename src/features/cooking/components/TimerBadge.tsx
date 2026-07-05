import { StyleSheet, View } from "react-native";

import { AppText } from "../../../components";
import { colors, radii, spacing } from "../../../theme";

type TimerBadgeTone = "default" | "urgent" | "calm";

type TimerBadgeProps = {
  label: string;
  value: string;
  tone?: TimerBadgeTone;
};

export function TimerBadge({
  label,
  value,
  tone = "default",
}: TimerBadgeProps) {
  return (
    <View style={[styles.base, tones[tone]]}>
      <AppText tone={tone === "urgent" ? "inverse" : "secondary"} variant="caption">
        {label}
      </AppText>
      <AppText tone={tone === "urgent" ? "inverse" : "primary"} variant="headline">
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
