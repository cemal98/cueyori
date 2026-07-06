import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { brand, colors } from "../../theme";
import { useTranslation } from "../../i18n";

const splashBase = require("../../../assets/brand/cueyori-splash-lockup-base.png");
const splashHeat = require("../../../assets/brand/cueyori-splash-lockup-heat.png");

const splashSize = Image.resolveAssetSource(splashBase);
const splashAspectRatio = splashSize.width / splashSize.height;

const splashIntroDurationMs = 420;
const splashHoldDurationMs = 700;
const splashExitFadeDurationMs = 260;

type CueYoriLoadingScreenProps = {
  onFinish?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function CueYoriLoadingScreen({
  onFinish,
  style,
}: CueYoriLoadingScreenProps) {
  const { t } = useTranslation();
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const lockupOpacity = useRef(new Animated.Value(0)).current;
  const lockupScale = useRef(new Animated.Value(0.9)).current;
  const heatProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const introAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(lockupOpacity, {
          toValue: 1,
          duration: splashIntroDurationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(lockupScale, {
          toValue: 1,
          duration: splashIntroDurationMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(splashHoldDurationMs),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: splashExitFadeDurationMs,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    introAnimation.start(({ finished }) => {
      if (finished) {
        onFinish?.();
      }
    });

    return () => {
      introAnimation.stop();
    };
  }, [lockupOpacity, lockupScale, onFinish, screenOpacity]);

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
    <Animated.View
      style={[
        styles.screen,
        style,
        {
          opacity: screenOpacity,
        },
      ]}
    >
      <Animated.View
        accessibilityLabel={t("app.loading")}
        accessibilityRole="image"
        style={[
          styles.lockup,
          {
            opacity: lockupOpacity,
            transform: [{ scale: lockupScale }],
          },
        ]}
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
      </Animated.View>
    </Animated.View>
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
