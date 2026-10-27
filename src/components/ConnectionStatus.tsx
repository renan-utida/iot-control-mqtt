import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../themes/ThemeContext';
import type { ThemeColors } from '../themes/colors';
import type { ConnectionStatus as Status } from '../types/mqtt';

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
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.row}>
        {status === 'connecting' ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <View style={[styles.dot, { backgroundColor: color }]} />
        )}
        <Text style={[styles.label, { color }]}>{LABELS[status]}</Text>
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
  },
  detail: {
    fontSize: 14,
  },
  broker: {
    fontSize: 12,
  },
});
