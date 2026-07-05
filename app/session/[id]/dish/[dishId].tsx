import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AppText,
  Button,
  Card,
  Screen,
  TextField,
} from "../../../../src/components";
import {
  buildStageInput,
  buildStageUpdates,
  cookingActionLabels,
  cookingActionTypes,
  parseNonNegativeInteger,
  parsePositiveInteger,
  sortStageDrafts,
  syncCookingSessionNotifications,
  useCookingStore,
  validateDishFields,
  validateStageFields,
  type CookingActionType,
  type CookingStage,
  type DishFormErrors,
  type DishStageDraft,
} from "../../../../src/features/cooking";
import { colors, radii, spacing } from "../../../../src/theme";

type SaveMode = "idle" | "saving" | "deleting";

const getRouteId = (id: string | string[] | undefined): string | undefined =>
  Array.isArray(id) ? id[0] : id;

const toStageDrafts = (stages: CookingStage[]): DishStageDraft[] =>
  sortStageDrafts(
    stages.map((stage) => ({
      id: stage.id,
      title: stage.title,
      offsetMinutes: stage.offsetMinutes,
      actionType: stage.actionType,
    })),
  );

const getStageKey = (stage: DishStageDraft, index: number) =>
  stage.id ?? `${stage.title}-${stage.offsetMinutes}-${index}`;

