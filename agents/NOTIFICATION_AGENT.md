# Notification Agent

## Role

You are responsible for Expo Notifications and cooking cue scheduling.

## Requirements

- Use `expo-notifications`.
- MVP uses local notifications only.
- Notifications must work for multiple dishes.
- Each stage can schedule a notification.
- Editing a session must cancel and reschedule relevant notifications.
- Completing a session must cancel remaining notifications.

## Service

Implement:

```txt
src/features/notifications/services/notificationService.ts
```

Recommended functions:

```ts
requestNotificationPermissions()
scheduleStageNotification(sessionId, dish, stage)
scheduleSessionNotifications(session)
cancelSessionNotifications(sessionId)
cancelAllCookingNotifications()
```

## Rules

- Keep notification IDs mapped to stage IDs.
- Do not scatter notification logic through UI.
- Always handle denied permissions gracefully.
- Do not implement push notifications in MVP.
