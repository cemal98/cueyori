import { useCallback, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import {
  AppText,
  Button,
  Card,
  Screen,
  StateCard,
  TextField,
} from "../../../src/components";
import {
  buildStageInput,
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
  type DishFormErrors,
  type DishStageDraft,
} from "../../../src/features/cooking";
import { colors, radii, spacing } from "../../../src/theme";

const getRouteId = (id: string | string[] | undefined): string | undefined =>
  Array.isArray(id) ? id[0] : id;

export default function AddDishScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = getRouteId(params.id);
  const sessions = useCookingStore((state) => state.sessions);

  const [dishName, setDishName] = useState("");
  const [duration, setDuration] = useState("");
  const [stageTitle, setStageTitle] = useState("");
  const [stageOffset, setStageOffset] = useState("");
  const [actionType, setActionType] = useState<CookingActionType>("prep");
  const [stages, setStages] = useState<DishStageDraft[]>([]);
  const [errors, setErrors] = useState<DishFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const session = useMemo(
    () =>
      sessionId
        ? sessions.find((currentSession) => currentSession.id === sessionId)
        : undefined,
    [sessionId, sessions],
  );

  const durationMinutes = parsePositiveInteger(duration);
  const stageOffsetMinutes = parseNonNegativeInteger(stageOffset);

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

  const handleAddStage = useCallback(() => {
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

    setStages((currentStages) =>
      sortStageDrafts([
        ...currentStages,
        {
          title: stageTitle.trim(),
          offsetMinutes: stageOffsetMinutes ?? 0,
          actionType,
        },
      ]),
    );
    setStageTitle("");
    setStageOffset("");
    setActionType("prep");
    setErrors((currentErrors) => ({
      ...currentErrors,
      stageTitle: undefined,
      stageOffset: undefined,
      stages: undefined,
    }));
  }, [actionType, durationMinutes, stageOffsetMinutes, stageTitle]);

  const handleRemoveStage = useCallback((stageIndex: number) => {
    setStages((currentStages) =>
      currentStages.filter((_, index) => index !== stageIndex),
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!sessionId || !session || session.status === "finished") {
      return;
    }

    const nextErrors = validateDishFields(
      dishName,
      durationMinutes,
      stages,
    );

    if (nextErrors.dishName || nextErrors.duration || nextErrors.stages) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        ...nextErrors,
      }));
      return;
    }

    setIsSaving(true);

    try {
      const createdDish = useCookingStore.getState().addDish(sessionId, {
        name: dishName.trim(),
        totalMinutes: durationMinutes ?? 0,
      });

      if (!createdDish) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          dishName: "Could not add this dish.",
        }));
        return;
      }

      stages.forEach((stage, order) => {
        useCookingStore
          .getState()
          .addStage(sessionId, createdDish.id, buildStageInput(stage, order));
      });

      await syncCookingSessionNotifications(sessionId);

      router.replace({
        pathname: "/session/[id]",
        params: {
          id: sessionId,
        },
      });
    } finally {
      setIsSaving(false);
    }
  }, [dishName, durationMinutes, router, session, sessionId, stages]);

  if (!session) {
    return (
      <Screen>
        <View style={styles.header}>
          <Button onPress={handleBack} title="Back" variant="ghost" />
          <StateCard
            actionTitle="Back"
            message="Go back and choose an active cooking session."
            onActionPress={handleBack}
            title="Session not found"
            tone="error"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Button onPress={handleBack} title="Back" variant="ghost" />
        <View style={styles.titleStack}>
          <AppText variant="title">Add Dish</AppText>
          <AppText tone="secondary">
            Add a dish and the cues CueYori should watch while you cook.
          </AppText>
        </View>
      </View>

      <Card>
        <View style={styles.formStack}>
          <TextField
            autoCapitalize="words"
            error={errors.dishName}
            label="Dish name"
            onChangeText={setDishName}
            placeholder="Salmon"
            returnKeyType="next"
            value={dishName}
          />

          <TextField
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
              Add one cue at a time
            </AppText>
          </View>

          <TextField
            autoCapitalize="sentences"
            error={errors.stageTitle}
            label="Stage title"
            onChangeText={setStageTitle}
            placeholder="Flip salmon"
            returnKeyType="next"
            value={stageTitle}
          />

          <TextField
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
                    key={currentActionType}
                    onPress={() => {
                      setActionType(currentActionType);
                    }}
                    style={[
                      styles.actionChip,
                      isSelected && styles.actionChipSelected,
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

          <Button onPress={handleAddStage} title="Add Stage" variant="secondary" />

          {errors.stages ? (
            <AppText tone="accent" variant="caption">
              {errors.stages}
            </AppText>
          ) : null}
        </View>
      </Card>

      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <AppText variant="headline">Stage preview</AppText>
          <AppText tone="secondary" variant="caption">
            {stages.length} added
          </AppText>
        </View>

        {stages.length > 0 ? (
          <View style={styles.stagePreviewList}>
            {stages.map((stage, index) => (
              <Card key={`${stage.title}-${stage.offsetMinutes}-${index}`}>
                <View style={styles.stagePreviewRow}>
                  <View style={styles.stagePreviewCopy}>
                    <AppText variant="label">{stage.title}</AppText>
                    <AppText tone="secondary" variant="caption">
                      +{stage.offsetMinutes} min,{" "}
                      {cookingActionLabels[stage.actionType]}
                    </AppText>
                  </View>
                  <Button
                    accessibilityLabel={`Remove ${stage.title}`}
                    haptic="warning"
                    onPress={() => {
                      handleRemoveStage(index);
                    }}
                    size="small"
                    title="Remove"
                    variant="ghost"
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card tone="muted">
            <AppText tone="secondary">
              Add at least one stage before saving this dish.
            </AppText>
          </Card>
        )}
      </View>

      <Button
        disabled={isSaving || session.status === "finished"}
        haptic="confirm"
        onPress={handleSave}
        title={isSaving ? "Saving" : "Save Dish"}
      />
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
});
