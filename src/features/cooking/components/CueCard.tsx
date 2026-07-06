import { StyleSheet, View } from "react-native";

import { AppText, Button, Card } from "../../../components";
import { useTranslation } from "../../../i18n";
import { colors, spacing } from "../../../theme";
import { cookingActionLabelKeys } from "../utils/cookingLabels";
import type { CookingTimelineEvent } from "../utils/timelineEngine";
import { TimerBadge } from "./TimerBadge";

type CueCardVariant = "default" | "hero";

type CueCardProps = {
  event?: CookingTimelineEvent;
  remainingLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  actionDisabled?: boolean;
  variant?: CueCardVariant;
};

export function CueCard({
  event,
  remainingLabel,
  emptyTitle,
  emptyMessage,
  actionTitle,
  onActionPress,
  actionDisabled = false,
  variant = "default",
}: CueCardProps) {
  const { t } = useTranslation();
  const isHero = variant === "hero";
  const resolvedEmptyTitle = emptyTitle ?? t("session.allClearTitle");
  const resolvedEmptyMessage = emptyMessage ?? t("session.allClearMessage");

  if (!event) {
    return (
      <Card tone="muted">
        <View style={[styles.stack, isHero && styles.heroStack]}>
          <AppText tone="secondary" variant="label">
            {t("label.nextCue")}
          </AppText>
          <AppText variant={isHero ? "title" : "headline"}>
            {resolvedEmptyTitle}
          </AppText>
          <AppText tone="secondary">{resolvedEmptyMessage}</AppText>
        </View>
      </Card>
    );
  }

  const isAttention = event.status === "due" || event.status === "missed";

  return (
    <Card tone={isAttention ? "dark" : "default"}>
      <View style={[styles.stack, isHero && styles.heroStack]}>
        <View style={styles.header}>
          <AppText tone={isAttention ? "inverse" : "secondary"} variant="label">
            {t("label.nextCue")}
          </AppText>
          <TimerBadge
            label={
              event.status === "missed"
                ? t("label.timelineStatus.missed")
                : event.status === "due"
                  ? t("label.timelineStatus.due")
                  : t("label.in")
            }
            size={isHero ? "large" : "regular"}
            tone={isAttention ? "urgent" : "calm"}
            value={remainingLabel ?? t("time.now")}
          />
        </View>

        <View style={[styles.copy, isHero && styles.heroCopy]}>
          <AppText
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            numberOfLines={2}
            tone={isAttention ? "inverse" : "primary"}
            variant={isHero ? "largeTitle" : "title"}
          >
            {event.stageTitle}
          </AppText>
          <AppText tone={isAttention ? "inverse" : "secondary"} variant="body">
            {event.dishName}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.actionChip, isAttention && styles.actionChipDark]}>
            <AppText tone={isAttention ? "inverse" : "accent"} variant="caption">
              {t(cookingActionLabelKeys[event.actionType])}
            </AppText>
          </View>
          {event.heatLevel ? (
            <AppText tone={isAttention ? "inverse" : "muted"} variant="caption">
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
            variant={isAttention ? "secondary" : "primary"}
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
  heroStack: {
    minHeight: 214,
    justifyContent: "space-between",
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
  heroCopy: {
    gap: spacing.md,
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
