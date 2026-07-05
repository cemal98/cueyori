import type {
  CookingActionType,
  SessionStatus,
  StageStatus,
} from "../types/cooking.types";
import type { TimelineEventStatus } from "./timelineEngine";

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
