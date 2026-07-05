# CueYori PRD

## Product Name

CueYori

## One-line Description

CueYori helps home cooks manage multiple dishes at once with smart cooking
cues, timelines, local notifications, and a unified cooking workflow.

## Problem

When cooking 3-4 dishes at the same time, people forget:

- when each dish started
- what needs stirring
- what needs flipping
- when to reduce heat
- when to turn something off
- when everything will be ready

Phone timers and reminders solve isolated time tracking but not kitchen
workflow coordination.

## Differentiation

Standard reminders and timer apps only count down. CueYori coordinates the
whole cooking flow and makes the next action obvious.

## Target User

- Home cooks
- Students
- Busy parents
- People cooking several dishes for guests
- Meal prep users

## MVP Goal

Build an offline-first mobile app where users can create a cooking session with
multiple dishes, add stages to each dish, and receive timely local
notifications.

## MVP User Story

As a user, I want to add several dishes and their cooking steps so CueYori tells
me exactly what to do next while everything is cooking.

## MVP Screens

1. Dashboard
2. Add Dish
3. Dish Detail
4. Cooking Timeline
5. Notification Permissions

## MVP Features

### 1. Cooking Session

A user can start a cooking session. A session contains multiple dishes.

### 2. Dish Creation

A user can add:

- dish name
- total duration
- cooking stages

### 3. Stages

Each stage has:

- title
- offset in minutes
- optional note
- notification enabled/disabled

Examples:

- Stir rice
- Flip chicken
- Lower heat
- Drain pasta

### 4. Timeline

The app combines stages from all dishes into one timeline sorted by time.

### 5. Dashboard

The dashboard shows:

- current active session
- next cue
- active dishes
- remaining time
- upcoming actions

### 6. Local Notifications

The app sends local notifications for each stage.

## Data Model

```ts
type CookingStageType =
  | "start"
  | "stir"
  | "flip"
  | "lower_heat"
  | "check"
  | "finish"
  | "rest";

type CookingStage = {
  id: string;
  dishId: string;
  title: string;
  offsetMinutes: number;
  type: CookingStageType;
  note?: string;
  notificationEnabled: boolean;
  isCompleted: boolean;
  completedAt?: string;
};

type Dish = {
  id: string;
  name: string;
  totalMinutes: number;
  startedAt?: string;
  stages: CookingStage[];
};

type CookingSession = {
  id: string;
  title: string;
  startedAt?: string;
  targetReadyAt?: string;
  dishes: Dish[];
  status: "draft" | "active" | "paused" | "finished";
};
```

## Non-MVP

- AI planner
- user accounts
- cloud sync
- recipe marketplace
- social features
- payments
- Apple Watch

## Success Criteria

- User can run a cooking session without internet.
- User can track at least 4 dishes.
- User receives correct notifications.
- User can understand what to do next within 3 seconds of opening the app.

## Future

- AI schedule planner
- Voice commands
- Recipe templates
- Apple Watch
- Cloud sync
