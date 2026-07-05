import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { CueYoriLoadingScreen } from "../src/components/brand/CueYoriLoadingScreen";
import { AppText, Button, Card, Screen } from "../src/components";
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
import { spacing } from "../src/theme";

const loadingIntroDurationMs = 2600;
const dashboardRefreshMs = 30000;

export default function HomeScreen() {
  const router = useRouter();
  const [isLoadingIntroVisible, setIsLoadingIntroVisible] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const sessions = useCookingStore((state) => state.sessions);

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
    ? formatRemainingTime(nextCue.scheduledAt, now)
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

  if (isLoadingIntroVisible) {
    return <CueYoriLoadingScreen />;
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.brandBlock}>
          <AppText variant="largeTitle">CueYori</AppText>
          <AppText tone="secondary" variant="body">
            Cook everything. Right on cue.
          </AppText>
        </View>

        <Button
          accessibilityLabel="Start Cooking Session"
          disabled={isStartingSession}
          onPress={handleStartCookingSession}
          title={isStartingSession ? "Preparing" : "Start Cooking Session"}
        />
      </View>

      {activeSession ? (
        <View style={styles.dashboardStack}>
          <Card
            accessibilityLabel="Open active cooking session"
            onPress={handleOpenActiveSession}
          >
            <View style={styles.sessionCard}>
              <View style={styles.sessionCopy}>
                <AppText tone="secondary" variant="label">
                  Active session
                </AppText>
                <AppText variant="headline">{activeSession.title}</AppText>
                <AppText tone="secondary" variant="body">
                  {activeSession.dishes.length} dishes in motion
                </AppText>
              </View>

              <TimerBadge
                label="Progress"
                value={`${timelineProgress?.completionPercent ?? 0}%`}
              />
            </View>
          </Card>

          <CueCard event={nextCue} remainingLabel={nextCueRemaining} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="headline">Active dishes</AppText>
              <AppText tone="secondary" variant="caption">
                {activeSession.dishes.length} total
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
        <Card tone="muted">
          <View style={styles.emptyState}>
            <AppText align="center" variant="headline">
              No session yet
            </AppText>
            <AppText align="center" tone="secondary" variant="body">
              Kitchen is calm.
            </AppText>
          </View>
        </Card>
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
  emptyState: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing["3xl"],
  },
});
