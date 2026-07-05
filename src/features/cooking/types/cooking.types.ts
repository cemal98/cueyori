export type ISODateString = string;

export type SessionStatus = "draft" | "active" | "paused" | "finished";

export type StageStatus = "pending" | "active" | "completed" | "skipped";

export type HeatLevel =
  | "off"
  | "low"
  | "medium_low"
  | "medium"
  | "medium_high"
  | "high";

export type CookingActionType =
  | "start"
  | "prep"
  | "add_ingredient"
  | "stir"
  | "flip"
  | "lower_heat"
  | "raise_heat"
  | "check"
  | "remove_from_heat"
  | "rest"
  | "finish";

type CookingEntity = {
  id: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type CookingSession = CookingEntity & {
  title: string;
  status: SessionStatus;
  dishes: Dish[];
  startedAt?: ISODateString;
  pausedAt?: ISODateString;
  finishedAt?: ISODateString;
  targetReadyAt?: ISODateString;
  note?: string;
};

export type Dish = CookingEntity & {
  sessionId: CookingSession["id"];
  name: string;
  totalMinutes: number;
  stages: CookingStage[];
  startedAt?: ISODateString;
  completedAt?: ISODateString;
  note?: string;
};

export type CookingStage = CookingEntity & {
  dishId: Dish["id"];
  title: string;
  actionType: CookingActionType;
  status: StageStatus;
  offsetMinutes: number;
  order: number;
  notificationEnabled: boolean;
  durationMinutes?: number;
  heatLevel?: HeatLevel;
  scheduledAt?: ISODateString;
  startedAt?: ISODateString;
  completedAt?: ISODateString;
  note?: string;
};

export type TimelineEvent = CookingEntity & {
  sessionId: CookingSession["id"];
  dishId: Dish["id"];
  stageId: CookingStage["id"];
  title: string;
  actionType: CookingActionType;
  status: StageStatus;
  eventAt: ISODateString;
  offsetMinutes: number;
  heatLevel?: HeatLevel;
  note?: string;
};

export type NotificationEvent = CookingEntity & {
  sessionId: CookingSession["id"];
  dishId: Dish["id"];
  stageId: CookingStage["id"];
  timelineEventId?: TimelineEvent["id"];
  title: string;
  body: string;
  scheduledFor: ISODateString;
  status: "scheduled" | "sent" | "cancelled" | "failed";
  deliveredAt?: ISODateString;
  cancelledAt?: ISODateString;
  failureReason?: string;
};
