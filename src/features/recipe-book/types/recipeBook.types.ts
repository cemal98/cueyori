import type { CookingActionType, HeatLevel } from "../../cooking";

export type RecipeTemplateStage = {
  id: string;
  title: string;
  actionType: CookingActionType;
  offsetMinutes: number;
  order: number;
  durationMinutes?: number;
  heatLevel?: HeatLevel;
  note?: string;
};

export type RecipeTemplate = {
  id: string;
  title: string;
  body: string;
  isFavorite: boolean;
  timesCooked: number;
  estimatedDurationMinutes?: number;
  lastCookedAt?: string;
  templateStages: RecipeTemplateStage[];
  createdAt: string;
  updatedAt: string;
};

export type RecipeTemplateInput = {
  title: string;
  body: string;
  estimatedDurationMinutes?: number;
  templateStages?: RecipeTemplateStage[];
};

export type RecipeTemplateUpdates = RecipeTemplateInput & {
  isFavorite?: boolean;
};

export type RecipeNote = RecipeTemplate;
