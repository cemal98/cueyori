import type { KeyboardTypeOptions, TextInputProps } from "react-native";
import { StyleSheet, TextInput, View } from "react-native";

import { colors, radii, spacing } from "../../theme";
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
  return (
    <View style={styles.stack}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholderTextColor={colors.charcoalSubtle}
        selectionColor={colors.accent}
        style={[styles.input, error && styles.inputError]}
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
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.charcoal,
    fontSize: 17,
    lineHeight: 23,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputError: {
    borderColor: colors.accentDark,
  },
});
