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

export type DishFormValidationMessages = {
  dishNameRequired: string;
  durationPositive: string;
  stageRequired: string;
  stagesInsideDuration: string;
  stageTitleRequired: string;
  stageOffsetNonNegative: string;
  stageOffsetInsideDuration: string;
  durationFirst: string;
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
  messages: DishFormValidationMessages = defaultValidationMessages,
): DishFormErrors => {
  const errors: DishFormErrors = {};

  if (!dishName.trim()) {
    errors.dishName = messages.dishNameRequired;
  }

  if (!durationMinutes) {
    errors.duration = messages.durationPositive;
  }

  if (stages.length === 0) {
    errors.stages = messages.stageRequired;
  } else if (
    durationMinutes !== undefined &&
    stages.some((stage) => stage.offsetMinutes > durationMinutes)
  ) {
    errors.stages = messages.stagesInsideDuration;
  }

  return errors;
};

export const validateStageFields = (
  stageTitle: string,
  stageOffset: number | undefined,
  durationMinutes: number | undefined,
  messages: DishFormValidationMessages = defaultValidationMessages,
): DishFormErrors => {
  const errors: DishFormErrors = {};

  if (!stageTitle.trim()) {
    errors.stageTitle = messages.stageTitleRequired;
  }

  if (stageOffset === undefined) {
    errors.stageOffset = messages.stageOffsetNonNegative;
  } else if (durationMinutes !== undefined && stageOffset > durationMinutes) {
    errors.stageOffset = messages.stageOffsetInsideDuration;
  }

  if (!durationMinutes) {
    errors.duration = messages.durationFirst;
  }

  return errors;
};

const getLastStageOffsetMinutes = (stages: DishStageDraft[]): number =>
  stages.reduce(
    (lastOffset, stage) => Math.max(lastOffset, stage.offsetMinutes),
    0,
  );

export const getSequentialStageOffsetMinutes = (
  stages: DishStageDraft[],
  delayMinutes: number,
): number => getLastStageOffsetMinutes(stages) + delayMinutes;

export const validateSequentialStageFields = (
  stageTitle: string,
  stageDelay: number | undefined,
  durationMinutes: number | undefined,
  existingStages: DishStageDraft[],
  messages: DishFormValidationMessages = defaultValidationMessages,
): DishFormErrors => {
  const errors: DishFormErrors = {};

  if (!stageTitle.trim()) {
    errors.stageTitle = messages.stageTitleRequired;
  }

  if (stageDelay === undefined) {
    errors.stageOffset = messages.stageOffsetNonNegative;
  } else if (
    durationMinutes !== undefined &&
    getSequentialStageOffsetMinutes(existingStages, stageDelay) > durationMinutes
  ) {
    errors.stageOffset = messages.stageOffsetInsideDuration;
  }

  if (!durationMinutes) {
    errors.duration = messages.durationFirst;
  }

  return errors;
};

const defaultValidationMessages: DishFormValidationMessages = {
  dishNameRequired: "Dish name is required.",
  durationPositive: "Duration must be a positive number.",
  stageRequired: "Add at least one stage.",
  stagesInsideDuration: "Every stage offset must fit inside dish duration.",
  stageTitleRequired: "Stage title is required.",
  stageOffsetNonNegative: "Timing must be zero or more.",
  stageOffsetInsideDuration: "Cue timing must fit inside dish duration.",
  durationFirst: "Add a valid dish duration first.",
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
