import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { AppText, Button, Card, Screen } from "../src/components";
import {
  usePreferencesStore,
  type LanguageCode,
  type ThemePreference,
} from "../src/features/preferences";
import { useTranslation } from "../src/i18n";
import type { TranslationKey } from "../src/i18n";
import { colors, radii, spacing } from "../src/theme";

const themeOptions: ThemePreference[] = ["system", "light", "dark"];
const languageOptions: LanguageCode[] = ["en", "tr"];
const themeLabelKeys: Record<ThemePreference, TranslationKey> = {
  system: "settings.theme.system",
  light: "settings.theme.light",
  dark: "settings.theme.dark",
};

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = usePreferencesStore((state) => state.language);
  const themePreference = usePreferencesStore((state) => state.themePreference);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);
  const setThemePreference = usePreferencesStore(
    (state) => state.setThemePreference,
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Screen>
      <View style={styles.header}>
        <Button onPress={handleBack} title={t("action.back")} variant="ghost" />
        <View style={styles.titleStack}>
          <AppText variant="title">{t("settings.title")}</AppText>
          <AppText tone="secondary">{t("settings.subtitle")}</AppText>
        </View>
      </View>

      <Card>
        <View style={styles.settingStack}>
          <AppText variant="headline">{t("settings.theme")}</AppText>
          <View style={styles.segmentedControl}>
            {themeOptions.map((option) => (
              <PreferenceOption
                isSelected={option === themePreference}
                key={option}
                label={t(themeLabelKeys[option])}
                onPress={() => {
                  setThemePreference(option);
                }}
              />
            ))}
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.settingStack}>
          <AppText variant="headline">{t("settings.language")}</AppText>
          <View style={styles.segmentedControl}>
            {languageOptions.map((option) => (
              <PreferenceOption
                isSelected={option === language}
                key={option}
                label={
                  option === "en"
                    ? t("settings.language.english")
                    : t("settings.language.turkish")
                }
                onPress={() => {
                  setLanguage(option);
                }}
              />
            ))}
          </View>
        </View>
      </Card>
    </Screen>
  );
}

type PreferenceOptionProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

function PreferenceOption({
  label,
  isSelected,
  onPress,
}: PreferenceOptionProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        isSelected && styles.optionSelected,
        pressed && styles.optionPressed,
      ]}
    >
      <AppText
        align="center"
        tone={isSelected ? "inverse" : "accent"}
        variant="label"
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xl,
  },
  titleStack: {
    gap: spacing.sm,
  },
  settingStack: {
    gap: spacing.lg,
  },
  segmentedControl: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  option: {
    minHeight: 44,
    minWidth: 96,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.accentDark,
    backgroundColor: colors.accentDark,
  },
  optionPressed: {
    opacity: 0.84,
  },
});
