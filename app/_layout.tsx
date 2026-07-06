import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { usePreferencesStore } from "../src/features/preferences";
import { colors } from "../src/theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  usePreferencesStore((state) => state.themePreference);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
