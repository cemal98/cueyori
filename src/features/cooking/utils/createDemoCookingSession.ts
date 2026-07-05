import {
  useCookingStore,
  type DishInput,
  type StageInput,
} from "../store/useCookingStore";
import { finishCookingSession, startCookingSession } from "./sessionCommands";

type DemoDish = {
  dish: DishInput;
  stages: StageInput[];
};

const demoDishes: DemoDish[] = [
  {
    dish: {
      name: "Chicken",
      totalMinutes: 42,
      note: "Pan seared chicken with a short rest.",
    },
    stages: [
      {
        title: "Season chicken",
        actionType: "prep",
        offsetMinutes: 0,
        durationMinutes: 5,
        heatLevel: "off",
      },
      {
        title: "Start searing chicken",
        actionType: "start",
        offsetMinutes: 6,
        durationMinutes: 6,
        heatLevel: "medium_high",
      },
      {
        title: "Flip chicken",
        actionType: "flip",
        offsetMinutes: 12,
        durationMinutes: 5,
        heatLevel: "medium_high",
      },
      {
        title: "Lower heat and cover",
        actionType: "lower_heat",
        offsetMinutes: 18,
        durationMinutes: 16,
        heatLevel: "medium_low",
      },
      {
        title: "Rest chicken",
        actionType: "rest",
        offsetMinutes: 34,
        durationMinutes: 8,
        heatLevel: "off",
      },
      {
        title: "Slice chicken",
        actionType: "finish",
        offsetMinutes: 42,
        heatLevel: "off",
      },
    ],
  },
  {
    dish: {
      name: "Rice",
      totalMinutes: 28,
      note: "Simmered rice timed to finish with the main dish.",
    },
    stages: [
      {
        title: "Rinse rice",
        actionType: "prep",
        offsetMinutes: 0,
        durationMinutes: 4,
        heatLevel: "off",
      },
      {
        title: "Bring rice to boil",
        actionType: "start",
        offsetMinutes: 4,
        durationMinutes: 6,
        heatLevel: "high",
      },
      {
        title: "Lower rice to simmer",
        actionType: "lower_heat",
        offsetMinutes: 10,
        durationMinutes: 14,
        heatLevel: "low",
      },
      {
        title: "Fluff rice",
        actionType: "stir",
        offsetMinutes: 24,
        durationMinutes: 4,
        heatLevel: "off",
      },
      {
        title: "Rice ready",
        actionType: "finish",
        offsetMinutes: 28,
        heatLevel: "off",
      },
    ],
  },
  {
    dish: {
      name: "Pasta",
      totalMinutes: 18,
      note: "Simple pasta with a late check before draining.",
    },
    stages: [
      {
        title: "Salt pasta water",
        actionType: "prep",
        offsetMinutes: 0,
        durationMinutes: 6,
        heatLevel: "high",
      },
      {
        title: "Add pasta",
        actionType: "add_ingredient",
        offsetMinutes: 6,
        durationMinutes: 2,
        heatLevel: "high",
      },
      {
        title: "Stir pasta",
        actionType: "stir",
        offsetMinutes: 8,
        durationMinutes: 7,
        heatLevel: "high",
      },
      {
        title: "Check pasta texture",
        actionType: "check",
        offsetMinutes: 15,
        durationMinutes: 3,
        heatLevel: "medium_high",
      },
      {
        title: "Drain pasta",
        actionType: "remove_from_heat",
        offsetMinutes: 18,
        heatLevel: "off",
      },
    ],
  },
];

export const createDemoCookingSession = async (): Promise<void> => {
  const currentStore = useCookingStore.getState();
  const activeSessionIds = currentStore.sessions
    .filter((session) => session.status === "active")
    .map((session) => session.id);

  await Promise.all(activeSessionIds.map(finishCookingSession));

  const session = useCookingStore
    .getState()
    .createSession("Dinner Coordination");

  demoDishes.forEach(({ dish, stages }) => {
    const createdDish = useCookingStore.getState().addDish(session.id, dish);

    if (!createdDish) {
      return;
    }

    stages.forEach((stage, order) => {
      useCookingStore.getState().addStage(session.id, createdDish.id, {
        ...stage,
        order,
      });
    });
  });

  await startCookingSession(session.id);
};
