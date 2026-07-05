import * as Haptics from "expo-haptics";

export type HapticIntent = "selection" | "confirm" | "warning";

export const playHaptic = async (intent: HapticIntent = "selection") => {
  try {
    if (intent === "confirm") {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
      return;
    }

    if (intent === "warning") {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning,
      );
      return;
    }

    await Haptics.selectionAsync();
  } catch {
    // Haptics can be unavailable in simulators or low-power device states.
  }
};
