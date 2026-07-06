import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { CueYoriLoadingScreen } from "../src/components/brand/CueYoriLoadingScreen";
import { AppText, Button, Card, Screen, StateCard } from "../src/components";
import { useTranslation } from "../src/i18n";
import {
  createDemoCookingSession,
  CueCard,
  DishCard,
  formatRemainingTime,
  getEventsByDish,
  getNextTimelineEvent,
  getTimelineProgress,
  TimerBadge,
  useCookingStore,
} from "../src/features/cooking";
import { brand, spacing } from "../src/theme";

const loadingIntroDurationMs = 2600;
const dashboardRefreshMs = 30000;

export default function HomeScreen() {
  const router = useRouter();
  const [isLoadingIntroVisible, setIsLoadingIntroVisible] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const sessions = useCookingStore((state) => state.sessions);
  const { t } = useTranslation();
  const remainingTimeFormat = useMemo(
    () => ({
      now: t("time.now"),
      late: (timeLabel: string) => t("time.late", { time: timeLabel }),
    }),
    [t],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoadingIntroVisible(false);
    }, loadingIntroDurationMs);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, dashboardRefreshMs);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const activeSession = useMemo(
    () => sessions.find((session) => session.status === "active"),
    [sessions],
  );

  const nextCue = useMemo(
    () => (activeSession ? getNextTimelineEvent(activeSession, now) : undefined),
    [activeSession, now],
  );

  const timelineProgress = useMemo(
    () => (activeSession ? getTimelineProgress(activeSession, now) : undefined),
    [activeSession, now],
  );

  const eventsByDish = useMemo(
    () => (activeSession ? getEventsByDish(activeSession, now) : undefined),
    [activeSession, now],
  );

  const nextCueRemaining = nextCue
    ? formatRemainingTime(nextCue.scheduledAt, now, remainingTimeFormat)
    : undefined;

  const handleStartCookingSession = useCallback(async () => {
    if (isStartingSession) {
      return;
    }

    setIsStartingSession(true);

    try {
      await createDemoCookingSession();
      setNow(new Date());
    } finally {
      setIsStartingSession(false);
    }
  }, [isStartingSession]);

  const handleOpenActiveSession = useCallback(() => {
    if (!activeSession) {
      return;
    }

    router.push({
      pathname: "/session/[id]",
      params: {
        id: activeSession.id,
      },
    });
  }, [activeSession, router]);

  const handleOpenSettings = useCallback(() => {
    router.push("/settings" as never);
  }, [router]);

  if (isLoadingIntroVisible) {
    return <CueYoriLoadingScreen />;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.brandBlock}>
          <AppText variant="largeTitle">{brand.name}</AppText>
          <AppText tone="secondary" variant="body">
            {t("app.tagline")}
          </AppText>
        </View>

        <Button
          accessibilityLabel={t("action.viewSettings")}
          onPress={handleOpenSettings}
          title={t("action.viewSettings")}
          variant="ghost"
        />

        <Button
          accessibilityHint={t("home.preparingMessage")}
          accessibilityLabel={t("action.startCookingSession")}
          disabled={isStartingSession}
          haptic="confirm"
          onPress={handleStartCookingSession}
          title={
            isStartingSession
              ? t("home.preparing")
              : t("action.startCookingSession")
          }
        />
      </View>

      {isStartingSession ? (
        <StateCard
          message={t("home.preparingMessage")}
          title={t("home.preparingTitle")}
          tone="loading"
        />
      ) : null}

      {activeSession ? (
        <View style={styles.dashboardStack}>
          <Card
            accessibilityHint={t("session.timelineTitle")}
            accessibilityLabel={t("home.activeSession")}
            onPress={handleOpenActiveSession}
          >
            <View style={styles.sessionCard}>
              <View style={styles.sessionCopy}>
                <AppText tone="secondary" variant="label">
                  {t("home.activeSession")}
                </AppText>
                <AppText variant="headline">{activeSession.title}</AppText>
                <AppText tone="secondary" variant="body">
                  {t("dish.dishesInMotion", {
                    count: activeSession.dishes.length,
                  })}
                </AppText>
              </View>

              <TimerBadge
                label={t("label.progress")}
                value={`${timelineProgress?.completionPercent ?? 0}%`}
              />
            </View>
          </Card>

          <CueCard event={nextCue} remainingLabel={nextCueRemaining} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="headline">{t("dish.activeDishes")}</AppText>
              <AppText tone="secondary" variant="caption">
                {t("dish.total", { count: activeSession.dishes.length })}
              </AppText>
            </View>

            <View style={styles.dishList}>
              {activeSession.dishes.map((dish) => {
                const dishNextEvent = eventsByDish?.[dish.id]?.events.find(
                  (event) =>
                    event.status === "due" || event.status === "upcoming",
                );

                return (
                  <DishCard
                    dish={dish}
                    key={dish.id}
                    nextEvent={dishNextEvent}
                  />
                );
              })}
            </View>
          </View>
        </View>
      ) : (
        <StateCard
          actionTitle={t("action.startDemo")}
          message={t("empty.noActiveMessage")}
          onActionPress={handleStartCookingSession}
          title={t("empty.noActiveTitle")}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xl,
  },
  brandBlock: {
    gap: spacing.sm,
  },
  dashboardStack: {
    gap: spacing.xl,
  },
  sessionCard: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between",
  },
  sessionCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  dishList: {
    gap: spacing.md,
  },
});
