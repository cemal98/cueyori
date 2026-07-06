import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { CueYoriLoadingScreen } from "../src/components/brand/CueYoriLoadingScreen";
import { AppText, Button, Card, Screen, StateCard } from "../src/components";
import { useTranslation } from "../src/i18n";
import {
  CueCard,
  DishCard,
  finishCookingSession,
  formatRemainingTime,
  getEventsByDish,
  getNextTimelineEvent,
  getSessionDisplayTitle,
  getTimelineProgress,
  TimerBadge,
  useCookingStore,
} from "../src/features/cooking";
import { brand, spacing } from "../src/theme";

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
    const interval = setInterval(() => {
      setNow(new Date());
    }, dashboardRefreshMs);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const currentSession = useMemo(
    () =>
      [...sessions]
        .reverse()
        .find((session) => session.status !== "finished"),
    [sessions],
  );

  const nextCue = useMemo(
    () =>
      currentSession?.status === "active"
        ? getNextTimelineEvent(currentSession, now)
        : undefined,
    [currentSession, now],
  );

  const timelineProgress = useMemo(
    () => (currentSession ? getTimelineProgress(currentSession, now) : undefined),
    [currentSession, now],
  );

  const eventsByDish = useMemo(
    () => (currentSession ? getEventsByDish(currentSession, now) : undefined),
    [currentSession, now],
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
      const currentStore = useCookingStore.getState();
      const activeSessionIds = currentStore.sessions
        .filter((session) => session.status === "active")
        .map((session) => session.id);

      await Promise.all(activeSessionIds.map(finishCookingSession));

      const session = useCookingStore
        .getState()
        .createSession();

      setNow(new Date());
      router.push({
        pathname: "/session/[id]",
        params: {
          id: session.id,
        },
      });
    } finally {
      setIsStartingSession(false);
    }
  }, [isStartingSession, router]);

  const handleOpenCurrentSession = useCallback(() => {
    if (!currentSession) {
      return;
    }

    router.push({
      pathname: "/session/[id]",
      params: {
        id: currentSession.id,
      },
    });
  }, [currentSession, router]);

  const handleOpenSettings = useCallback(() => {
    router.push("/settings" as never);
  }, [router]);

  const handleLoadingIntroFinish = useCallback(() => {
    setIsLoadingIntroVisible(false);
  }, []);

  return (
    <View style={styles.root}>
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
            accessibilityLabel={t("action.newSession")}
            disabled={isStartingSession}
            haptic="confirm"
            onPress={handleStartCookingSession}
            title={
              isStartingSession
                ? t("home.preparing")
                : t("action.newSession")
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

        {currentSession ? (
          <View style={styles.dashboardStack}>
            <Card
              accessibilityHint={t("session.timelineTitle")}
              accessibilityLabel={t("home.currentSession")}
              onPress={handleOpenCurrentSession}
            >
              <View style={styles.sessionCard}>
                <View style={styles.sessionCopy}>
                  <AppText tone="secondary" variant="label">
                    {t("home.currentSession")}
                  </AppText>
                  <AppText variant="headline">
                    {getSessionDisplayTitle(
                      currentSession.title,
                      t("session.defaultTitle"),
                    )}
                  </AppText>
                  <AppText tone="secondary" variant="body">
                    {t("dish.dishesInMotion", {
                      count: currentSession.dishes.length,
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
                  {t("dish.total", { count: currentSession.dishes.length })}
                </AppText>
              </View>

              <View style={styles.dishList}>
                {currentSession.dishes.map((dish) => {
                  const dishNextEvent = eventsByDish?.[dish.id]?.events.find(
                    (event) =>
                      event.status === "missed" ||
                      event.status === "due" ||
                      event.status === "upcoming",
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
            actionTitle={t("action.newSession")}
            message={t("empty.noActiveMessage")}
            onActionPress={handleStartCookingSession}
            title={t("empty.noActiveTitle")}
          />
        )}
      </Screen>

      {isLoadingIntroVisible ? (
        <CueYoriLoadingScreen
          onFinish={handleLoadingIntroFinish}
          style={styles.loadingOverlay}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
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
