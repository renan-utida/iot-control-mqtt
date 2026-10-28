import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '../themes/ThemeContext';
import { withAlpha } from '../utils/color';

type AppButtonVariant = 'primary' | 'secondary' | 'danger';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: AppButtonProps) {
  const { colors } = useTheme();

  const inactive = disabled || loading;
  const isPrimary = variant === 'primary';

  const backgroundColor = isPrimary
    ? colors.primary
    : variant === 'danger'
      ? withAlpha(colors.danger, 0.08)
      : colors.surfaceAlt;
  const borderColor = isPrimary ? colors.primary : variant === 'danger' ? colors.danger : colors.border;
  const textColor = isPrimary ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor },
        isPrimary && !inactive ? { boxShadow: `0px 6px 14px 0px ${withAlpha(colors.primary, 0.35)}` } : null,
        { opacity: inactive ? 0.5 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
