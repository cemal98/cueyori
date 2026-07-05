import { StyleSheet, View } from "react-native";

import { colors, spacing } from "../../theme";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Card } from "./Card";

type StateCardTone = "empty" | "loading" | "error";

type StateCardProps = {
  title: string;
  message: string;
  tone?: StateCardTone;
  actionTitle?: string;
  onActionPress?: () => void;
};

export function StateCard({
  title,
  message,
  tone = "empty",
  actionTitle,
  onActionPress,
}: StateCardProps) {
  const isError = tone === "error";

  return (
    <Card tone={isError ? "accent" : "muted"}>
      <View style={styles.stack}>
        <View style={styles.copy}>
          <AppText
            align="center"
            tone={isError ? "accent" : "primary"}
            variant="headline"
          >
            {title}
          </AppText>
          <AppText align="center" tone="secondary" variant="body">
            {message}
          </AppText>
        </View>

        {tone === "loading" ? (
          <View
            accessibilityLabel="Loading"
            accessibilityRole="progressbar"
            style={styles.skeletonStack}
          >
            <View style={[styles.skeletonLine, styles.skeletonWide]} />
            <View style={styles.skeletonLine} />
          </View>
        ) : null}

        {actionTitle && onActionPress ? (
          <Button
            accessibilityHint={message}
            haptic={isError ? "warning" : "selection"}
            onPress={onActionPress}
            title={actionTitle}
            variant={isError ? "ghost" : "secondary"}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    alignItems: "center",
    gap: spacing.xl,
    paddingVertical: spacing.xl,
  },
  copy: {
    gap: spacing.sm,
    maxWidth: 360,
  },
  skeletonStack: {
    width: "100%",
    gap: spacing.sm,
  },
  skeletonLine: {
    height: 12,
    width: "54%",
    alignSelf: "center",
    borderRadius: 6,
    backgroundColor: colors.accentSoft,
    opacity: 0.62,
  },
  skeletonWide: {
    width: "74%",
  },
});
