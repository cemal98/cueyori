import { create } from "zustand";

import type {
  CookingActionType,
  CookingSession,
  CookingStage,
  Dish,
  HeatLevel,
  ISODateString,
  StageStatus,
} from "../types/cooking.types";

type CryptoWithRandomUUID = {
  randomUUID?: () => string;
};

type DishInput = {
  name: string;
  totalMinutes: number;
  note?: string;
};

type DishUpdates = Partial<
  Pick<Dish, "name" | "totalMinutes" | "startedAt" | "completedAt" | "note">
>;

type StageInput = {
  title: string;
  actionType: CookingActionType;
  offsetMinutes: number;
  notificationEnabled?: boolean;
  durationMinutes?: number;
  heatLevel?: HeatLevel;
  note?: string;
  order?: number;
  scheduledAt?: ISODateString;
  status?: StageStatus;
};

type StageUpdates = Partial<
  Pick<
    CookingStage,
    | "title"
    | "actionType"
    | "status"
    | "offsetMinutes"
    | "order"
    | "notificationEnabled"
    | "durationMinutes"
    | "heatLevel"
    | "scheduledAt"
    | "startedAt"
    | "completedAt"
    | "note"
  >
>;

type CookingStoreState = {
  sessions: CookingSession[];
  createSession: (title?: string) => CookingSession;
  startSession: (sessionId: CookingSession["id"]) => void;
  pauseSession: (sessionId: CookingSession["id"]) => void;
  resumeSession: (sessionId: CookingSession["id"]) => void;
  completeSession: (sessionId: CookingSession["id"]) => void;
  resetSession: (sessionId: CookingSession["id"]) => void;
  deleteSession: (sessionId: CookingSession["id"]) => void;
  addDish: (
    sessionId: CookingSession["id"],
    dishInput: DishInput,
  ) => Dish | undefined;
  updateDish: (
    sessionId: CookingSession["id"],
    dishId: Dish["id"],
    updates: DishUpdates,
  ) => void;
  removeDish: (
    sessionId: CookingSession["id"],
    dishId: Dish["id"],
  ) => void;
  addStage: (
    sessionId: CookingSession["id"],
    dishId: Dish["id"],
    stageInput: StageInput,
  ) => CookingStage | undefined;
  updateStage: (
    sessionId: CookingSession["id"],
    dishId: Dish["id"],
    stageId: CookingStage["id"],
    updates: StageUpdates,
  ) => void;
  completeStage: (
    sessionId: CookingSession["id"],
    dishId: Dish["id"],
    stageId: CookingStage["id"],
  ) => void;
  uncompleteStage: (
    sessionId: CookingSession["id"],
    dishId: Dish["id"],
    stageId: CookingStage["id"],
  ) => void;
  removeStage: (
    sessionId: CookingSession["id"],
    dishId: Dish["id"],
    stageId: CookingStage["id"],
  ) => void;
  getActiveSession: () => CookingSession | undefined;
  getSessionById: (
    sessionId: CookingSession["id"],
  ) => CookingSession | undefined;
};

const defaultSessionTitle = "Untitled Cooking Session";

const now = (): ISODateString => new Date().toISOString();

