import type { CookingActionType, CookingStage } from "../types/cooking.types";
import type { StageInput, StageUpdates } from "../store/useCookingStore";

export type DishStageDraft = {
  id?: CookingStage["id"];
  title: string;
  offsetMinutes: number;
  actionType: CookingActionType;
};

export type DishFormErrors = {
  dishName?: string;
  duration?: string;
  stageTitle?: string;
  stageOffset?: string;
  stages?: string;
};

export const cookingActionTypes: CookingActionType[] = [
  "prep",
  "start",
  "add_ingredient",
  "stir",
  "flip",
  "lower_heat",
  "raise_heat",
  "check",
  "remove_from_heat",
  "rest",
  "finish",
];

export const parsePositiveInteger = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
};

export const parseNonNegativeInteger = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
};

export const validateDishFields = (
  dishName: string,
  durationMinutes: number | undefined,
  stages: DishStageDraft[],
): DishFormErrors => {
  const errors: DishFormErrors = {};

  if (!dishName.trim()) {
    errors.dishName = "Dish name is required.";
  }

  if (!durationMinutes) {
    errors.duration = "Duration must be a positive number.";
  }

  if (stages.length === 0) {
    errors.stages = "Add at least one stage.";
  } else if (
    durationMinutes !== undefined &&
    stages.some((stage) => stage.offsetMinutes > durationMinutes)
  ) {
    errors.stages = "Every stage offset must fit inside dish duration.";
  }

  return errors;
};

export const validateStageFields = (
  stageTitle: string,
  stageOffset: number | undefined,
  durationMinutes: number | undefined,
): DishFormErrors => {
  const errors: DishFormErrors = {};

  if (!stageTitle.trim()) {
    errors.stageTitle = "Stage title is required.";
  }

  if (stageOffset === undefined) {
    errors.stageOffset = "Offset must be zero or more.";
  } else if (durationMinutes !== undefined && stageOffset > durationMinutes) {
    errors.stageOffset = "Offset must fit inside dish duration.";
  }

  if (!durationMinutes) {
    errors.duration = "Add a valid dish duration first.";
  }

  return errors;
};

export const buildStageInput = (
  stage: DishStageDraft,
  order: number,
): StageInput => ({
  title: stage.title.trim(),
  actionType: stage.actionType,
  offsetMinutes: stage.offsetMinutes,
  order,
  notificationEnabled: true,
});

export const buildStageUpdates = (
  stage: DishStageDraft,
  order: number,
): StageUpdates => ({
  title: stage.title.trim(),
  actionType: stage.actionType,
  offsetMinutes: stage.offsetMinutes,
  order,
});

export const sortStageDrafts = (
  stages: DishStageDraft[],
): DishStageDraft[] =>
  [...stages].sort((first, second) => {
    if (first.offsetMinutes !== second.offsetMinutes) {
      return first.offsetMinutes - second.offsetMinutes;
    }

    return first.title.localeCompare(second.title);
  });
