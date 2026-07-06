import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppText, Button, Card, Screen, StateCard, TextField } from "../src/components";
import {
  cookingActionLabelKeys,
  cookingActionTypes,
  finishCookingSession,
  getSequentialStageOffsetMinutes,
  parseNonNegativeInteger,
  parsePositiveInteger,
  sortStageDrafts,
  startCookingSession,
  useCookingStore,
  validateSequentialStageFields,
  type CookingActionType,
  type DishStageDraft,
} from "../src/features/cooking";
import {
  useRecipeBookStore,
  type RecipeTemplate,
  type RecipeTemplateStage,
} from "../src/features/recipe-book";
import { useTranslation } from "../src/i18n";
import { colors, radii, spacing, useThemeColors } from "../src/theme";

const createTemplateStageId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

const templateStagesToDrafts = (
  templateStages: RecipeTemplateStage[],
): DishStageDraft[] =>
  sortStageDrafts(
    templateStages.map((stage) => ({
      id: stage.id,
      title: stage.title,
      actionType: stage.actionType,
      offsetMinutes: stage.offsetMinutes,
    })),
  );

const draftsToTemplateStages = (
  drafts: DishStageDraft[],
): RecipeTemplateStage[] =>
  sortStageDrafts(drafts).map((stage, order) => ({
    id: stage.id ?? createTemplateStageId(),
    title: stage.title.trim(),
    actionType: stage.actionType,
    offsetMinutes: stage.offsetMinutes,
    order,
  }));

const getTemplateDuration = (template: RecipeTemplate): number =>
  template.estimatedDurationMinutes ??
  Math.max(
    1,
    ...template.templateStages.map((stage) => stage.offsetMinutes),
  );

