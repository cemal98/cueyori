import { useMemo } from "react";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";

import { useTranslation, type TranslationKey } from "../../i18n";
import { colors, radii, spacing } from "../../theme";
import { AppText } from "../ui/AppText";

type MenuRoute = "/" | "/recipe-book" | "/settings";

type MenuItem = {
  route: MenuRoute;
  labelKey: TranslationKey;
};

const menuItems: MenuItem[] = [
  {
    route: "/",
    labelKey: "navigation.home",
  },
  {
    route: "/recipe-book",
    labelKey: "navigation.recipeBook",
  },
  {
    route: "/settings",
    labelKey: "navigation.settings",
  },
];

const visibleRoutes = new Set<string>(["/", "/recipe-book", "/settings"]);

export function MobileMenuBar() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === "dark";

  const isVisible = visibleRoutes.has(pathname);
  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: isDark
          ? "rgba(33, 27, 23, 0.78)"
          : "rgba(255, 250, 242, 0.78)",
        borderColor: isDark
          ? "rgba(240, 160, 111, 0.26)"
          : "rgba(143, 63, 34, 0.22)",
      },
    ],
    [isDark],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={containerStyle}>
        {menuItems.map((item) => {
          const isActive = pathname === item.route;

          return (
            <Pressable
              accessibilityLabel={t(item.labelKey)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              hitSlop={8}
              key={item.route}
              onPress={() => {
                if (!isActive) {
                  router.push(item.route);
                }
              }}
              style={({ pressed }) => [
                styles.item,
                isActive && styles.itemActive,
                pressed && !isActive && styles.itemPressed,
              ]}
            >
              <View style={[styles.indicator, isActive && styles.indicatorActive]} />
              <AppText
                align="center"
                numberOfLines={1}
                tone={isActive ? "accent" : "secondary"}
                variant="caption"
              >
                {t(item.labelKey)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    left: spacing.xl,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: 420,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.pill,
    padding: spacing.sm,
  },
  item: {
    minHeight: 48,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
  itemActive: {
    backgroundColor: colors.surface,
  },
  itemPressed: {
    opacity: 0.72,
  },
  indicator: {
    width: 18,
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: "transparent",
  },
  indicatorActive: {
    backgroundColor: colors.accentDark,
  },
});
