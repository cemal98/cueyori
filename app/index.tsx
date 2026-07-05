import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CueYoriLoadingScreen } from "../src/components/brand/CueYoriLoadingScreen";

const loadingIntroDurationMs = 2600;

export default function HomeScreen() {
  const [isLoadingIntroVisible, setIsLoadingIntroVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoadingIntroVisible(false);
    }, loadingIntroDurationMs);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (isLoadingIntroVisible) {
    return <CueYoriLoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CueYori</Text>
      <Text style={styles.subtitle}>
        Cook everything. Right on cue.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0a",
    paddingHorizontal: 24,
  },
  title: {
    color: "#fafaf9",
    fontSize: 48,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    color: "#d6d3d1",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
});
