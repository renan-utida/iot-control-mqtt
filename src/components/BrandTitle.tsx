import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../themes/ThemeContext';

// Título do cabeçalho do Painel: nome do app com a marca Lumen logo abaixo.
export function BrandTitle() {
  const { colors } = useTheme();

  return (
    <View accessible accessibilityRole="header" accessibilityLabel="IoT Control, da Lumen">
      <Text style={[styles.title, { color: colors.text }]}>IoT Control</Text>
      <Text style={[styles.brand, { color: colors.accent }]}>LUMEN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  brand: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    lineHeight: 12,
  },
});
