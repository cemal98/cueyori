# CueYori Architecture

## Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- Expo Notifications
- NativeWind
- AsyncStorage first; SQLite later

## Architecture Style

Use feature-based architecture with shared primitives. Screens should stay thin;
business logic belongs in feature folders.

## Proposed Folders

```txt
app/
  _layout.tsx
  index.tsx
  session/
    [id].tsx
  add-dish.tsx

src/
  components/
    ui/
    layout/

  features/
    cooking-session/
      components/
      hooks/
      stores/
      types/
      utils/

    dishes/
      components/
      types/

    timeline/
      components/
      utils/

    notifications/
      services/
      types/

  stores/
  services/
    storage/

  utils/
  constants/
  theme/
```

## State

Use Zustand for local session state.

Core stores:

- `useCookingSessionStore`
- `useSettingsStore`

Keep cooking session actions centralized:

- createSession
- addDish
- startDish
- completeStage
- pauseSession
- finishSession

## Data Model

### CookingSession

```ts
type CookingSession = {
  id: string;
  title: string;
  startedAt?: string;
  targetReadyAt?: string;
  dishes: Dish[];
  status: "draft" | "active" | "paused" | "finished";
};
```

### Dish

```ts
type Dish = {
  id: string;
  name: string;
  totalMinutes: number;
  startedAt?: string;
  stages: CookingStage[];
};
```

### CookingStage

```ts
type CookingStage = {
  id: string;
  dishId: string;
  title: string;
  offsetMinutes: number;
  note?: string;
  notificationEnabled: boolean;
  isCompleted: boolean;
  completedAt?: string;
};
```

## Timeline

Timeline is derived from session data. Do not store duplicated timeline data
unless needed for performance. Timeline sorting and offset calculations must be
pure and testable.

## Notifications

Use local notifications for MVP. Each stage schedules one notification based on
`startedAt + offsetMinutes`.

Keep notification scheduling logic isolated in:

```txt
src/features/notifications/services/notificationService.ts
```

## UI principles

- Big readable countdowns
- One clear “next action”
- Minimal taps
- Dark mode friendly
- Large touch targets
- Calm, premium, native-feeling interactions

## Design System

Use reusable UI primitives:

- Button
- Card
- Text
- Screen
- TimerBadge
- TimelineItem
- DishCard
- CueCard

## Feature Boundary Rule

No feature should directly import implementation details from another feature
unless exposed via an index file.
