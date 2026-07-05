import * as Notifications from "expo-notifications";

import type { CookingSession } from "../types/cooking.types";
import {
  generateTimeline,
  type CookingTimelineEvent,
} from "../utils/timelineEngine";

type PermissionStatus = Awaited<
  ReturnType<typeof Notifications.getPermissionsAsync>
>["status"];

type ScheduledCookingNotification = {
  sessionId: CookingTimelineEvent["sessionId"];
  eventId: CookingTimelineEvent["id"];
  notificationId: string;
};

export type CookingNotificationPermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
  status: PermissionStatus | "unavailable";
  errorMessage?: string;
};

export type CookingNotificationSkipReason =
  | "permission_denied"
  | "completed"
  | "missed"
  | "past_due"
  | "failed";

export type CookingNotificationScheduleResult =
  | {
      status: "scheduled";
      sessionId: CookingTimelineEvent["sessionId"];
      eventId: CookingTimelineEvent["id"];
      notificationId: string;
    }
  | {
      status: "skipped";
      sessionId: CookingTimelineEvent["sessionId"];
      eventId: CookingTimelineEvent["id"];
      reason: CookingNotificationSkipReason;
      message?: string;
    };

const cookingNotificationScope = "cueyori-cooking";

const scheduledNotificationsByEventId = new Map<
  CookingTimelineEvent["id"],
  ScheduledCookingNotification
>();
const eventIdsBySessionId = new Map<
  CookingTimelineEvent["sessionId"],
  Set<CookingTimelineEvent["id"]>
>();

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unknown notification error";

const toPermissionResult = (
  permission: Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>,
): CookingNotificationPermissionResult => ({
  granted: permission.granted,
  canAskAgain: permission.canAskAgain,
  status: permission.status,
});

const trackNotification = ({
  sessionId,
  eventId,
  notificationId,
}: ScheduledCookingNotification): void => {
  scheduledNotificationsByEventId.set(eventId, {
    sessionId,
    eventId,
    notificationId,
  });

  const sessionEventIds = eventIdsBySessionId.get(sessionId) ?? new Set();
  sessionEventIds.add(eventId);
  eventIdsBySessionId.set(sessionId, sessionEventIds);
};

const untrackNotification = (eventId: CookingTimelineEvent["id"]): void => {
  const scheduledNotification = scheduledNotificationsByEventId.get(eventId);

  if (!scheduledNotification) {
    return;
  }

  scheduledNotificationsByEventId.delete(eventId);

  const sessionEventIds = eventIdsBySessionId.get(
    scheduledNotification.sessionId,
  );

  if (!sessionEventIds) {
    return;
  }

  sessionEventIds.delete(eventId);

  if (sessionEventIds.size === 0) {
    eventIdsBySessionId.delete(scheduledNotification.sessionId);
  }
};

const buildSkippedResult = (
  event: CookingTimelineEvent,
  reason: CookingNotificationSkipReason,
  message?: string,
): CookingNotificationScheduleResult => ({
  status: "skipped",
  sessionId: event.sessionId,
  eventId: event.id,
  reason,
  message,
});

const buildNotificationBody = (event: CookingTimelineEvent): string =>
  `${event.dishName} is ready for this step.`;

const scheduleTimelineEventNotificationWithPermission = async (
  event: CookingTimelineEvent,
  permission: CookingNotificationPermissionResult,
  now: Date,
): Promise<CookingNotificationScheduleResult> => {
  if (!permission.granted) {
    return buildSkippedResult(
      event,
      "permission_denied",
      permission.errorMessage,
    );
  }

  if (event.status === "completed") {
    return buildSkippedResult(event, "completed");
  }

  if (event.status === "missed") {
    return buildSkippedResult(event, "missed");
  }

  const scheduledAt = new Date(event.scheduledAt);

  if (scheduledAt.getTime() <= now.getTime()) {
    return buildSkippedResult(event, "past_due");
  }

  await cancelTimelineEventNotification(event.id);

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: event.stageTitle,
        body: buildNotificationBody(event),
        sound: true,
        data: {
          scope: cookingNotificationScope,
          sessionId: event.sessionId,
          eventId: event.id,
          dishId: event.dishId,
          stageId: event.stageId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: scheduledAt,
      },
    });

    trackNotification({
      sessionId: event.sessionId,
      eventId: event.id,
      notificationId,
    });

    return {
      status: "scheduled",
      sessionId: event.sessionId,
      eventId: event.id,
      notificationId,
    };
  } catch (error) {
    return buildSkippedResult(event, "failed", getErrorMessage(error));
  }
};

export const requestCookingNotificationPermissions =
  async (): Promise<CookingNotificationPermissionResult> => {
    try {
      const existingPermission = await Notifications.getPermissionsAsync();

      if (existingPermission.granted || !existingPermission.canAskAgain) {
        return toPermissionResult(existingPermission);
      }

      const requestedPermission = await Notifications.requestPermissionsAsync();
      return toPermissionResult(requestedPermission);
    } catch (error) {
      return {
        granted: false,
        canAskAgain: false,
        status: "unavailable",
        errorMessage: getErrorMessage(error),
      };
    }
  };

export const scheduleTimelineEventNotification = async (
  event: CookingTimelineEvent,
): Promise<CookingNotificationScheduleResult> => {
  const permission = await requestCookingNotificationPermissions();

  return scheduleTimelineEventNotificationWithPermission(
    event,
    permission,
    new Date(),
  );
};

export const scheduleSessionNotifications = async (
  session: CookingSession,
): Promise<CookingNotificationScheduleResult[]> => {
  await cancelSessionNotifications(session.id);

  const now = new Date();
  const permission = await requestCookingNotificationPermissions();
  const timeline = generateTimeline(session, now);

  return Promise.all(
    timeline.map((event) =>
      scheduleTimelineEventNotificationWithPermission(event, permission, now),
    ),
  );
};

export const cancelTimelineEventNotification = async (
  eventId: CookingTimelineEvent["id"],
): Promise<boolean> => {
  const scheduledNotification = scheduledNotificationsByEventId.get(eventId);

  if (!scheduledNotification) {
    return false;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(
      scheduledNotification.notificationId,
    );
    untrackNotification(eventId);
    return true;
  } catch {
    return false;
  }
};

export const cancelSessionNotifications = async (
  sessionId: CookingSession["id"],
): Promise<number> => {
  const eventIds = eventIdsBySessionId.get(sessionId);

  if (!eventIds) {
    return 0;
  }

  const cancelResults = await Promise.all(
    Array.from(eventIds).map((eventId) =>
      cancelTimelineEventNotification(eventId),
    ),
  );

  return cancelResults.filter(Boolean).length;
};

export const cancelAllCookingNotifications = async (): Promise<number> => {
  const cancelResults = await Promise.all(
    Array.from(scheduledNotificationsByEventId.keys()).map((eventId) =>
      cancelTimelineEventNotification(eventId),
    ),
  );

  return cancelResults.filter(Boolean).length;
};