export default function EditDishScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string | string[];
    dishId?: string | string[];
  }>();
  const sessionId = getRouteId(params.id);
  const dishId = getRouteId(params.dishId);
  const sessions = useCookingStore((state) => state.sessions);

  const [dishName, setDishName] = useState("");
  const [duration, setDuration] = useState("");
  const [stageTitle, setStageTitle] = useState("");
  const [stageOffset, setStageOffset] = useState("");
  const [actionType, setActionType] = useState<CookingActionType>("prep");
  const [stages, setStages] = useState<DishStageDraft[]>([]);
  const [editingStageIndex, setEditingStageIndex] = useState<number>();
  const [errors, setErrors] = useState<DishFormErrors>({});
  const [saveMode, setSaveMode] = useState<SaveMode>("idle");

  const session = useMemo(
    () =>
      sessionId
        ? sessions.find((currentSession) => currentSession.id === sessionId)
        : undefined,
    [sessionId, sessions],
  );

  const dish = useMemo(
    () =>
      dishId
        ? session?.dishes.find((currentDish) => currentDish.id === dishId)
        : undefined,
    [dishId, session],
  );

  const durationMinutes = parsePositiveInteger(duration);
  const stageOffsetMinutes = parseNonNegativeInteger(stageOffset);
  const isFinished = session?.status === "finished";
  const isBusy = saveMode !== "idle";
  const stageButtonTitle =
    editingStageIndex === undefined ? "Add Stage" : "Update Stage";

  useEffect(() => {
    if (!dish) {
      return;
    }

    setDishName(dish.name);
    setDuration(String(dish.totalMinutes));
    setStages(toStageDrafts(dish.stages));
    setStageTitle("");
    setStageOffset("");
    setActionType("prep");
    setEditingStageIndex(undefined);
    setErrors({});
  }, [dish]);

  const handleBack = useCallback(() => {
    if (sessionId) {
      router.replace({
        pathname: "/session/[id]",
        params: {
          id: sessionId,
        },
      });
      return;
    }

    router.replace("/");
  }, [router, sessionId]);

  const clearStageBuilder = useCallback(() => {
    setStageTitle("");
    setStageOffset("");
    setActionType("prep");
    setEditingStageIndex(undefined);
  }, []);

  const handleAddOrUpdateStage = useCallback(() => {
    const nextErrors = validateStageFields(
      stageTitle,
      stageOffsetMinutes,
      durationMinutes,
    );

    if (
      nextErrors.stageTitle ||
      nextErrors.stageOffset ||
      nextErrors.duration
    ) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        ...nextErrors,
        stages: undefined,
      }));
      return;
    }

    const nextStage: DishStageDraft = {
      id:
        editingStageIndex === undefined
          ? undefined
          : stages[editingStageIndex]?.id,
      title: stageTitle.trim(),
      offsetMinutes: stageOffsetMinutes ?? 0,
      actionType,
    };

    setStages((currentStages) => {
      if (editingStageIndex === undefined) {
        return sortStageDrafts([...currentStages, nextStage]);
      }

      return sortStageDrafts(
        currentStages.map((stage, index) =>
          index === editingStageIndex ? nextStage : stage,
        ),
      );
    });
    clearStageBuilder();
    setErrors((currentErrors) => ({
      ...currentErrors,
      stageTitle: undefined,
      stageOffset: undefined,
      stages: undefined,
    }));
  }, [
    actionType,
    clearStageBuilder,
    durationMinutes,
    editingStageIndex,
    stageOffsetMinutes,
    stageTitle,
    stages,
  ]);

  const handleEditStage = useCallback(
    (stageIndex: number) => {
      const stage = stages[stageIndex];

      if (!stage) {
        return;
      }

      setStageTitle(stage.title);
      setStageOffset(String(stage.offsetMinutes));
      setActionType(stage.actionType);
      setEditingStageIndex(stageIndex);
      setErrors((currentErrors) => ({
        ...currentErrors,
        stageTitle: undefined,
        stageOffset: undefined,
      }));
    },
    [stages],
  );

  const handleRemoveStage = useCallback(
    (stageIndex: number) => {
      setStages((currentStages) =>
        currentStages.filter((_, index) => index !== stageIndex),
      );

      if (editingStageIndex === stageIndex) {
        clearStageBuilder();
        return;
      }

      if (
        editingStageIndex !== undefined &&
        editingStageIndex > stageIndex
      ) {
        setEditingStageIndex(editingStageIndex - 1);
      }
    },
    [clearStageBuilder, editingStageIndex],
  );

  const handleSave = useCallback(async () => {
    if (!sessionId || !session || !dish || isFinished || isBusy) {
      return;
    }

    const nextErrors = validateDishFields(dishName, durationMinutes, stages);

    if (nextErrors.dishName || nextErrors.duration || nextErrors.stages) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        ...nextErrors,
      }));
      return;
    }

    setSaveMode("saving");

    try {
      const sortedStages = sortStageDrafts(stages);
      const nextStageIds = new Set(
        sortedStages
          .map((stage) => stage.id)
          .filter((stageId): stageId is CookingStage["id"] =>
            Boolean(stageId),
          ),
      );
      const cookingStore = useCookingStore.getState();

      cookingStore.updateDish(sessionId, dish.id, {
        name: dishName.trim(),
        totalMinutes: durationMinutes ?? dish.totalMinutes,
      });

      dish.stages.forEach((stage) => {
        if (!nextStageIds.has(stage.id)) {
          cookingStore.removeStage(sessionId, dish.id, stage.id);
        }
      });

      sortedStages.forEach((stage, order) => {
        if (stage.id) {
          cookingStore.updateStage(
            sessionId,
            dish.id,
            stage.id,
            buildStageUpdates(stage, order),
          );
          return;
        }

        cookingStore.addStage(
          sessionId,
          dish.id,
          buildStageInput(stage, order),
        );
      });

      await syncCookingSessionNotifications(sessionId);
      handleBack();
    } finally {
      setSaveMode("idle");
    }
  }, [
    dish,
    dishName,
    durationMinutes,
    handleBack,
    isBusy,
    isFinished,
    session,
    sessionId,
    stages,
  ]);

  const handleDeleteDish = useCallback(async () => {
    if (!sessionId || !dish || isFinished || isBusy) {
      return;
    }

    setSaveMode("deleting");

    try {
      useCookingStore.getState().removeDish(sessionId, dish.id);
      await syncCookingSessionNotifications(sessionId);
      handleBack();
    } finally {
      setSaveMode("idle");
    }
  }, [dish, handleBack, isBusy, isFinished, sessionId]);

  if (!session || !dish) {
    return (
      <Screen>
        <View style={styles.header}>
          <Button onPress={handleBack} title="Back" variant="ghost" />
          <AppText variant="title">Dish not found</AppText>
          <AppText tone="secondary">
            Go back and choose a dish from this cooking session.
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Button onPress={handleBack} title="Back" variant="ghost" />
        <View style={styles.titleStack}>
          <AppText variant="title">Edit Dish</AppText>
          <AppText tone="secondary">
            Tune the dish and CueYori will recalculate the timeline.
          </AppText>
        </View>
      </View>

      {isFinished ? (
        <Card tone="muted">
          <AppText tone="secondary">
            Finished sessions cannot be edited. Reset the session first if you
            need to change this dish.
          </AppText>
        </Card>
      ) : null}

      <Card>
        <View style={styles.formStack}>
          <TextField
            autoCapitalize="words"
            editable={!isFinished && !isBusy}
            error={errors.dishName}
            label="Dish name"
            onChangeText={setDishName}
            placeholder="Salmon"
            returnKeyType="next"
            value={dishName}
          />

          <TextField
            editable={!isFinished && !isBusy}
            error={errors.duration}
            keyboardType="number-pad"
            label="Total duration"
            onChangeText={setDuration}
            placeholder="24"
            returnKeyType="done"
            value={duration}
          />
        </View>
      </Card>

      <Card>
        <View style={styles.formStack}>
          <View style={styles.sectionTitle}>
            <AppText variant="headline">Stage builder</AppText>
            <AppText tone="secondary" variant="caption">
              {editingStageIndex === undefined
                ? "Add a new cue"
                : "Editing selected cue"}
            </AppText>
          </View>

          <TextField
            autoCapitalize="sentences"
            editable={!isFinished && !isBusy}
            error={errors.stageTitle}
            label="Stage title"
            onChangeText={setStageTitle}
            placeholder="Flip salmon"
            returnKeyType="next"
            value={stageTitle}
          />

          <TextField
            editable={!isFinished && !isBusy}
            error={errors.stageOffset}
            keyboardType="number-pad"
            label="Offset in minutes"
            onChangeText={setStageOffset}
            placeholder="8"
            returnKeyType="done"
            value={stageOffset}
          />

          <View style={styles.selectorStack}>
            <AppText variant="label">Action type</AppText>
            <View style={styles.actionGrid}>
              {cookingActionTypes.map((currentActionType) => {
                const isSelected = currentActionType === actionType;

                return (
                  <Pressable
                    accessibilityLabel={cookingActionLabels[currentActionType]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    disabled={isFinished || isBusy}
                    key={currentActionType}
                    onPress={() => {
                      setActionType(currentActionType);
                    }}
                    style={[
                      styles.actionChip,
                      isSelected && styles.actionChipSelected,
                      (isFinished || isBusy) && styles.disabledControl,
                    ]}
                  >
                    <AppText
                      tone={isSelected ? "inverse" : "accent"}
                      variant="caption"
                    >
                      {cookingActionLabels[currentActionType]}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.stageButtonRow}>
            <Button
              disabled={isFinished || isBusy}
              onPress={handleAddOrUpdateStage}
              title={stageButtonTitle}
              variant="secondary"
            />
            {editingStageIndex !== undefined ? (
              <Button
                disabled={isFinished || isBusy}
                onPress={clearStageBuilder}
                title="Cancel"
                variant="ghost"
              />
            ) : null}
          </View>

          {errors.stages ? (
            <AppText tone="accent" variant="caption">
              {errors.stages}
            </AppText>
          ) : null}
        </View>
      </Card>

      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <AppText variant="headline">Stages</AppText>
          <AppText tone="secondary" variant="caption">
            {stages.length} cues
          </AppText>
        </View>

        {stages.length > 0 ? (
          <View style={styles.stagePreviewList}>
            {stages.map((stage, index) => (
              <Card key={getStageKey(stage, index)}>
                <View style={styles.stagePreviewRow}>
                  <View style={styles.stagePreviewCopy}>
                    <AppText variant="label">{stage.title}</AppText>
                    <AppText tone="secondary" variant="caption">
                      +{stage.offsetMinutes} min,{" "}
                      {cookingActionLabels[stage.actionType]}
                    </AppText>
                  </View>
                  <View style={styles.previewActions}>
                    <Button
                      accessibilityLabel={`Edit ${stage.title}`}
                      disabled={isFinished || isBusy}
                      onPress={() => {
                        handleEditStage(index);
                      }}
                      size="small"
                      title="Edit"
                      variant="ghost"
                    />
                    <Button
                      accessibilityLabel={`Remove ${stage.title}`}
                      disabled={isFinished || isBusy}
                      onPress={() => {
                        handleRemoveStage(index);
                      }}
                      size="small"
                      title="Remove"
                      variant="ghost"
                    />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card tone="muted">
            <AppText tone="secondary">
              Keep at least one stage so CueYori can build the cooking timeline.
            </AppText>
          </Card>
        )}
      </View>

      <View style={styles.footerActions}>
        <Button
          disabled={isFinished || isBusy}
          onPress={handleSave}
          title={saveMode === "saving" ? "Saving" : "Save Changes"}
        />
        <Button
          disabled={isFinished || isBusy}
          onPress={handleDeleteDish}
          title={saveMode === "deleting" ? "Deleting" : "Delete Dish"}
          variant="ghost"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xl,
  },
  titleStack: {
    gap: spacing.sm,
  },
  formStack: {
    gap: spacing.lg,
  },
  sectionTitle: {
    gap: spacing.xs,
  },
  selectorStack: {
    gap: spacing.sm,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionChip: {
    minHeight: 40,
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionChipSelected: {
    borderColor: colors.accentDark,
    backgroundColor: colors.accentDark,
  },
  disabledControl: {
    opacity: 0.5,
  },
  stageButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  previewSection: {
    gap: spacing.md,
  },
  previewHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  stagePreviewList: {
    gap: spacing.sm,
  },
  stagePreviewRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  stagePreviewCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  previewActions: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  footerActions: {
    gap: spacing.md,
  },
});
