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
  getSessionDisplayTitle,
  getTimelineProgress,
  pauseCookingSession,
  resetCookingSession,
  resumeCookingSession,
  sessionStatusLabelKeys,
  startCookingSession,
  StageRow,
  TimelineEventRow,
  uncompleteCookingStage,
  useCookingStore,
  type CookingSession,
  type CookingStage,
  type Dish,
} from "../../src/features/cooking";
import { useTranslation } from "../../src/i18n";
import { colors, radii, spacing } from "../../src/theme";

const sessionRefreshMs = 15000;

type BusyAction =
  | "start"
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
    ? formatRemainingTime(nextCue.scheduledAt, now, remainingTimeFormat)
    : undefined;

  const emptyCueCopy = useMemo(() => {
    if (session?.status === "finished") {
      return {
        title: t("session.finishedCueTitle"),
        message: t("session.finishedCueMessage"),
      };
    }

    if (
      stageStats.totalStages > 0 &&
      stageStats.completedStages === stageStats.totalStages
    ) {
      return {
        title: t("session.readyToFinish"),
        message: t("session.completeWhenReady"),
      };
    }

    if (session?.status === "paused") {
      return {
        title: t("session.pausedCueTitle"),
        message: t("session.pausedCueMessage"),
      };
    }

    return {
      title: t("session.allClearTitle"),
      message: t("session.allClearMessage"),
    };
  }, [session?.status, stageStats.completedStages, stageStats.totalStages, t]);

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

  const handleStart = useCallback(() => {
    if (!session) {
      return;
    }

    void runSessionAction("start", () => startCookingSession(session.id));
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
            actionTitle={t("action.backHome")}
            message={t("session.missingMessage")}
            onActionPress={handleGoHome}
            title={t("session.missingTitle")}
            tone="error"
          />
        </View>
      </Screen>
    );
  }

  const canStart = session.status === "draft";
  const canPause = session.status === "active";
  const canResume = session.status === "paused";
  const controlsDisabled = Boolean(busyAction);
  const sessionTitle = getSessionDisplayTitle(
    session.title,
    t("session.defaultTitle"),
  );
  const progressDoneLabel = t("label.doneCount", {
    count: `${timelineProgress?.completedEvents ?? 0}/${
      timelineProgress?.totalEvents ?? stageStats.totalStages
    }`,
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Button
          accessibilityLabel={t("action.backHome")}
          onPress={handleGoHome}
          title={t("action.backHome")}
          variant="ghost"
        />

        <View style={styles.titleBlock}>
          <View style={styles.statusPill}>
            <AppText tone="accent" variant="caption">
              {t(sessionStatusLabelKeys[session.status])}
            </AppText>
          </View>
          <AppText variant="title">{sessionTitle}</AppText>
          <AppText tone="secondary" variant="body">
            {t("dish.dishesAndCues", {
              dishes: session.dishes.length,
              cues: stageStats.totalStages,
            })}
          </AppText>
        </View>

        <Button
          accessibilityLabel={t("action.addDish")}
          accessibilityHint={t("dish.formSubtitle")}
          disabled={session.status === "finished"}
          onPress={handleAddDish}
          title={t("action.addDish")}
          variant="secondary"
        />
      </View>

      <CueCard
        actionDisabled={nextCue ? busyAction === `stage:${nextCue.stageId}` : true}
        actionTitle={nextCue ? t("action.done") : undefined}
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
                {t("label.cookingProgress")}
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
                {t("label.remaining", { count: stageStats.remainingStages })}
              </AppText>
            </View>
          </View>

          <View style={styles.controlGrid}>
            {canStart ? (
              <Button
                disabled={controlsDisabled || stageStats.totalStages === 0}
                haptic="confirm"
                onPress={handleStart}
                size="small"
                title={t("action.startSession")}
                variant="primary"
              />
            ) : null}

            {canPause ? (
              <Button
                disabled={controlsDisabled}
                haptic="warning"
                onPress={handlePause}
                size="small"
                title={t("action.pause")}
                variant="ghost"
              />
            ) : null}

            {canResume ? (
              <Button
                disabled={controlsDisabled}
                haptic="confirm"
                onPress={handleResume}
                size="small"
                title={t("action.resume")}
                variant="primary"
              />
            ) : null}

            <Button
              disabled={
                controlsDisabled ||
                session.status === "draft" ||
                session.status === "finished"
              }
              haptic="confirm"
              onPress={handleFinish}
              size="small"
              title={
                session.status === "finished"
                  ? t("session.finishedLabel")
                  : t("action.complete")
              }
              variant="secondary"
            />
            <Button
              disabled={controlsDisabled}
              haptic="warning"
              onPress={handleReset}
              size="small"
              title={t("action.reset")}
              variant="ghost"
            />
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="headline">{t("session.timelineTitle")}</AppText>
          <AppText tone="secondary" variant="caption">
            {t("label.eventCount", { count: timeline.length })}
          </AppText>
        </View>

        <View style={styles.timelineList}>
          {timeline.length > 0 ? (
            timeline.map((event) => (
              <TimelineEventRow
                event={event}
                key={event.id}
                remainingLabel={formatRemainingTime(
                  event.scheduledAt,
                  now,
                  remainingTimeFormat,
                )}
              />
            ))
          ) : (
            <Card tone="muted">
              <AppText tone="secondary">
                {t("session.timelineEmpty")}
              </AppText>
            </Card>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="headline">{t("session.dishesAndStages")}</AppText>
          <AppText tone="secondary" variant="caption">
            {t("dish.total", { count: session.dishes.length })}
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
                        {t("dish.totalMinutesCues", {
                          minutes: dish.totalMinutes,
                          cues: dish.stages.length,
                        })}
                      </AppText>
                    </View>
                    <View style={styles.dishActions}>
                      <View style={styles.dishBadge}>
                        <AppText tone="accent" variant="caption">
                          {t("label.doneCount", {
                            count: `${completedDishStages}/${dish.stages.length}`,
                          })}
                        </AppText>
                      </View>
                      <Button
                        accessibilityLabel={`${t("action.edit")} ${dish.name}`}
                        accessibilityHint={t("dish.editHint")}
                        disabled={session.status === "finished"}
                        onPress={() => {
                          handleEditDish(dish.id);
                        }}
                        size="small"
                        title={t("action.edit")}
                        variant="ghost"
                      />
                    </View>
                  </View>

                  <View style={styles.stageList}>
                    {dish.stages.map((stage) => {
                      const event = eventByStageId.get(stage.id);
                      const stageRemainingLabel = event
                        ? formatRemainingTime(
                            event.scheduledAt,
                            now,
                            remainingTimeFormat,
                          )
                        : undefined;

                      return (
                        <StageRow
                          disabled={
                            session.status === "draft" ||
                            busyAction === `stage:${stage.id}`
                          }
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
