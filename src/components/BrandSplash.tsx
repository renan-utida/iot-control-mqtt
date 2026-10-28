import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../themes/ThemeContext';
import { LumenLogo } from './LumenLogo';

interface BrandSplashProps {
  message?: string;
}

// Tela de carregamento com a marca.
export function BrandSplash({ message }: BrandSplashProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LumenLogo size={84} />
      <Text style={[styles.title, { color: colors.text }]}>IoT Control</Text>
      <Text style={[styles.brand, { color: colors.accent }]}>LUMEN</Text>
      <ActivityIndicator style={styles.spinner} size="small" color={colors.accent} />
      {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    marginTop: 14,
    fontSize: 26,
    fontWeight: '800',
  },
  brand: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
  },
  spinner: {
    marginTop: 22,
  },
  message: {
    fontSize: 14,
    marginTop: 6,
  },
});
