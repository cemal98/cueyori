import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Screen, StateCard } from "../../src/components";
import {
  completeCookingStage,
  CueCard,
  finishCookingSession,
  formatRemainingTime,
  generateTimeline,
  getNextTimelineEvent,
  getTimelineProgress,
  pauseCookingSession,
  resetCookingSession,
  resumeCookingSession,
  sessionStatusLabels,
  StageRow,
  TimelineEventRow,
  uncompleteCookingStage,
  useCookingStore,
  type CookingSession,
  type CookingStage,
  type Dish,
} from "../../src/features/cooking";
import { colors, radii, spacing } from "../../src/theme";

const sessionRefreshMs = 15000;

type BusyAction =
  | "pause"
  | "resume"
  | "finish"
  | "reset"
  | `stage:${string}`
  | undefined;

const getRouteId = (id: string | string[] | undefined): string | undefined =>
  Array.isArray(id) ? id[0] : id;

const getStageStats = (session: CookingSession) => {
  const stages = session.dishes.flatMap((dish) => dish.stages);
  const completedStages = stages.filter(
    (stage) => stage.status === "completed" || Boolean(stage.completedAt),
  ).length;

  return {
    totalStages: stages.length,
    completedStages,
    remainingStages: stages.length - completedStages,
  };
};

