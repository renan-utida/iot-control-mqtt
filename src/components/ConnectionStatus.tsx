import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../themes/ThemeContext';
import type { ThemeColors } from '../themes/colors';
import type { ConnectionStatus as Status } from '../types/mqtt';
import { withAlpha } from '../utils/color';

interface ConnectionStatusProps {
  status: Status;
  detail?: string | null;
  brokerUrl?: string;
}

const LABELS: Record<Status, string> = {
  connecting: 'Conectando...',
  connected: 'Conectado',
  disconnected: 'Desconectado',
  error: 'Erro de conexão',
};

function statusColor(status: Status, colors: ThemeColors): string {
  switch (status) {
    case 'connected':
      return colors.success;
    case 'connecting':
      return colors.warning;
    case 'error':
      return colors.danger;
    default:
      return colors.muted;
  }
}

export function ConnectionStatus({ status, detail, brokerUrl }: ConnectionStatusProps) {
  const { colors } = useTheme();
  const color = statusColor(status, colors);

  return (
    <View
      accessible
      accessibilityLabel={`Status da conexão: ${LABELS[status]}${detail ? `. ${detail}` : ''}`}
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border, boxShadow: colors.cardShadow },
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.pill,
            { backgroundColor: withAlpha(color, 0.14), borderColor: withAlpha(color, 0.4) },
          ]}
        >
          {status === 'connecting' ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <View style={[styles.dot, { backgroundColor: color }]} />
          )}
          <Text style={[styles.label, { color }]}>{LABELS[status]}</Text>
        </View>

      </View>

      {detail ? (
        <Text style={[styles.detail, { color: status === 'error' ? colors.danger : colors.textSecondary }]}>
          {detail}
        </Text>
      ) : null}

      {brokerUrl ? (
        <Text style={[styles.broker, { color: colors.muted }]} numberOfLines={1}>
          {brokerUrl}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  broker: {
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  detail: {
    fontSize: 13,
  },
});
