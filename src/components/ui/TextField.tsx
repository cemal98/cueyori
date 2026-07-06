import type { KeyboardTypeOptions, TextInputProps } from "react-native";
import { StyleSheet, TextInput, View } from "react-native";

import { colors, radii, spacing, useThemeColors } from "../../theme";
import { AppText } from "./AppText";

type TextFieldProps = Omit<
  TextInputProps,
  "keyboardType" | "placeholderTextColor" | "style" | "value"
> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
};

export function TextField({
  label,
  value,
  onChangeText,
  error,
  keyboardType = "default",
  ...inputProps
}: TextFieldProps) {
  const themeColors = useThemeColors();

  return (
    <View style={styles.stack}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error}
        accessibilityState={{
          disabled: inputProps.editable === false,
        }}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholderTextColor={colors.charcoalSubtle}
        selectionColor={colors.accent}
        style={[
          styles.input,
          {
            borderColor: error
              ? themeColors.accentDark
              : themeColors.borderStrong,
          },
        ]}
        value={value}
        {...inputProps}
      />
      {error ? (
        <AppText tone="accent" variant="caption">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 54,
    borderRadius: radii.md,
    borderWidth: 1.2,
    backgroundColor: colors.surface,
    color: colors.charcoal,
    fontSize: 17,
    lineHeight: 23,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
