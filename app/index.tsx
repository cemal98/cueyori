import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Image, StyleSheet, View } from "react-native";

import { CueYoriLoadingScreen } from "../src/components/brand/CueYoriLoadingScreen";
import { AppText, Button, Card, Screen } from "../src/components";
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
import { brand, colors, radii, spacing, useThemeColors } from "../src/theme";

const emptyStateIcon = require("../assets/brand/cueyori-app-icon.png");
const dashboardRefreshMs = 30000;

export default function HomeScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
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
        pathname: "/session/[id]/add-dish",
        params: {
          id: session.id,
          firstDish: "1",
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

  const handleLoadingIntroFinish = useCallback(() => {
    setIsLoadingIntroVisible(false);
  }, []);

  return (
    <View style={styles.root}>
      <Screen>
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <AppText variant="headline">{brand.name}</AppText>
            <AppText tone="secondary" variant="caption">
              {t("app.tagline")}
            </AppText>
          </View>
        </View>

        {currentSession ? (
          <>
            <CueCard
              event={nextCue}
              remainingLabel={nextCueRemaining}
              variant="hero"
            />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleGroup}>
                  <AppText variant="headline">{t("home.activeCooking")}</AppText>
                  <AppText tone="secondary" variant="caption">
                    {t("dish.total", { count: currentSession.dishes.length })}
                  </AppText>
                </View>
              </View>

              <View style={styles.activeCookingStack}>
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
          </>
        ) : (
          <Card tone="muted">
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconFrame,
                  { borderColor: themeColors.borderStrong },
                ]}
              >
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="contain"
                  source={emptyStateIcon}
                  style={styles.emptyIcon}
                />
              </View>

              <View style={styles.emptyCopy}>
                <AppText align="center" variant="title">
                  {t("home.emptyTitle")}
                </AppText>
                <AppText align="center" tone="secondary" variant="body">
                  {t("home.emptySubtitle")}
                </AppText>
              </View>

              <Button
                accessibilityHint={t("home.emptySubtitle")}
                accessibilityLabel={t("action.newSession")}
                disabled={isStartingSession}
                haptic="confirm"
                onPress={handleStartCookingSession}
                title={t("action.newSession")}
              />
            </View>
          </Card>
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
    gap: spacing.sm,
  },
  brandBlock: {
    gap: spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    gap: spacing.xl,
    paddingVertical: spacing["2xl"],
  },
  emptyIconFrame: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: radii.md,
    borderWidth: 1.2,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 76,
    height: 76,
  },
  emptyCopy: {
    alignItems: "center",
    gap: spacing.sm,
    maxWidth: 320,
  },
  activeCookingStack: {
    gap: spacing.md,
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
    gap: spacing.lg,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionTitleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  dishList: {
    gap: spacing.md,
  },
});
