import { StyleSheet, View } from "react-native";

import { AppText, Button, Card } from "../../../components";
import { useTranslation } from "../../../i18n";
import { colors, spacing } from "../../../theme";
import { cookingActionLabelKeys } from "../utils/cookingLabels";
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
  emptyTitle,
  emptyMessage,
  actionTitle,
  onActionPress,
  actionDisabled = false,
}: CueCardProps) {
  const { t } = useTranslation();
  const resolvedEmptyTitle = emptyTitle ?? t("session.allClearTitle");
  const resolvedEmptyMessage = emptyMessage ?? t("session.allClearMessage");

  if (!event) {
    return (
      <Card tone="muted">
        <View style={styles.stack}>
          <AppText tone="secondary" variant="label">
            {t("label.nextCue")}
          </AppText>
          <AppText variant="headline">{resolvedEmptyTitle}</AppText>
          <AppText tone="secondary">{resolvedEmptyMessage}</AppText>
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
            {t("label.nextCue")}
          </AppText>
          <TimerBadge
            label={isDue ? t("label.timelineStatus.due") : t("label.in")}
            tone={isDue ? "urgent" : "calm"}
            value={remainingLabel ?? t("time.now")}
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
              {t(cookingActionLabelKeys[event.actionType])}
            </AppText>
          </View>
          {event.heatLevel ? (
            <AppText tone={isDue ? "inverse" : "muted"} variant="caption">
              {t("cooking.heat", {
                value: event.heatLevel.replace("_", " "),
              })}
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
