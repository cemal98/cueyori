import { StyleSheet, View } from "react-native";

import { AppText, Button, Card } from "../../../components";
import { colors, spacing } from "../../../theme";
import { cookingActionLabels } from "../utils/cookingLabels";
import type { CookingTimelineEvent } from "../utils/timelineEngine";
import { TimerBadge } from "./TimerBadge";

type CueCardProps = {
  event?: CookingTimelineEvent;
  remainingLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  actionDisabled?: boolean;
};

export function CueCard({
  event,
  remainingLabel,
  emptyTitle = "All cues are clear",
  emptyMessage = "Nothing needs attention right now.",
  actionTitle,
  onActionPress,
  actionDisabled = false,
}: CueCardProps) {
  if (!event) {
    return (
      <Card tone="muted">
        <View style={styles.stack}>
          <AppText tone="secondary" variant="label">
            Next cue
          </AppText>
          <AppText variant="headline">{emptyTitle}</AppText>
          <AppText tone="secondary">{emptyMessage}</AppText>
        </View>
      </Card>
    );
  }

  const isDue = event.status === "due";

  return (
    <Card tone={isDue ? "dark" : "default"}>
      <View style={styles.stack}>
        <View style={styles.header}>
          <AppText tone={isDue ? "inverse" : "secondary"} variant="label">
            Next cue
          </AppText>
          <TimerBadge
            label={isDue ? "Due" : "In"}
            tone={isDue ? "urgent" : "calm"}
            value={remainingLabel ?? "now"}
          />
        </View>

        <View style={styles.copy}>
          <AppText tone={isDue ? "inverse" : "primary"} variant="title">
            {event.stageTitle}
          </AppText>
          <AppText tone={isDue ? "inverse" : "secondary"} variant="body">
            {event.dishName}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.actionChip, isDue && styles.actionChipDark]}>
            <AppText tone={isDue ? "inverse" : "accent"} variant="caption">
              {cookingActionLabels[event.actionType]}
            </AppText>
          </View>
          {event.heatLevel ? (
            <AppText tone={isDue ? "inverse" : "muted"} variant="caption">
              Heat: {event.heatLevel.replace("_", " ")}
            </AppText>
          ) : null}
        </View>

        {onActionPress && actionTitle ? (
          <Button
            accessibilityLabel={`${actionTitle} ${event.stageTitle}`}
            disabled={actionDisabled}
            haptic="confirm"
            onPress={onActionPress}
            title={actionTitle}
            variant={isDue ? "secondary" : "primary"}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  copy: {
    gap: spacing.sm,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  actionChip: {
    alignSelf: "flex-start",
    borderRadius: 6,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionChipDark: {
    backgroundColor: colors.accent,
  },
});
