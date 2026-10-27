import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../themes/ThemeContext';
import type { TimedValue } from '../types/mqtt';
import { formatNumber, formatTime } from '../utils/format';

interface SensorCardProps {
  icon: string;
  title: string;
  unit: string;
  reading: TimedValue<number> | null;
}

export function SensorCard({ icon, title, unit, reading }: SensorCardProps) {
  const { colors } = useTheme();

  const valueText = reading ? `${formatNumber(reading.value)} ${unit}` : `-- ${unit}`;
  const updatedText = reading
    ? `Atualizado às ${formatTime(reading.updatedAt)}`
    : 'Aguardando dados do sensor...';

  return (
    <View
      accessible
      accessibilityLabel={`${title}: ${valueText}. ${updatedText}`}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      </View>

      <Text style={[styles.value, { color: colors.text }]} adjustsFontSizeToFit numberOfLines={1}>
        {valueText}
      </Text>

      <Text style={[styles.updatedAt, { color: colors.muted }]}>{updatedText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
  },
  updatedAt: {
    fontSize: 12,
  },
});