const createId = (): string => {
  const globalWithCrypto = globalThis as typeof globalThis & {
    crypto?: CryptoWithRandomUUID;
  };

  if (typeof globalWithCrypto.crypto?.randomUUID === "function") {
    return globalWithCrypto.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};

const updateSessionById = (
  sessions: CookingSession[],
  sessionId: CookingSession["id"],
  updateSession: (session: CookingSession) => CookingSession,
) =>
  sessions.map((session) =>
    session.id === sessionId ? updateSession(session) : session,
  );

const buildSession = (
  title: string | undefined,
  timestamp: ISODateString,
): CookingSession => ({
  id: createId(),
  title: title?.trim() || defaultSessionTitle,
  status: "draft",
  dishes: [],
  createdAt: timestamp,
  updatedAt: timestamp,
});

const buildDish = (
  sessionId: CookingSession["id"],
  dishInput: DishInput,
  timestamp: ISODateString,
): Dish => ({
  id: createId(),
  sessionId,
  name: dishInput.name,
  totalMinutes: dishInput.totalMinutes,
  stages: [],
  note: dishInput.note,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const buildStage = (
  dishId: Dish["id"],
  stageInput: StageInput,
  fallbackOrder: number,
  timestamp: ISODateString,
): CookingStage => ({
  id: createId(),
  dishId,
  title: stageInput.title,
  actionType: stageInput.actionType,
  status: stageInput.status ?? "pending",
  offsetMinutes: stageInput.offsetMinutes,
  order: stageInput.order ?? fallbackOrder,
  notificationEnabled: stageInput.notificationEnabled ?? true,
  durationMinutes: stageInput.durationMinutes,
  heatLevel: stageInput.heatLevel,
  note: stageInput.note,
  scheduledAt: stageInput.scheduledAt,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const resetStage = (
  stage: CookingStage,
  timestamp: ISODateString,
): CookingStage => ({
  ...stage,
  status: "pending",
  scheduledAt: undefined,
  startedAt: undefined,
  completedAt: undefined,
  updatedAt: timestamp,
});

const resetDish = (dish: Dish, timestamp: ISODateString): Dish => ({
  ...dish,
  startedAt: undefined,
  completedAt: undefined,
  stages: dish.stages.map((stage) => resetStage(stage, timestamp)),
  updatedAt: timestamp,
});

export const useCookingStore = create<CookingStoreState>((set, get) => ({
  sessions: [],

  createSession: (title) => {
    const timestamp = now();
    const session = buildSession(title, timestamp);

    set((state) => ({
      sessions: [...state.sessions, session],
    }));

    return session;
  },

  startSession: (sessionId) => {
    const timestamp = now();

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (session) => ({
        ...session,
        status: "active",
        startedAt: session.startedAt ?? timestamp,
        pausedAt: undefined,
        finishedAt: undefined,
        updatedAt: timestamp,
      })),
    }));
  },

  pauseSession: (sessionId) => {
    const timestamp = now();

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (session) => ({
        ...session,
        status: "paused",
        pausedAt: timestamp,
        updatedAt: timestamp,
      })),
    }));
  },

  resumeSession: (sessionId) => {
    const timestamp = now();

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (session) => ({
        ...session,
        status: "active",
        pausedAt: undefined,
        updatedAt: timestamp,
      })),
    }));
  },

  completeSession: (sessionId) => {
    const timestamp = now();

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (session) => ({
        ...session,
        status: "finished",
        pausedAt: undefined,
        finishedAt: timestamp,
        updatedAt: timestamp,
      })),
    }));
  },

  resetSession: (sessionId) => {
    const timestamp = now();

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (session) => ({
        ...session,
        status: "draft",
        startedAt: undefined,
        pausedAt: undefined,
        finishedAt: undefined,
        dishes: session.dishes.map((dish) => resetDish(dish, timestamp)),
        updatedAt: timestamp,
      })),
    }));
  },

  deleteSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.filter((session) => session.id !== sessionId),
    }));
  },

  addDish: (sessionId, dishInput) => {
    const session = get().getSessionById(sessionId);

    if (!session) {
      return undefined;
    }

    const timestamp = now();
    const dish = buildDish(sessionId, dishInput, timestamp);

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (current) => ({
        ...current,
        dishes: [...current.dishes, dish],
        updatedAt: timestamp,
      })),
    }));

    return dish;
  },

  updateDish: (sessionId, dishId, updates) => {
    const timestamp = now();

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (session) => ({
        ...session,
        dishes: session.dishes.map((dish) =>
          dish.id === dishId
            ? {
                ...dish,
                ...updates,
                updatedAt: timestamp,
              }
            : dish,
        ),
        updatedAt: timestamp,
      })),
    }));
  },

  removeDish: (sessionId, dishId) => {
    const timestamp = now();

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (session) => ({
        ...session,
        dishes: session.dishes.filter((dish) => dish.id !== dishId),
        updatedAt: timestamp,
      })),
    }));
  },

  addStage: (sessionId, dishId, stageInput) => {
    const dish = get()
      .getSessionById(sessionId)
      ?.dishes.find((currentDish) => currentDish.id === dishId);

    if (!dish) {
      return undefined;
    }

    const timestamp = now();
    const stage = buildStage(
      dishId,
      stageInput,
      dish.stages.length,
      timestamp,
    );

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (session) => ({
        ...session,
        dishes: session.dishes.map((currentDish) =>
          currentDish.id === dishId
            ? {
                ...currentDish,
                stages: [...currentDish.stages, stage],
                updatedAt: timestamp,
              }
            : currentDish,
        ),
        updatedAt: timestamp,
      })),
    }));

    return stage;
  },

  updateStage: (sessionId, dishId, stageId, updates) => {
    const timestamp = now();

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (session) => ({
        ...session,
        dishes: session.dishes.map((dish) =>
          dish.id === dishId
            ? {
                ...dish,
                stages: dish.stages.map((stage) =>
                  stage.id === stageId
                    ? {
                        ...stage,
                        ...updates,
                        updatedAt: timestamp,
                      }
                    : stage,
                ),
                updatedAt: timestamp,
              }
            : dish,
        ),
        updatedAt: timestamp,
      })),
    }));
  },

  completeStage: (sessionId, dishId, stageId) => {
    const timestamp = now();

    get().updateStage(sessionId, dishId, stageId, {
      status: "completed",
      completedAt: timestamp,
    });
  },

  uncompleteStage: (sessionId, dishId, stageId) => {
    get().updateStage(sessionId, dishId, stageId, {
      status: "pending",
      completedAt: undefined,
    });
  },

  removeStage: (sessionId, dishId, stageId) => {
    const timestamp = now();

    set((state) => ({
      sessions: updateSessionById(state.sessions, sessionId, (session) => ({
        ...session,
        dishes: session.dishes.map((dish) =>
          dish.id === dishId
            ? {
                ...dish,
                stages: dish.stages.filter((stage) => stage.id !== stageId),
                updatedAt: timestamp,
              }
            : dish,
        ),
        updatedAt: timestamp,
      })),
    }));
  },

  getActiveSession: () =>
    get().sessions.find((session) => session.status === "active"),

  getSessionById: (sessionId) =>
    get().sessions.find((session) => session.id === sessionId),
}));

export type {
  CookingStoreState,
  DishInput,
  DishUpdates,
  StageInput,
  StageUpdates,
};
