import type {
  CookingActionType,
  CookingSession,
  CookingStage,
  Dish,
  HeatLevel,
  ISODateString,
  StageStatus,
} from "../types/cooking.types";

export type TimelineEventStatus =
  | "upcoming"
  | "due"
  | "completed"
  | "missed";

export type CookingTimelineEvent = {
  id: string;
  sessionId: CookingSession["id"];
  dishId: Dish["id"];
  dishName: Dish["name"];
  stageId: CookingStage["id"];
  stageTitle: CookingStage["title"];
  actionType: CookingActionType;
  stageStatus: StageStatus;
  status: TimelineEventStatus;
  scheduledAt: ISODateString;
  offsetMinutes: number;
  order: number;
  dishOrder: number;
  durationMinutes?: number;
  heatLevel?: HeatLevel;
  completedAt?: ISODateString;
  note?: string;
};

export type TimelineDishGroup = {
  dishId: Dish["id"];
  dishName: Dish["name"];
  events: CookingTimelineEvent[];
};

export type TimelineEventsByDish = Record<Dish["id"], TimelineDishGroup>;

export type TimelineProgress = {
  totalEvents: number;
  completedEvents: number;
  dueEvents: number;
  missedEvents: number;
  upcomingEvents: number;
  completionRatio: number;
  completionPercent: number;
};

export type RemainingTimeFormat = {
  now: string;
  late: (timeLabel: string) => string;
};

const millisecondsInMinute = 60 * 1000;
const defaultDueWindowMinutes = 5;

const toDate = (value: ISODateString | Date): Date =>
  value instanceof Date ? value : new Date(value);

const addMinutes = (
  isoDate: ISODateString,
  minutes: number,
): ISODateString =>
  new Date(toDate(isoDate).getTime() + minutes * millisecondsInMinute)
    .toISOString();

const getScheduledAt = (
  session: CookingSession,
  dish: Dish,
  stage: CookingStage,
): ISODateString | undefined => {
  const startedAt = dish.startedAt ?? session.startedAt;

  if (startedAt) {
    return addMinutes(startedAt, stage.offsetMinutes);
  }

  return stage.scheduledAt ?? stage.completedAt ?? session.finishedAt;
};

const getSessionStages = (session: CookingSession): CookingStage[] =>
  session.dishes.flatMap((dish) => dish.stages);

const getTimelineEventStatus = (
  stage: CookingStage,
  scheduledAt: ISODateString,
  currentDate: Date,
): TimelineEventStatus => {
  if (
    stage.status === "completed" ||
    stage.status === "skipped" ||
    stage.completedAt
  ) {
    return "completed";
  }

  const scheduledTime = toDate(scheduledAt).getTime();
  const currentTime = currentDate.getTime();

  if (currentTime < scheduledTime) {
    return "upcoming";
  }

  const dueWindowMinutes = stage.durationMinutes ?? defaultDueWindowMinutes;
  const dueUntil = scheduledTime + dueWindowMinutes * millisecondsInMinute;

  return currentTime <= dueUntil ? "due" : "missed";
};

export const generateTimeline = (
  session: CookingSession,
  now: ISODateString | Date = new Date(),
): CookingTimelineEvent[] => {
  const currentDate = toDate(now);

  return session.dishes
    .flatMap((dish, dishOrder) =>
      dish.stages.flatMap((stage) => {
        const scheduledAt = getScheduledAt(session, dish, stage);

        if (!scheduledAt) {
          return [];
        }

        return [
          {
            id: `${session.id}:${dish.id}:${stage.id}`,
            sessionId: session.id,
            dishId: dish.id,
            dishName: dish.name,
            stageId: stage.id,
            stageTitle: stage.title,
            actionType: stage.actionType,
            stageStatus: stage.status,
            status: getTimelineEventStatus(stage, scheduledAt, currentDate),
            scheduledAt,
            offsetMinutes: stage.offsetMinutes,
            order: stage.order,
            dishOrder,
            durationMinutes: stage.durationMinutes,
            heatLevel: stage.heatLevel,
            completedAt: stage.completedAt,
            note: stage.note,
          },
        ];
      }),
    )
    .sort((first, second) => {
      const scheduledDelta =
        toDate(first.scheduledAt).getTime() -
        toDate(second.scheduledAt).getTime();

      if (scheduledDelta !== 0) {
        return scheduledDelta;
      }

      if (first.dishOrder !== second.dishOrder) {
        return first.dishOrder - second.dishOrder;
      }

      return first.order - second.order;
    });
};

export const getNextTimelineEvent = (
  session: CookingSession,
  now: ISODateString | Date = new Date(),
): CookingTimelineEvent | undefined =>
  generateTimeline(session, now).find(
    (event) =>
      event.status === "missed" ||
      event.status === "due" ||
      event.status === "upcoming",
  );

export const getTimelineProgress = (
  session: CookingSession,
  now: ISODateString | Date = new Date(),
): TimelineProgress => {
  const timeline = generateTimeline(session, now);
  const stages = getSessionStages(session);

  if (timeline.length === 0 && stages.length > 0) {
    const completedEvents = stages.filter(
      (stage) =>
        stage.status === "completed" ||
        stage.status === "skipped" ||
        Boolean(stage.completedAt),
    ).length;
    const totalEvents = stages.length;
    const completionRatio = completedEvents / totalEvents;

    return {
      totalEvents,
      completedEvents,
      dueEvents: 0,
      missedEvents: 0,
      upcomingEvents: totalEvents - completedEvents,
      completionRatio,
      completionPercent: Math.round(completionRatio * 100),
    };
  }

  const completedEvents = timeline.filter(
    (event) => event.status === "completed",
  ).length;
  const dueEvents = timeline.filter((event) => event.status === "due").length;
  const missedEvents = timeline.filter(
    (event) => event.status === "missed",
  ).length;
  const upcomingEvents = timeline.filter(
    (event) => event.status === "upcoming",
  ).length;
  const totalEvents = timeline.length;
  const completionRatio =
    totalEvents === 0 ? 0 : completedEvents / totalEvents;

  return {
    totalEvents,
    completedEvents,
    dueEvents,
    missedEvents,
    upcomingEvents,
    completionRatio,
    completionPercent: Math.round(completionRatio * 100),
  };
};

export const getEventsByDish = (
  session: CookingSession,
  now: ISODateString | Date = new Date(),
): TimelineEventsByDish => {
  const timeline = generateTimeline(session, now);

  return session.dishes.reduce<TimelineEventsByDish>((groups, dish) => {
    groups[dish.id] = {
      dishId: dish.id,
      dishName: dish.name,
      events: timeline.filter((event) => event.dishId === dish.id),
    };

    return groups;
  }, {});
};

export const formatRemainingTime = (
  targetDate: ISODateString | Date,
  now: ISODateString | Date = new Date(),
  format: RemainingTimeFormat = {
    now: "now",
    late: (timeLabel) => `${timeLabel} late`,
  },
): string => {
  const remainingMilliseconds =
    toDate(targetDate).getTime() - toDate(now).getTime();
  const remainingMinutes = Math.round(
    Math.abs(remainingMilliseconds) / millisecondsInMinute,
  );

  if (remainingMinutes === 0) {
    return format.now;
  }

  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  const parts = [
    hours > 0 ? `${hours}h` : undefined,
    minutes > 0 ? `${minutes}m` : undefined,
  ].filter((part): part is string => Boolean(part));
  const timeLabel = parts.join(" ");

  return remainingMilliseconds < 0 ? format.late(timeLabel) : timeLabel;
};
