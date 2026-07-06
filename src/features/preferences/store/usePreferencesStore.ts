import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { fileStorage } from "../../../services/storage/fileStorage";
import type { LanguageCode, ThemePreference } from "../types/preferences.types";

export type PreferencesStoreState = {
  language: LanguageCode;
  themePreference: ThemePreference;
  hasHydrated: boolean;
  setLanguage: (language: LanguageCode) => void;
  setThemePreference: (themePreference: ThemePreference) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

const applyThemePreference = (themePreference: ThemePreference) => {
  Appearance.setColorScheme(
    themePreference === "system" ? null : themePreference,
  );
};

export const usePreferencesStore = create<PreferencesStoreState>()(
  persist(
    (set) => ({
      language: "en",
      themePreference: "system",
      hasHydrated: false,
      setLanguage: (language) => {
        set({ language });
      },
      setThemePreference: (themePreference) => {
        applyThemePreference(themePreference);
        set({ themePreference });
      },
      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
    }),
    {
      name: "cueyori-preferences",
      storage: createJSONStorage(() => fileStorage),
      partialize: (state) => ({
        language: state.language,
        themePreference: state.themePreference,
      }),
      onRehydrateStorage: () => (state) => {
        applyThemePreference(state?.themePreference ?? "system");
        state?.setHasHydrated(true);
      },
    },
  ),
);
