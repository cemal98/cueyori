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
  cookingActionLabelKeys,
  cookingActionTypes,
  getSequentialStageOffsetMinutes,
  parseNonNegativeInteger,
  parsePositiveInteger,
  sortStageDrafts,
  syncCookingSessionNotifications,
  useCookingStore,
  validateDishFields,
  validateSequentialStageFields,
  type CookingActionType,
  type DishFormErrors,
  type DishStageDraft,
} from "../../../src/features/cooking";
import { useTranslation } from "../../../src/i18n";
import { colors, radii, spacing, useThemeColors } from "../../../src/theme";

const getRouteId = (id: string | string[] | undefined): string | undefined =>
  Array.isArray(id) ? id[0] : id;

export default function AddDishScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
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
  const { t } = useTranslation();
  const validationMessages = useMemo(
    () => ({
      dishNameRequired: t("error.dishName"),
      durationPositive: t("error.dishDuration"),
      stageRequired: t("error.stageRequired"),
      stagesInsideDuration: t("error.stagesInsideDuration"),
      stageTitleRequired: t("error.stageTitle"),
      stageOffsetNonNegative: t("error.stageOffset"),
      stageOffsetInsideDuration: t("error.stageOffsetInside"),
      durationFirst: t("error.durationFirst"),
    }),
    [t],
  );

  const session = useMemo(
    () =>
      sessionId
        ? sessions.find((currentSession) => currentSession.id === sessionId)
        : undefined,
    [sessionId, sessions],
  );

  const durationMinutes = parsePositiveInteger(duration);
  const stageDelayMinutes = parseNonNegativeInteger(stageOffset);

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
    const nextErrors = validateSequentialStageFields(
      stageTitle,
      stageDelayMinutes,
      durationMinutes,
      stages,
      validationMessages,
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
          offsetMinutes: getSequentialStageOffsetMinutes(
            currentStages,
            stageDelayMinutes ?? 0,
          ),
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
  }, [
    actionType,
    durationMinutes,
    stageDelayMinutes,
    stageTitle,
    stages,
    validationMessages,
  ]);

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
      validationMessages,
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
          dishName: t("error.addDishFailed"),
        }));
        return;
      }

      if (session.status === "active") {
        useCookingStore.getState().updateDish(sessionId, createdDish.id, {
          startedAt: new Date().toISOString(),
        });
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
  }, [
    dishName,
    durationMinutes,
    router,
    session,
    sessionId,
    stages,
    t,
    validationMessages,
  ]);

  if (!session) {
    return (
      <Screen>
        <View style={styles.header}>
          <Button onPress={handleBack} title={t("action.back")} variant="ghost" />
          <StateCard
            actionTitle={t("action.back")}
            message={t("session.missingMessage")}
            onActionPress={handleBack}
            title={t("session.missingTitle")}
            tone="error"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Button onPress={handleBack} title={t("action.back")} variant="ghost" />
        <View style={styles.titleStack}>
          <AppText variant="title">{t("action.addDish")}</AppText>
          <AppText tone="secondary">
            {t("dish.formSubtitle")}
          </AppText>
        </View>
      </View>

      <Card>
        <View style={styles.formStack}>
          <TextField
            autoCapitalize="words"
            error={errors.dishName}
            label={t("dish.nameLabel")}
            onChangeText={setDishName}
            placeholder={t("dish.namePlaceholder")}
            returnKeyType="next"
            value={dishName}
          />

          <TextField
            error={errors.duration}
            keyboardType="number-pad"
            label={t("dish.totalDurationLabel")}
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
            <AppText variant="headline">{t("stage.builderTitle")}</AppText>
            <AppText tone="secondary" variant="caption">
              {t("stage.oneAtATime")}
            </AppText>
          </View>

          <TextField
            autoCapitalize="sentences"
            error={errors.stageTitle}
            label={t("stage.titleLabel")}
            onChangeText={setStageTitle}
            placeholder={t("stage.titlePlaceholder")}
            returnKeyType="next"
            value={stageTitle}
          />

          <TextField
            error={errors.stageOffset}
            keyboardType="number-pad"
            label={t("stage.delayLabel")}
            onChangeText={setStageOffset}
            placeholder={t("stage.delayPlaceholder")}
            returnKeyType="done"
            value={stageOffset}
          />

          <View style={styles.selectorStack}>
            <AppText variant="label">{t("label.actionType")}</AppText>
            <View style={styles.actionGrid}>
              {cookingActionTypes.map((currentActionType) => {
                const isSelected = currentActionType === actionType;

                return (
                  <Pressable
                    accessibilityLabel={t(
                      cookingActionLabelKeys[currentActionType],
                    )}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={currentActionType}
                    onPress={() => {
                      setActionType(currentActionType);
                    }}
                    style={[
                      styles.actionChip,
                      { borderColor: themeColors.borderStrong },
                      isSelected && styles.actionChipSelected,
                    ]}
                  >
                    <AppText
                      tone={isSelected ? "inverse" : "accent"}
                      variant="caption"
                    >
                      {t(cookingActionLabelKeys[currentActionType])}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button
            onPress={handleAddStage}
            title={t("action.addStage")}
            variant="secondary"
          />

          {errors.stages ? (
            <AppText tone="accent" variant="caption">
              {errors.stages}
            </AppText>
          ) : null}
        </View>
      </Card>

      <View style={styles.previewSection}>
        <View style={styles.previewHeader}>
          <AppText variant="headline">{t("dish.stagePreview")}</AppText>
          <AppText tone="secondary" variant="caption">
            {t("dish.addedCount", { count: stages.length })}
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
                      +{t("dish.totalMinutes", {
                        count: stage.offsetMinutes,
                      })}, {t(cookingActionLabelKeys[stage.actionType])}
                    </AppText>
                  </View>
                  <Button
                    accessibilityLabel={`${t("action.remove")} ${stage.title}`}
                    haptic="warning"
                    onPress={() => {
                      handleRemoveStage(index);
                    }}
                    size="small"
                    title={t("action.remove")}
                    variant="ghost"
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card tone="muted">
            <AppText tone="secondary">
              {t("stage.emptyAdd")}
            </AppText>
          </Card>
        )}
      </View>

      <Button
        disabled={isSaving || session.status === "finished"}
        haptic="confirm"
        onPress={handleSave}
        title={isSaving ? t("action.saving") : t("action.saveDish")}
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
    borderWidth: 1.2,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionChipSelected: {
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
