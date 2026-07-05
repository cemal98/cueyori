import {
  cancelSessionNotifications,
  cancelTimelineEventNotification,
  scheduleSessionNotifications,
} from "../services/notificationService";
import { useCookingStore } from "../store/useCookingStore";
import type { CookingSession, CookingStage, Dish } from "../types/cooking.types";
import { generateTimeline } from "./timelineEngine";

const getSession = (sessionId: CookingSession["id"]) =>
  useCookingStore.getState().getSessionById(sessionId);

const getTimelineEventId = (
  sessionId: CookingSession["id"],
  dishId: Dish["id"],
  stageId: CookingStage["id"],
): string | undefined => {
  const session = getSession(sessionId);

  if (!session) {
    return undefined;
  }

  return generateTimeline(session).find(
    (event) => event.dishId === dishId && event.stageId === stageId,
  )?.id;
};

const rescheduleActiveSession = async (
  sessionId: CookingSession["id"],
): Promise<void> => {
  const session = getSession(sessionId);

  if (!session || session.status !== "active") {
    return;
  }

  await scheduleSessionNotifications(session);
};

export const syncCookingSessionNotifications = async (
  sessionId: CookingSession["id"],
): Promise<void> => {
  const session = getSession(sessionId);

  if (!session || session.status !== "active") {
    await cancelSessionNotifications(sessionId);
    return;
  }

  await scheduleSessionNotifications(session);
};

export const startCookingSession = async (
  sessionId: CookingSession["id"],
): Promise<void> => {
  useCookingStore.getState().startSession(sessionId);
  await syncCookingSessionNotifications(sessionId);
};

export const completeCookingStage = async (
  sessionId: CookingSession["id"],
  dishId: Dish["id"],
  stageId: CookingStage["id"],
): Promise<void> => {
  useCookingStore.getState().completeStage(sessionId, dishId, stageId);

  const eventId = getTimelineEventId(sessionId, dishId, stageId);

  if (eventId) {
    await cancelTimelineEventNotification(eventId);
  }
};

export const uncompleteCookingStage = async (
  sessionId: CookingSession["id"],
  dishId: Dish["id"],
  stageId: CookingStage["id"],
): Promise<void> => {
  useCookingStore.getState().uncompleteStage(sessionId, dishId, stageId);
  await rescheduleActiveSession(sessionId);
};

export const pauseCookingSession = async (
  sessionId: CookingSession["id"],
): Promise<void> => {
  useCookingStore.getState().pauseSession(sessionId);
  await cancelSessionNotifications(sessionId);
};

export const resumeCookingSession = async (
  sessionId: CookingSession["id"],
): Promise<void> => {
  useCookingStore.getState().resumeSession(sessionId);
  await syncCookingSessionNotifications(sessionId);
};

export const finishCookingSession = async (
  sessionId: CookingSession["id"],
): Promise<void> => {
  useCookingStore.getState().completeSession(sessionId);
  await cancelSessionNotifications(sessionId);
};

export const resetCookingSession = async (
  sessionId: CookingSession["id"],
): Promise<void> => {
  useCookingStore.getState().resetSession(sessionId);
  await cancelSessionNotifications(sessionId);
};
