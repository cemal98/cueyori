import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { fileStorage } from "../../../services/storage/fileStorage";
import type {
  RecipeTemplate,
  RecipeTemplateInput,
  RecipeTemplateStage,
  RecipeTemplateUpdates,
} from "../types/recipeBook.types";

type CryptoWithRandomUUID = {
  randomUUID?: () => string;
};

type RecipeBookPersistedState = {
  notes?: Partial<RecipeTemplate>[];
  templates?: Partial<RecipeTemplate>[];
};

type RecipeBookStoreState = {
  templates: RecipeTemplate[];
  createTemplate: (input: RecipeTemplateInput) => RecipeTemplate;
  updateTemplate: (
    templateId: RecipeTemplate["id"],
    updates: RecipeTemplateUpdates,
  ) => void;
  deleteTemplate: (templateId: RecipeTemplate["id"]) => void;
  toggleFavorite: (templateId: RecipeTemplate["id"]) => void;
  markTemplateCooked: (templateId: RecipeTemplate["id"]) => void;
};

const now = (): string => new Date().toISOString();

const createId = (): string => {
  const globalWithCrypto = globalThis as typeof globalThis & {
    crypto?: CryptoWithRandomUUID;
  };

  if (typeof globalWithCrypto.crypto?.randomUUID === "function") {
    return globalWithCrypto.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeTemplateStage = (
  stage: Partial<RecipeTemplateStage>,
  order: number,
): RecipeTemplateStage => ({
  id: typeof stage.id === "string" ? stage.id : createId(),
  title: stage.title?.trim() || "Cue",
  actionType: stage.actionType ?? "prep",
  offsetMinutes:
    typeof stage.offsetMinutes === "number" ? stage.offsetMinutes : 0,
  order: typeof stage.order === "number" ? stage.order : order,
  durationMinutes: stage.durationMinutes,
  heatLevel: stage.heatLevel,
  note: stage.note,
});

const normalizeTemplate = (
  template: Partial<RecipeTemplate>,
): RecipeTemplate => {
  const timestamp = now();
  const templateStages = Array.isArray(template.templateStages)
    ? template.templateStages.map(normalizeTemplateStage)
    : [];

  return {
    id: typeof template.id === "string" ? template.id : createId(),
    title: template.title?.trim() || "Untitled note",
    body: template.body?.trim() ?? "",
    isFavorite: Boolean(template.isFavorite),
    timesCooked:
      typeof template.timesCooked === "number" ? template.timesCooked : 0,
    estimatedDurationMinutes:
      typeof template.estimatedDurationMinutes === "number"
        ? template.estimatedDurationMinutes
        : undefined,
    lastCookedAt:
      typeof template.lastCookedAt === "string"
        ? template.lastCookedAt
        : undefined,
    templateStages,
    createdAt:
      typeof template.createdAt === "string" ? template.createdAt : timestamp,
    updatedAt:
      typeof template.updatedAt === "string" ? template.updatedAt : timestamp,
  };
};

const getPersistedTemplates = (persistedState: unknown): RecipeTemplate[] => {
  if (!isRecord(persistedState)) {
    return [];
  }

  const state = persistedState as RecipeBookPersistedState;
  const templates = state.templates ?? state.notes ?? [];

  return templates.map(normalizeTemplate);
};

const buildTemplate = (input: RecipeTemplateInput): RecipeTemplate => {
  const timestamp = now();

  return {
    id: createId(),
    title: input.title.trim(),
    body: input.body.trim(),
    isFavorite: false,
    timesCooked: 0,
    estimatedDurationMinutes: input.estimatedDurationMinutes,
    templateStages: input.templateStages ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const useRecipeBookStore = create<RecipeBookStoreState>()(
  persist(
    (set) => ({
      templates: [],
      createTemplate: (input) => {
        const template = buildTemplate(input);

        set((state) => ({
          templates: [template, ...state.templates],
        }));

        return template;
      },
      updateTemplate: (templateId, updates) => {
        const timestamp = now();

        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId
              ? {
                  ...template,
                  title: updates.title.trim(),
                  body: updates.body.trim(),
                  isFavorite: updates.isFavorite ?? template.isFavorite,
                  estimatedDurationMinutes:
                    updates.estimatedDurationMinutes,
                  templateStages: updates.templateStages ?? [],
                  updatedAt: timestamp,
                }
              : template,
          ),
        }));
      },
      deleteTemplate: (templateId) => {
        set((state) => ({
          templates: state.templates.filter(
            (template) => template.id !== templateId,
          ),
        }));
      },
      toggleFavorite: (templateId) => {
        const timestamp = now();

        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId
              ? {
                  ...template,
                  isFavorite: !template.isFavorite,
                  updatedAt: timestamp,
                }
              : template,
          ),
        }));
      },
      markTemplateCooked: (templateId) => {
        const timestamp = now();

        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId
              ? {
                  ...template,
                  timesCooked: template.timesCooked + 1,
                  lastCookedAt: timestamp,
                  updatedAt: timestamp,
                }
              : template,
          ),
        }));
      },
    }),
    {
      name: "cueyori-recipe-book",
      version: 2,
      storage: createJSONStorage(() => fileStorage),
      migrate: (persistedState) => ({
        templates: getPersistedTemplates(persistedState),
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        templates: getPersistedTemplates(persistedState),
      }),
      partialize: (state) => ({
        templates: state.templates,
      }),
    },
  ),
);

export type { RecipeBookStoreState };
