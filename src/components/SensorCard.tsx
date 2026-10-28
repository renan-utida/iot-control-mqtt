import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../themes/ThemeContext';
import type { TimedValue } from '../types/mqtt';
import { withAlpha } from '../utils/color';
import { formatNumber, formatTime } from '../utils/format';
import { Icon } from './Icon';
import type { IconName } from './Icon';

interface SensorCardProps {
  icon: IconName;
  title: string;
  unit: string;
  reading: TimedValue<number> | null;
  color: string;
  // Faixa usada só para desenhar o medidor.
  min: number;
  max: number;
}

export function SensorCard({ icon, title, unit, reading, color, min, max }: SensorCardProps) {
  const { colors } = useTheme();

  const valueText = reading ? `${formatNumber(reading.value)} ${unit}` : `-- ${unit}`;
  const updatedText = reading
    ? `Atualizado às ${formatTime(reading.updatedAt)}`
    : 'Aguardando dados do sensor...';

  const ratio = reading ? Math.min(1, Math.max(0, (reading.value - min) / (max - min))) : 0;

  return (
    <View
      accessible
      accessibilityLabel={`${title}: ${valueText}. ${updatedText}`}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: colors.cardShadow },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.chip, { backgroundColor: withAlpha(color, 0.14) }]}>
          <Icon name={icon} color={color} size={20} />
        </View>
        <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      </View>

      <Text style={[styles.value, { color: colors.text }]} adjustsFontSizeToFit numberOfLines={1}>
        {reading ? formatNumber(reading.value) : '--'}
        <Text style={[styles.unit, { color: colors.textSecondary }]}>{` ${unit}`}</Text>
      </Text>

      <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
        <View style={[styles.fill, { backgroundColor: color, width: `${Math.round(ratio * 100)}%` }]} />
      </View>

      <Text style={[styles.updatedAt, { color: colors.muted }]}>{updatedText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  value: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  updatedAt: {
    fontSize: 12,
  },
});