export default function ActiveCookingSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = getRouteId(params.id);
  const [now, setNow] = useState(() => new Date());
  const [busyAction, setBusyAction] = useState<BusyAction>();
  const sessions = useCookingStore((state) => state.sessions);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, sessionRefreshMs);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const session = useMemo(
    () =>
      sessionId
        ? sessions.find((currentSession) => currentSession.id === sessionId)
        : undefined,
    [sessionId, sessions],
  );

  const timeline = useMemo(
    () => (session ? generateTimeline(session, now) : []),
    [now, session],
  );

  const nextCue = useMemo(() => {
    if (!session || session.status === "draft" || session.status === "finished") {
      return undefined;
    }

    return getNextTimelineEvent(session, now);
  }, [now, session]);

  const timelineProgress = useMemo(
    () => (session ? getTimelineProgress(session, now) : undefined),
    [now, session],
  );

  const stageStats = useMemo(
    () =>
      session
        ? getStageStats(session)
        : {
            totalStages: 0,
            completedStages: 0,
            remainingStages: 0,
          },
    [session],
  );

  const eventByStageId = useMemo(
    () =>
      new Map<CookingStage["id"], (typeof timeline)[number]>(
        timeline.map((event) => [event.stageId, event]),
      ),
    [timeline],
  );

  const nextCueRemaining = nextCue
    ? formatRemainingTime(nextCue.scheduledAt, now)
    : undefined;

  const emptyCueCopy = useMemo(() => {
    if (session?.status === "finished") {
      return {
        title: "Session finished",
        message: "All cooking cues are complete. Nothing else needs attention.",
      };
    }

    if (
      stageStats.totalStages > 0 &&
      stageStats.completedStages === stageStats.totalStages
    ) {
      return {
        title: "Ready to finish",
        message: "All stages are done. Complete the session when the meal is ready.",
      };
    }

    if (session?.status === "paused") {
      return {
        title: "Session paused",
        message: "Resume when you are ready to continue cooking.",
      };
    }

    return {
      title: "All cues are clear",
      message: "Nothing needs attention right now.",
    };
  }, [session?.status, stageStats.completedStages, stageStats.totalStages]);

  const handleGoHome = useCallback(() => {
    router.replace("/");
  }, [router]);

  const handleAddDish = useCallback(() => {
    if (!session) {
      return;
    }

    router.push({
      pathname: "/session/[id]/add-dish",
      params: {
        id: session.id,
      },
    });
  }, [router, session]);

  const handleEditDish = useCallback(
    (dishId: Dish["id"]) => {
      if (!session) {
        return;
      }

      router.push({
        pathname: "/session/[id]/dish/[dishId]",
        params: {
          id: session.id,
          dishId,
        },
      });
    },
    [router, session],
  );

  const runSessionAction = useCallback(
    async (action: Exclude<BusyAction, undefined>, command: () => Promise<void>) => {
      if (busyAction) {
        return;
      }

      setBusyAction(action);

      try {
        await command();
        setNow(new Date());
      } finally {
        setBusyAction(undefined);
      }
    },
    [busyAction],
  );

  const handlePause = useCallback(() => {
    if (!session) {
      return;
    }

    void runSessionAction("pause", () => pauseCookingSession(session.id));
  }, [runSessionAction, session]);

  const handleResume = useCallback(() => {
    if (!session) {
      return;
    }

    void runSessionAction("resume", () => resumeCookingSession(session.id));
  }, [runSessionAction, session]);

  const handleFinish = useCallback(() => {
    if (!session) {
      return;
    }

    void runSessionAction("finish", () => finishCookingSession(session.id));
  }, [runSessionAction, session]);

  const handleReset = useCallback(() => {
    if (!session) {
      return;
    }

    void runSessionAction("reset", () => resetCookingSession(session.id));
  }, [runSessionAction, session]);

  const handleToggleStage = useCallback(
    (dishId: Dish["id"], stage: CookingStage) => {
      if (!session) {
        return;
      }

      const isCompleted =
        stage.status === "completed" || Boolean(stage.completedAt);
      const action: BusyAction = `stage:${stage.id}`;

      void runSessionAction(action, () =>
        isCompleted
          ? uncompleteCookingStage(session.id, dishId, stage.id)
          : completeCookingStage(session.id, dishId, stage.id),
      );
    },
    [runSessionAction, session],
  );

  const handleCompleteNextCue = useCallback(() => {
    if (!session || !nextCue) {
      return;
    }

    const action: BusyAction = `stage:${nextCue.stageId}`;
    const currentSessionId = session.id;

    void runSessionAction(action, () =>
      completeCookingStage(currentSessionId, nextCue.dishId, nextCue.stageId),
    );
  }, [nextCue, runSessionAction, session]);

  if (!session) {
    return (
      <Screen>
        <View style={styles.header}>
          <Button onPress={handleGoHome} title="Back Home" variant="ghost" />
          <StateCard
            actionTitle="Back Home"
            message="This cooking session is no longer available."
            onActionPress={handleGoHome}
            title="Session not found"
            tone="error"
          />
        </View>
      </Screen>
    );
  }

  const canPause = session.status === "active";
  const canResume = session.status === "paused";
  const controlsDisabled = Boolean(busyAction);
  const progressDoneLabel = `${timelineProgress?.completedEvents ?? 0}/${
    timelineProgress?.totalEvents ?? stageStats.totalStages
  } done`;

  return (
    <Screen>
      <View style={styles.header}>
        <Button
          accessibilityLabel="Go back to Home"
          onPress={handleGoHome}
          title="Back Home"
          variant="ghost"
        />

        <View style={styles.titleBlock}>
          <View style={styles.statusPill}>
            <AppText tone="accent" variant="caption">
              {sessionStatusLabels[session.status]}
            </AppText>
          </View>
          <AppText variant="title">{session.title}</AppText>
          <AppText tone="secondary" variant="body">
            {session.dishes.length} dishes, {stageStats.totalStages} cues
          </AppText>
        </View>

        <Button
          accessibilityLabel="Add Dish"
          accessibilityHint="Opens the dish and stage builder."
          disabled={session.status === "finished"}
          onPress={handleAddDish}
          title="Add Dish"
          variant="secondary"
        />
      </View>

      <CueCard
        actionDisabled={nextCue ? busyAction === `stage:${nextCue.stageId}` : true}
        actionTitle={nextCue ? "Done" : undefined}
        emptyMessage={emptyCueCopy.message}
        emptyTitle={emptyCueCopy.title}
        event={nextCue}
        onActionPress={nextCue ? handleCompleteNextCue : undefined}
        remainingLabel={nextCueRemaining}
      />

      <Card>
        <View style={styles.controlStack}>
          <View style={styles.progressRow}>
            <View>
              <AppText tone="secondary" variant="label">
                Cooking progress
              </AppText>
              <AppText variant="metric">
                {timelineProgress?.completionPercent ?? 0}%
              </AppText>
            </View>
            <View style={styles.progressMeta}>
              <AppText tone="secondary" variant="caption">
                {progressDoneLabel}
              </AppText>
              <AppText tone="secondary" variant="caption">
                {stageStats.remainingStages} remaining
              </AppText>
            </View>
          </View>

          <View style={styles.controlGrid}>
            {canPause ? (
              <Button
                disabled={controlsDisabled}
                haptic="warning"
                onPress={handlePause}
                size="small"
                title="Pause"
                variant="ghost"
              />
            ) : null}

            {canResume ? (
              <Button
                disabled={controlsDisabled}
                haptic="confirm"
                onPress={handleResume}
                size="small"
                title="Resume"
                variant="primary"
              />
            ) : null}

            <Button
              disabled={controlsDisabled || session.status === "finished"}
              haptic="confirm"
              onPress={handleFinish}
              size="small"
              title={session.status === "finished" ? "Finished" : "Complete"}
              variant="secondary"
            />
            <Button
              disabled={controlsDisabled}
              haptic="warning"
              onPress={handleReset}
              size="small"
              title="Reset"
              variant="ghost"
            />
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="headline">Unified timeline</AppText>
          <AppText tone="secondary" variant="caption">
            {timeline.length} events
          </AppText>
        </View>

        <View style={styles.timelineList}>
          {timeline.length > 0 ? (
            timeline.map((event) => (
              <TimelineEventRow
                event={event}
                key={event.id}
                remainingLabel={formatRemainingTime(event.scheduledAt, now)}
              />
            ))
          ) : (
            <Card tone="muted">
              <AppText tone="secondary">
                Timeline will appear when cues are available.
              </AppText>
            </Card>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="headline">Dishes and stages</AppText>
          <AppText tone="secondary" variant="caption">
            {session.dishes.length} dishes
          </AppText>
        </View>

        <View style={styles.dishGroups}>
          {session.dishes.map((dish) => {
            const completedDishStages = dish.stages.filter(
              (stage) =>
                stage.status === "completed" || Boolean(stage.completedAt),
            ).length;

            return (
              <Card key={dish.id}>
                <View style={styles.dishGroup}>
                  <View style={styles.dishHeader}>
                    <View style={styles.dishTitle}>
                      <AppText variant="headline">{dish.name}</AppText>
                      <AppText tone="secondary" variant="caption">
                        {dish.totalMinutes} min, {dish.stages.length} cues
                      </AppText>
                    </View>
                    <View style={styles.dishActions}>
                      <View style={styles.dishBadge}>
                        <AppText tone="accent" variant="caption">
                          {completedDishStages}/{dish.stages.length} done
                        </AppText>
                      </View>
                      <Button
                        accessibilityLabel={`Edit ${dish.name}`}
                        accessibilityHint="Opens dish timing and stage editing."
                        disabled={session.status === "finished"}
                        onPress={() => {
                          handleEditDish(dish.id);
                        }}
                        size="small"
                        title="Edit"
                        variant="ghost"
                      />
                    </View>
                  </View>

                  <View style={styles.stageList}>
                    {dish.stages.map((stage) => {
                      const event = eventByStageId.get(stage.id);
                      const stageRemainingLabel = event
                        ? formatRemainingTime(event.scheduledAt, now)
                        : undefined;

                      return (
                        <StageRow
                          disabled={busyAction === `stage:${stage.id}`}
                          event={event}
                          key={stage.id}
                          onToggle={() => {
                            handleToggleStage(dish.id, stage);
                          }}
                          remainingLabel={stageRemainingLabel}
                          stage={stage}
                        />
                      );
                    })}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xl,
  },
  titleBlock: {
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  statusPill: {
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  controlStack: {
    gap: spacing.xl,
  },
  progressRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  progressMeta: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  controlGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
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
  timelineList: {
    gap: spacing.sm,
  },
  dishGroups: {
    gap: spacing.md,
  },
  dishGroup: {
    gap: spacing.lg,
  },
  dishHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  dishTitle: {
    flex: 1,
    gap: spacing.xs,
  },
  dishBadge: {
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dishActions: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  stageList: {
    gap: spacing.sm,
  },
});
