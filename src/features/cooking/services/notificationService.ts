import * as Notifications from "expo-notifications";

import { usePreferencesStore } from "../../preferences";
import { translate } from "../../../i18n";
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

type ScheduledNotificationRequest = Awaited<
  ReturnType<typeof Notifications.getAllScheduledNotificationsAsync>
>[number];
type PresentedNotification = Awaited<
  ReturnType<typeof Notifications.getPresentedNotificationsAsync>
>[number];

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

let isNotificationPresentationConfigured = false;

export const configureCookingNotificationPresentation = (): void => {
  if (isNotificationPresentationConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  isNotificationPresentationConfigured = true;
};

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
  translate(usePreferencesStore.getState().language, "notification.cueReady", {
    dishName: event.dishName,
  });

const getCookingNotificationData = (
  request: ScheduledNotificationRequest | PresentedNotification,
): Record<string, unknown> | undefined => {
  const data =
    "content" in request ? request.content.data : request.request.content.data;

  if (!data || typeof data !== "object") {
    return undefined;
  }

  return data as Record<string, unknown>;
};

const getScheduledCookingRequests = async (): Promise<
  ScheduledNotificationRequest[]
> => {
  try {
    const requests = await Notifications.getAllScheduledNotificationsAsync();

    return requests.filter((request) => {
      const data = getCookingNotificationData(request);

      return data?.scope === cookingNotificationScope;
    });
  } catch {
    return [];
  }
};

const cancelNotificationIdentifier = async (
  notificationId: string,
): Promise<boolean> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch {
    return false;
  }
};

const dismissNotificationIdentifier = async (
  notificationId: string,
): Promise<boolean> => {
  try {
    await Notifications.dismissNotificationAsync(notificationId);
    return true;
  } catch {
    return false;
  }
};

export const dismissPresentedCookingNotifications = async (): Promise<
  number
> => {
  try {
    const notifications = await Notifications.getPresentedNotificationsAsync();
    const dismissResults = await Promise.all(
      notifications
        .filter((notification) => {
          const data = getCookingNotificationData(notification);

          return data?.scope === cookingNotificationScope;
        })
        .map((notification) =>
          dismissNotificationIdentifier(notification.request.identifier),
        ),
    );

    return dismissResults.filter(Boolean).length;
  } catch {
    return 0;
  }
};

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
  await dismissPresentedCookingNotifications();

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
  const cancelledNotificationIds = new Set<string>();
  let didCancel = false;

  if (scheduledNotification) {
    didCancel = await cancelNotificationIdentifier(
      scheduledNotification.notificationId,
    );
    cancelledNotificationIds.add(scheduledNotification.notificationId);
  }

  const matchingRequests = (await getScheduledCookingRequests()).filter(
    (request) => getCookingNotificationData(request)?.eventId === eventId,
  );

  const nativeCancelResults = await Promise.all(
    matchingRequests
      .filter((request) => !cancelledNotificationIds.has(request.identifier))
      .map((request) => cancelNotificationIdentifier(request.identifier)),
  );

  untrackNotification(eventId);

  return didCancel || nativeCancelResults.some(Boolean);
};

export const cancelSessionNotifications = async (
  sessionId: CookingSession["id"],
): Promise<number> => {
  const eventIds = new Set(eventIdsBySessionId.get(sessionId) ?? []);
  const scheduledRequests = await getScheduledCookingRequests();

  scheduledRequests.forEach((request) => {
    const eventId = getCookingNotificationData(request)?.eventId;

    if (
      typeof eventId === "string" &&
      getCookingNotificationData(request)?.sessionId === sessionId
    ) {
      eventIds.add(eventId);
    }
  });

  const eventCancelResults = await Promise.all(
    Array.from(eventIds).map(cancelTimelineEventNotification),
  );

  const remainingRequestResults = await Promise.all(
    scheduledRequests
      .filter(
        (request) =>
          getCookingNotificationData(request)?.sessionId === sessionId &&
          !eventIds.has(String(getCookingNotificationData(request)?.eventId)),
      )
      .map((request) => cancelNotificationIdentifier(request.identifier)),
  );

  eventIdsBySessionId.delete(sessionId);

  return [...eventCancelResults, ...remainingRequestResults].filter(Boolean)
    .length;
};

export const cancelAllCookingNotifications = async (): Promise<number> => {
  const trackedCancelResults = await Promise.all(
    Array.from(scheduledNotificationsByEventId.keys()).map((eventId) =>
      cancelTimelineEventNotification(eventId),
    ),
  );
  const scheduledRequests = await getScheduledCookingRequests();
  const nativeCancelResults = await Promise.all(
    scheduledRequests.map((request) =>
      cancelNotificationIdentifier(request.identifier),
    ),
  );

  scheduledNotificationsByEventId.clear();
  eventIdsBySessionId.clear();
  const dismissedCount = await dismissPresentedCookingNotifications();

  return (
    [...trackedCancelResults, ...nativeCancelResults].filter(Boolean).length +
    dismissedCount
  );
};
