import { StyleSheet, View } from "react-native";

import { AppText, Button } from "../../../components";
import { colors, radii, spacing } from "../../../theme";
import type { CookingStage } from "../types/cooking.types";
import {
  cookingActionLabels,
  stageStatusLabels,
} from "../utils/cookingLabels";
import type { CookingTimelineEvent } from "../utils/timelineEngine";

type StageRowProps = {
  stage: CookingStage;
  event?: CookingTimelineEvent;
  remainingLabel?: string;
  onToggle: () => void;
  disabled?: boolean;
};

export function StageRow({
  stage,
  event,
  remainingLabel,
  onToggle,
  disabled = false,
}: StageRowProps) {
  const isCompleted = stage.status === "completed" || Boolean(stage.completedAt);
  const statusLabel = isCompleted
    ? "Completed"
    : event
      ? stageStatusLabels[stage.status]
      : "Not scheduled";

  return (
    <View style={[styles.row, isCompleted && styles.completedRow]}>
      <View style={styles.copy}>
        <AppText
          decoration={isCompleted ? "lineThrough" : "none"}
          tone={isCompleted ? "muted" : "primary"}
          variant="label"
        >
          {stage.title}
        </AppText>

        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <AppText tone="accent" variant="caption">
              {cookingActionLabels[stage.actionType]}
            </AppText>
          </View>
          <AppText tone="secondary" variant="caption">
            +{stage.offsetMinutes} min
          </AppText>
          <AppText tone="muted" variant="caption">
            {remainingLabel ?? statusLabel}
          </AppText>
        </View>
      </View>

      <Button
        accessibilityLabel={
          isCompleted ? `Uncomplete ${stage.title}` : `Complete ${stage.title}`
        }
        disabled={disabled}
        onPress={onToggle}
        size="small"
        title={isCompleted ? "Undo" : "Done"}
        variant={isCompleted ? "ghost" : "secondary"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  completedRow: {
    backgroundColor: colors.surfaceMuted,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 6,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
