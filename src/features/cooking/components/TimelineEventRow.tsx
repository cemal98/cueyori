import { StyleSheet, View } from "react-native";

import { AppText } from "../../../components";
import { colors, radii, spacing } from "../../../theme";
import {
  cookingActionLabels,
  timelineStatusLabels,
} from "../utils/cookingLabels";
import type { CookingTimelineEvent } from "../utils/timelineEngine";

type TimelineEventRowProps = {
  event: CookingTimelineEvent;
  remainingLabel: string;
};

export function TimelineEventRow({
  event,
  remainingLabel,
}: TimelineEventRowProps) {
  const isCompleted = event.status === "completed";
  const isDue = event.status === "due";
  const timeLabel = isCompleted ? "Done" : remainingLabel;

  return (
    <View
      style={[
        styles.row,
        isDue && styles.dueRow,
        isCompleted && styles.completedRow,
      ]}
    >
      <View
        style={[
          styles.statusRail,
          isDue && styles.dueRail,
          isCompleted && styles.completedRail,
        ]}
      />

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText
            decoration={isCompleted ? "lineThrough" : "none"}
            tone={isCompleted ? "muted" : "primary"}
            variant="label"
          >
            {event.stageTitle}
          </AppText>
          <AppText tone={isDue ? "accent" : "muted"} variant="caption">
            {timeLabel}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <AppText tone="secondary" variant="caption">
            {event.dishName}
          </AppText>
          <View style={styles.chip}>
            <AppText tone="accent" variant="caption">
              {cookingActionLabels[event.actionType]}
            </AppText>
          </View>
          <AppText tone="muted" variant="caption">
            {timelineStatusLabels[event.status]}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  dueRow: {
    backgroundColor: colors.accentSoft,
  },
  completedRow: {
    backgroundColor: colors.surfaceMuted,
  },
  statusRail: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  dueRail: {
    backgroundColor: colors.accentDark,
  },
  completedRail: {
    backgroundColor: colors.success,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