export default function RecipeBookScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [duration, setDuration] = useState("");
  const [stageTitle, setStageTitle] = useState("");
  const [stageDelay, setStageDelay] = useState("");
  const [actionType, setActionType] = useState<CookingActionType>("prep");
  const [stages, setStages] = useState<DishStageDraft[]>([]);
  const [editingTemplateId, setEditingTemplateId] =
    useState<RecipeTemplate["id"]>();
  const [error, setError] = useState<string>();
  const [stageError, setStageError] = useState<string>();
  const templates = useRecipeBookStore((state) => state.templates);
  const createTemplate = useRecipeBookStore((state) => state.createTemplate);
  const updateTemplate = useRecipeBookStore((state) => state.updateTemplate);
  const deleteTemplate = useRecipeBookStore((state) => state.deleteTemplate);
  const toggleFavorite = useRecipeBookStore((state) => state.toggleFavorite);
  const markTemplateCooked = useRecipeBookStore(
    (state) => state.markTemplateCooked,
  );
  const { t } = useTranslation();

  const sortedTemplates = useMemo(
    () =>
      [...templates].sort((first, second) => {
        if (first.isFavorite !== second.isFavorite) {
          return first.isFavorite ? -1 : 1;
        }

        return (
          new Date(second.updatedAt).getTime() -
          new Date(first.updatedAt).getTime()
        );
      }),
    [templates],
  );

  const editingTemplate = useMemo(
    () => templates.find((template) => template.id === editingTemplateId),
    [editingTemplateId, templates],
  );

  const durationMinutes = parsePositiveInteger(duration);
  const stageDelayMinutes = parseNonNegativeInteger(stageDelay);
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

  const clearForm = useCallback(() => {
    setTitle("");
    setBody("");
    setDuration("");
    setStageTitle("");
    setStageDelay("");
    setActionType("prep");
    setStages([]);
    setEditingTemplateId(undefined);
    setError(undefined);
    setStageError(undefined);
  }, []);

  const clearStageBuilder = useCallback(() => {
    setStageTitle("");
    setStageDelay("");
    setActionType("prep");
    setStageError(undefined);
  }, []);

  const handleAddStage = useCallback(() => {
    const nextErrors = validateSequentialStageFields(
      stageTitle,
      stageDelayMinutes,
      durationMinutes,
      stages,
      validationMessages,
    );

    if (nextErrors.stageTitle || nextErrors.stageOffset || nextErrors.duration) {
      setStageError(
        nextErrors.stageTitle ?? nextErrors.stageOffset ?? nextErrors.duration,
      );
      return;
    }

    setStages((currentStages) =>
      sortStageDrafts([
        ...currentStages,
        {
          id: createTemplateStageId(),
          title: stageTitle.trim(),
          actionType,
          offsetMinutes: getSequentialStageOffsetMinutes(
            currentStages,
            stageDelayMinutes ?? 0,
          ),
        },
      ]),
    );
    clearStageBuilder();
  }, [
    actionType,
    clearStageBuilder,
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

  const handleSaveTemplate = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle && !trimmedBody) {
      setError(t("recipeBook.errorEmpty"));
      return;
    }

    if (stages.length > 0 && !durationMinutes) {
      setError(t("error.durationFirst"));
      return;
    }

    if (
      durationMinutes !== undefined &&
      stages.some((stage) => stage.offsetMinutes > durationMinutes)
    ) {
      setError(t("error.stagesInsideDuration"));
      return;
    }

    const input = {
      title: trimmedTitle || t("recipeBook.untitled"),
      body: trimmedBody,
      estimatedDurationMinutes: durationMinutes,
      templateStages: draftsToTemplateStages(stages),
    };

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        ...input,
        isFavorite: editingTemplate.isFavorite,
      });
    } else {
      createTemplate(input);
    }

    clearForm();
  }, [
    body,
    clearForm,
    createTemplate,
    durationMinutes,
    editingTemplate,
    stages,
    t,
    title,
    updateTemplate,
  ]);

  const handleEditTemplate = useCallback((template: RecipeTemplate) => {
    setEditingTemplateId(template.id);
    setTitle(template.title);
    setBody(template.body);
    setDuration(
      template.estimatedDurationMinutes
        ? String(template.estimatedDurationMinutes)
        : "",
    );
    setStages(templateStagesToDrafts(template.templateStages));
    setStageTitle("");
    setStageDelay("");
    setActionType("prep");
    setError(undefined);
    setStageError(undefined);
  }, []);

  const handleDeleteTemplate = useCallback(
    (templateId: RecipeTemplate["id"]) => {
      deleteTemplate(templateId);

      if (editingTemplateId === templateId) {
        clearForm();
      }
    },
    [clearForm, deleteTemplate, editingTemplateId],
  );

  const handleStartTemplate = useCallback(
    async (template: RecipeTemplate) => {
      const cookingStore = useCookingStore.getState();
      const activeSessionIds = cookingStore.sessions
        .filter((session) => session.status === "active")
        .map((session) => session.id);

      await Promise.all(activeSessionIds.map(finishCookingSession));

      const session = cookingStore.createSession(template.title);
      const dish = cookingStore.addDish(session.id, {
        name: template.title,
        note: template.body,
        totalMinutes: getTemplateDuration(template),
      });

      if (dish) {
        template.templateStages
          .slice()
          .sort((first, second) => first.offsetMinutes - second.offsetMinutes)
          .forEach((stage, order) => {
            cookingStore.addStage(session.id, dish.id, {
              title: stage.title,
              actionType: stage.actionType,
              offsetMinutes: stage.offsetMinutes,
              order,
              durationMinutes: stage.durationMinutes,
              heatLevel: stage.heatLevel,
              note: stage.note,
            });
          });
      }

      markTemplateCooked(template.id);
      await startCookingSession(session.id);

      router.push({
        pathname: "/session/[id]",
        params: {
          id: session.id,
        },
      });
    },
    [markTemplateCooked, router],
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.titleStack}>
          <AppText variant="largeTitle">{t("recipeBook.title")}</AppText>
          <AppText tone="secondary">{t("recipeBook.subtitle")}</AppText>
        </View>
      </View>

      <Card>
        <View style={styles.formStack}>
          <TextField
            autoCapitalize="sentences"
            label={t("recipeBook.noteTitleLabel")}
            onChangeText={setTitle}
            placeholder={t("recipeBook.noteTitlePlaceholder")}
            value={title}
          />

          <View style={styles.bodyFieldStack}>
            <AppText variant="label">{t("recipeBook.noteBodyLabel")}</AppText>
            <TextInput
              accessibilityLabel={t("recipeBook.noteBodyLabel")}
              multiline
              onChangeText={setBody}
              placeholder={t("recipeBook.noteBodyPlaceholder")}
              placeholderTextColor={colors.charcoalSubtle}
              selectionColor={colors.accent}
              style={[
                styles.bodyInput,
                { borderColor: themeColors.borderStrong },
              ]}
              textAlignVertical="top"
              value={body}
            />
          </View>

          <TextField
            keyboardType="number-pad"
            label={t("recipeBook.estimatedDurationLabel")}
            onChangeText={setDuration}
            placeholder={t("recipeBook.estimatedDurationPlaceholder")}
            value={duration}
          />

          <View style={styles.templateStageBuilder}>
            <View style={styles.sectionTitle}>
              <AppText variant="headline">{t("recipeBook.templateStages")}</AppText>
              <AppText tone="secondary" variant="caption">
                {t("recipeBook.templateStagesHint")}
              </AppText>
            </View>

            <TextField
              autoCapitalize="sentences"
              label={t("stage.titleLabel")}
              onChangeText={setStageTitle}
              placeholder={t("stage.titlePlaceholder")}
              value={stageTitle}
            />

            <TextField
              keyboardType="number-pad"
              label={t("stage.delayLabel")}
              onChangeText={setStageDelay}
              placeholder={t("stage.delayPlaceholder")}
              value={stageDelay}
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
              title={t("recipeBook.addTemplateStage")}
              variant="secondary"
            />

            {stageError ? (
              <AppText tone="accent" variant="caption">
                {stageError}
              </AppText>
            ) : null}

            {stages.length > 0 ? (
              <View style={styles.stagePreviewList}>
                {stages.map((stage, index) => (
                  <View
                    key={`${stage.id ?? stage.title}-${stage.offsetMinutes}`}
                    style={[
                      styles.stagePreviewRow,
                      { borderColor: themeColors.borderStrong },
                    ]}
                  >
                    <View style={styles.stagePreviewCopy}>
                      <AppText variant="label">{stage.title}</AppText>
                      <AppText tone="secondary" variant="caption">
                        +{t("dish.totalMinutes", {
                          count: stage.offsetMinutes,
                        })}, {t(cookingActionLabelKeys[stage.actionType])}
                      </AppText>
                    </View>
                    <Button
                      haptic="warning"
                      onPress={() => {
                        handleRemoveStage(index);
                      }}
                      size="small"
                      title={t("action.remove")}
                      variant="ghost"
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {error ? (
            <AppText tone="accent" variant="caption">
              {error}
            </AppText>
          ) : null}

          <View style={styles.formActions}>
            <Button
              haptic="confirm"
              onPress={handleSaveTemplate}
              title={
                editingTemplate
                  ? t("recipeBook.updateTemplate")
                  : t("recipeBook.saveTemplate")
              }
            />
            {editingTemplate ? (
              <Button
                onPress={clearForm}
                title={t("action.cancel")}
                variant="ghost"
              />
            ) : null}
          </View>
        </View>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="headline">{t("recipeBook.savedTemplates")}</AppText>
          <AppText tone="secondary" variant="caption">
            {t("recipeBook.templateCount", { count: sortedTemplates.length })}
          </AppText>
        </View>

        {sortedTemplates.length > 0 ? (
          <View style={styles.noteList}>
            {sortedTemplates.map((template) => (
              <Card key={template.id}>
                <View style={styles.noteCard}>
                  <Pressable
                    accessibilityHint={t("recipeBook.editHint")}
                    accessibilityLabel={template.title}
                    accessibilityRole="button"
                    onPress={() => {
                      handleEditTemplate(template);
                    }}
                    style={styles.noteCopy}
                  >
                    <View style={styles.templateTitleRow}>
                      <AppText variant="headline">{template.title}</AppText>
                      {template.isFavorite ? (
                        <View style={styles.favoritePill}>
                          <AppText tone="accent" variant="caption">
                            {t("recipeBook.favorite")}
                          </AppText>
                        </View>
                      ) : null}
                    </View>

                    {template.body ? (
                      <AppText numberOfLines={3} tone="secondary">
                        {template.body}
                      </AppText>
                    ) : (
                      <AppText tone="muted">{t("recipeBook.emptyBody")}</AppText>
                    )}

                    <AppText tone="secondary" variant="caption">
                      {t("recipeBook.templateMeta", {
                        duration: getTemplateDuration(template),
                        stages: template.templateStages.length,
                        count: template.timesCooked,
                      })}
                    </AppText>
                  </Pressable>

                  <View style={styles.noteActions}>
                    <Button
                      haptic="confirm"
                      onPress={() => {
                        void handleStartTemplate(template);
                      }}
                      size="small"
                      title={t("recipeBook.startCooking")}
                    />
                    <Button
                      onPress={() => {
                        toggleFavorite(template.id);
                      }}
                      size="small"
                      title={
                        template.isFavorite
                          ? t("recipeBook.unfavorite")
                          : t("recipeBook.favorite")
                      }
                      variant="secondary"
                    />
                    <Button
                      onPress={() => {
                        handleEditTemplate(template);
                      }}
                      size="small"
                      title={t("action.edit")}
                      variant="ghost"
                    />
                    <Button
                      haptic="warning"
                      onPress={() => {
                        handleDeleteTemplate(template.id);
                      }}
                      size="small"
                      title={t("action.remove")}
                      variant="ghost"
                    />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <StateCard
            message={t("recipeBook.emptyMessage")}
            title={t("recipeBook.emptyTitle")}
          />
        )}
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
  bodyFieldStack: {
    gap: spacing.sm,
  },
  bodyInput: {
    minHeight: 150,
    borderRadius: radii.md,
    borderWidth: 1.2,
    backgroundColor: colors.surface,
    color: colors.charcoal,
    fontSize: 17,
    lineHeight: 23,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  templateStageBuilder: {
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
  stagePreviewList: {
    gap: spacing.sm,
  },
  stagePreviewRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.2,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  stagePreviewCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  formActions: {
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
  noteList: {
    gap: spacing.md,
  },
  noteCard: {
    gap: spacing.lg,
  },
  noteCopy: {
    gap: spacing.sm,
  },
  templateTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  favoritePill: {
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noteActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
});
