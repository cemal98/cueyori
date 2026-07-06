import { StyleSheet, View } from "react-native";

import { AppText, Card } from "../../../components";
import { useTranslation } from "../../../i18n";
import { colors, radii, spacing } from "../../../theme";
import type { Dish } from "../types/cooking.types";
import type { CookingTimelineEvent } from "../utils/timelineEngine";

type DishCardProps = {
  dish: Dish;
  nextEvent?: CookingTimelineEvent;
};

export function DishCard({ dish, nextEvent }: DishCardProps) {
  const { t } = useTranslation();
  const completedStages = dish.stages.filter(
    (stage) => stage.status === "completed",
  ).length;
  const stageLabel = t("dish.cueCount", {
    count: `${completedStages}/${dish.stages.length}`,
  });

  return (
    <Card>
      <View style={styles.stack}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <AppText variant="headline">{dish.name}</AppText>
            <AppText tone="secondary" variant="caption">
              {t("dish.totalMinutes", { count: dish.totalMinutes })}
            </AppText>
          </View>
          <View style={styles.badge}>
            <AppText tone="accent" variant="caption">
              {stageLabel}
            </AppText>
          </View>
        </View>

        <View style={styles.nextRow}>
          <AppText tone="muted" variant="caption">
            {t("dish.next")}
          </AppText>
          <AppText numberOfLines={1} tone="secondary" variant="body">
            {nextEvent?.stageTitle ?? t("dish.clear")}
          </AppText>
        </View>
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
  titleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  badge: {
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nextRow: {
    gap: spacing.xs,
  },
});
