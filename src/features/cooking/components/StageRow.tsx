import { StyleSheet, View } from "react-native";

import { AppText, Button } from "../../../components";
import { useTranslation } from "../../../i18n";
import { colors, radii, spacing, useThemeColors } from "../../../theme";
import type { CookingStage } from "../types/cooking.types";
import {
  cookingActionLabelKeys,
  stageStatusLabelKeys,
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
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const isCompleted = stage.status === "completed" || Boolean(stage.completedAt);
  const statusLabel = isCompleted
    ? t("stage.statusCompleted")
    : event
      ? t(stageStatusLabelKeys[stage.status])
      : t("stage.statusNotScheduled");

  return (
    <View
      style={[
        styles.row,
        { borderColor: themeColors.borderStrong },
        isCompleted && styles.completedRow,
      ]}
    >
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
              {t(cookingActionLabelKeys[stage.actionType])}
            </AppText>
          </View>
          <AppText tone="secondary" variant="caption">
            +{t("dish.totalMinutes", { count: stage.offsetMinutes })}
          </AppText>
          <AppText tone="muted" variant="caption">
            {remainingLabel ?? statusLabel}
          </AppText>
        </View>
      </View>

      <Button
        accessibilityLabel={
          isCompleted
            ? `${t("action.undo")} ${stage.title}`
            : `${t("action.complete")} ${stage.title}`
        }
        disabled={disabled}
        haptic={isCompleted ? "warning" : "confirm"}
        onPress={onToggle}
        size="small"
        title={isCompleted ? t("action.undo") : t("action.done")}
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
    borderWidth: 1.2,
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
