import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { useTranslation, type TranslationKey } from "../../i18n";
import { colors, radii, spacing, useThemeColors } from "../../theme";
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

const isRouteActive = (pathname: string, route: MenuRoute) =>
  route === "/" ? pathname === "/" : pathname === route;

export function MobileMenuBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const themeColors = useThemeColors();

  const isVisible = visibleRoutes.has(pathname);

  if (!isVisible) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={[styles.container, { borderColor: themeColors.borderStrong }]}>
        {menuItems.map((item) => {
          const isActive = isRouteActive(pathname, item.route);

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
                isActive && [
                  styles.itemActive,
                  { shadowColor: themeColors.borderStrong },
                ],
                pressed && !isActive && styles.itemPressed,
              ]}
            >
              {isActive ? (
                <View
                  pointerEvents="none"
                  style={[
                    styles.itemActiveOutline,
                    { borderColor: themeColors.borderStrong },
                  ]}
                />
              ) : null}
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
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
  },
  item: {
    minHeight: 48,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "transparent",
    paddingHorizontal: spacing.sm,
  },
  itemPressed: {
    opacity: 0.72,
  },
  itemActive: {
    backgroundColor: colors.surface,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  itemActiveOutline: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.pill,
    borderWidth: 2,
    zIndex: 1,
  },
  indicator: {
    width: 18,
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  indicatorActive: {
    backgroundColor: colors.accentDark,
  },
});
