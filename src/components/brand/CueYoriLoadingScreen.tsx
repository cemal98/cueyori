import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";

import { colors } from "../../theme";

const splashBase = require("../../../assets/brand/cueyori-splash-lockup-base.png");
const splashHeat = require("../../../assets/brand/cueyori-splash-lockup-heat.png");

const splashSize = Image.resolveAssetSource(splashBase);
const splashAspectRatio = splashSize.width / splashSize.height;

export function CueYoriLoadingScreen() {
  const heatProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const heatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(heatProgress, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(heatProgress, {
          toValue: 0,
          duration: 720,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    heatAnimation.start();

    return () => {
      heatAnimation.stop();
    };
  }, [heatProgress]);

  const heatOpacity = heatProgress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0.42, 1, 0.62],
  });

  const heatTranslateY = heatProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [7, -12],
  });

  const heatScale = heatProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1.05],
  });

  return (
    <View style={styles.screen}>
      <View
        accessibilityLabel="CueYori loading"
        accessibilityRole="image"
        style={styles.lockup}
      >
        <Image
          resizeMode="contain"
          source={splashBase}
          style={styles.layer}
        />
        <Animated.Image
          resizeMode="contain"
          source={splashHeat}
          style={[
            styles.layer,
            styles.heatLayer,
            {
              opacity: heatOpacity,
              transform: [
                { translateY: heatTranslateY },
                { scale: heatScale },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  lockup: {
    width: "82%",
    maxWidth: 340,
    aspectRatio: splashAspectRatio,
  },
  layer: {
    width: "100%",
    height: "100%",
  },
  heatLayer: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
