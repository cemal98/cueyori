import type {
  CookingActionType,
  SessionStatus,
  StageStatus,
} from "../types/cooking.types";
import type { TimelineEventStatus } from "./timelineEngine";
import type { TranslationKey } from "../../../i18n";

export const cookingActionLabelKeys: Record<CookingActionType, TranslationKey> = {
  start: "cooking.action.start",
  prep: "cooking.action.prep",
  add_ingredient: "cooking.action.addIngredient",
  stir: "cooking.action.stir",
  flip: "cooking.action.flip",
  lower_heat: "cooking.action.lowerHeat",
  raise_heat: "cooking.action.raiseHeat",
  check: "cooking.action.check",
  remove_from_heat: "cooking.action.removeFromHeat",
  rest: "cooking.action.rest",
  finish: "cooking.action.finish",
};

export const sessionStatusLabelKeys: Record<SessionStatus, TranslationKey> = {
  draft: "label.sessionStatus.draft",
  active: "label.sessionStatus.active",
  paused: "label.sessionStatus.paused",
  finished: "label.sessionStatus.finished",
};

export const stageStatusLabelKeys: Record<StageStatus, TranslationKey> = {
  pending: "label.stageStatus.pending",
  active: "label.stageStatus.active",
  completed: "label.stageStatus.completed",
  skipped: "label.stageStatus.skipped",
};

export const timelineStatusLabelKeys: Record<
  TimelineEventStatus,
  TranslationKey
> = {
  upcoming: "label.timelineStatus.upcoming",
  due: "label.timelineStatus.due",
  completed: "label.timelineStatus.completed",
  missed: "label.timelineStatus.missed",
};

export const cookingActionLabels: Record<CookingActionType, string> = {
  start: "Start",
  prep: "Prep",
  add_ingredient: "Add",
  stir: "Stir",
  flip: "Flip",
  lower_heat: "Lower heat",
  raise_heat: "Raise heat",
  check: "Check",
  remove_from_heat: "Remove",
  rest: "Rest",
  finish: "Finish",
};

export const sessionStatusLabels: Record<SessionStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  finished: "Finished",
};

export const stageStatusLabels: Record<StageStatus, string> = {
  pending: "Pending",
  active: "Active",
  completed: "Completed",
  skipped: "Skipped",
};

export const timelineStatusLabels: Record<TimelineEventStatus, string> = {
  upcoming: "Upcoming",
  due: "Due now",
  completed: "Completed",
  missed: "Missed",
};
