import type { ConfigContext, ExpoConfig } from "expo/config";

const appVersion = "0.1.0";
const iosBuildNumber = "1";
const androidVersionCode = 1;
const bundleIdentifier = "com.bydemirel.cueyori";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "CueYori",
  slug: "cueyori",
  version: appVersion,
  description:
    "An iOS-first cooking workflow assistant for coordinating multiple dishes.",
  scheme: "cueyori",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  primaryColor: "#c7663a",
  icon: "./assets/brand/cueyori-app-icon.png",
  splash: {
    image: "./assets/brand/cueyori-splash-source.png",
    resizeMode: "contain",
    backgroundColor: "#f6efe5",
  },
  assetBundlePatterns: ["**/*"],
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/brand/cueyori-splash-source.png",
        imageWidth: 260,
        resizeMode: "contain",
        backgroundColor: "#f6efe5",
        dark: {
          image: "./assets/brand/cueyori-app-icon.png",
          backgroundColor: "#15110f",
        },
      },
    ],
    [
      "expo-notifications",
      {
        color: "#8f3f22",
        defaultChannel: "cooking-cues",
        enableBackgroundRemoteNotifications: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  ios: {
    ...config.ios,
    icon: "./assets/brand/cueyori-app-icon.png",
    supportsTablet: true,
    bundleIdentifier,
    buildNumber: iosBuildNumber,
  },
  android: {
    ...config.android,
    package: bundleIdentifier,
    versionCode: androidVersionCode,
    adaptiveIcon: {
      foregroundImage: "./assets/brand/cueyori-app-icon.png",
      backgroundColor: "#15110f",
    },
  },
  web: {
    ...config.web,
    bundler: "metro",
    favicon: "./assets/brand/cueyori-app-icon.png",
  },
});
